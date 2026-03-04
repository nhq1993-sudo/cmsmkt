import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Ad, AdStatus, Comment, AdPlatform } from '@/types';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Globe,
  Wallet,
  Eye,
  FileText,
  Loader2,
  Target,
  Clock,
  Layers,
  User,
  ExternalLink as ExternalLinkIcon,
  Smartphone,
  AlertTriangle,
  History,
  MessageSquare,
  AlertCircle,
  Send,
  Mail
} from 'lucide-react';
import AdPreview from '../components/AdPreview';
import { BANK_LOGOS } from './AdsList';

// Email Server Config
const EMAIL_API = 'https://email-server-tv4o.onrender.com';

const sendEmail = async (endpoint: string, body: object) => {
  try {
    await fetch(`${EMAIL_API}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error('Send email error:', err);
  }
};

// --- SUB-COMPONENTS ---

const SidebarSectionHeader = ({ label, icon: Icon }: { label: string, icon: any }) => (
  <h3 className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest mb-2.5 flex items-center gap-2 border-b border-indigo-50 pb-1">
    <Icon size={14} /> {label}
  </h3>
);

const ClickableContentItem = ({ 
  label, value, field, link, isBold = true, large = false, customText,
  activeComment, isEditing, isApproved,
  onToggleEdit, onCommentChange, onAddComment, onResolveComment, commentText,
  compact = false
}: any) => {
  const finalLink = link || (typeof value === 'string' && value.startsWith('http') ? value : undefined);
  const partnerKey = (label === 'ĐỐI TÁC') ? value : null;

  return (
    <div className={`relative group/field transition-all border-2 rounded-xl flex flex-col ${
      compact ? 'p-1.5' : 'p-2.5'
    } ${
      activeComment ? 'bg-rose-50/50 border-rose-200' : isEditing ? 'bg-indigo-50 border-indigo-200' : 'border-transparent'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
            {label}
            {activeComment && <AlertCircle size={10} className="text-rose-500" />}
          </p>
          {finalLink ? (
            <a 
              href={finalLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`flex items-center gap-1 transition-colors group/link ${large ? 'text-lg' : 'text-[12px]'} ${isBold ? 'font-extrabold' : 'font-semibold'} text-indigo-600 hover:text-indigo-800 underline decoration-indigo-200 underline-offset-2 w-fit max-w-full`}
            >
              <span className="break-all whitespace-pre-wrap leading-tight">{customText || value}</span>
              <ExternalLinkIcon size={large ? 14 : 10} className="flex-shrink-0 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
            </a>
          ) : (
            <div className="flex items-center gap-1.5">
              {partnerKey && BANK_LOGOS[partnerKey] && (
                <img src={BANK_LOGOS[partnerKey]} className="w-3.5 h-3.5 object-contain shrink-0" alt="logo" />
              )}
              <p className={`${large ? 'text-lg' : 'text-[12px]'} ${isBold ? 'font-extrabold' : 'font-semibold'} text-slate-900 break-words leading-tight whitespace-pre-wrap`}>
                {value || '---'}
              </p>
            </div>
          )}
        </div>

        {!isApproved && field && (
          <button 
            onClick={() => onToggleEdit(field)}
            className={`p-1 rounded-lg transition-all shrink-0 ${isEditing ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover/field:opacity-100'}`}
          >
            <MessageSquare size={12} />
          </button>
        )}
      </div>

      {isEditing && (
        <div className="mt-2 flex gap-1.5 animate-in slide-in-from-top-1">
          <input 
            className="flex-1 bg-white border border-indigo-200 rounded-lg px-2 py-1 text-[10px] outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-900 placeholder:text-slate-400"
            placeholder="Ghi chú lỗi..."
            value={commentText}
            onChange={(e) => onCommentChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddComment(field)}
            autoFocus
          />
          <button 
            onClick={() => onAddComment(field)}
            className="bg-indigo-600 text-white p-1 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Send size={12} />
          </button>
        </div>
      )}

      {activeComment && !isEditing && (
        <div className="mt-1.5 bg-white border border-rose-100 rounded-lg p-1.5 shadow-sm flex items-start justify-between gap-2 animate-in fade-in">
           <div className="flex gap-1.5">
              <div className="mt-0.5 shrink-0"><MessageSquare size={10} className="text-rose-500" /></div>
              <p className="text-[10px] font-bold text-rose-600 leading-tight">{activeComment.text}</p>
           </div>
           {!isApproved && (
             <button 
               onClick={() => onResolveComment(activeComment.id)}
               className="text-[9px] font-black uppercase text-slate-400 hover:text-emerald-600 shrink-0"
             >
               Xong
             </button>
           )}
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---

interface Props {
  ads: Ad[];
  onUpdate: (ad: Ad) => Promise<void>;
}

const AdDetail: React.FC<Props> = ({ ads, onUpdate }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ad = ads.find(a => a.id === id);
  
  const [showToast, setShowToast] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', sub: '' });

  const [activeCommentField, setActiveCommentField] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  if (!ad) return <div className="p-8 text-center text-slate-900 font-extrabold italic">Không tìm thấy mẫu quảng cáo.</div>;

  const isApproved = ad.status === AdStatus.APPROVED;
  const unresolvedComments = useMemo(() => ad.comments?.filter(c => !c.resolved) || [], [ad.comments]);

  const handleAddComment = async (field: string) => {
    if (!commentText.trim()) return;
    setIsUpdating(true);
    const newComment: Comment = {
      id: `cmt_${Date.now()}`,
      author: 'Reviewer',
      text: commentText,
      field: field,
      timestamp: new Date().toISOString(),
      resolved: false
    };
    const updatedAd: Ad = {
      ...ad,
      comments: [...(ad.comments || []), newComment],
      status: AdStatus.REJECTED
    };
    try {
      await onUpdate(updatedAd);
      const recipientEmail = ad.ownerEmail || `${ad.owner}@gmail.com`;
      await sendEmail('/api/send-comment', {
        to: recipientEmail,
        ownerName: ad.owner,
        adName: ad.adName,
        fieldName: field,
        comment: commentText
      });
      setCommentText('');
      setActiveCommentField(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    setIsUpdating(true);
    const updatedAd: Ad = {
      ...ad,
      comments: ad.comments.map(c => c.id === commentId ? { ...c, resolved: true } : c)
    };
    try {
      await onUpdate(updatedAd);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: AdStatus) => {
    if (isUpdating || (ad.status === AdStatus.APPROVED && newStatus === AdStatus.APPROVED)) return;
    setIsUpdating(true);
    const updatedAd: Ad = { 
      ...ad, 
      status: newStatus, 
      lastUpdated: new Date().toISOString(),
      version: ad.version + 1
    };
    try {
      await onUpdate(updatedAd);
      if (newStatus === AdStatus.APPROVED) {
        const recipientEmail = ad.ownerEmail || `${ad.owner}@gmail.com`;
        setToastMessage({ title: 'Đã phê duyệt!', sub: `Đang gửi email tới ${recipientEmail}...` });
        setShowToast(true);

        await sendEmail('/api/send-approval', {
          to: recipientEmail,
          ownerName: ad.owner,
          adName: ad.adName
        });

        setToastMessage({ title: 'Thành công!', sub: `Đã gửi email tới ${recipientEmail}` });
        setTimeout(() => setShowToast(false), 8000);
      } else if (newStatus === AdStatus.REJECTED) {
        navigate('/ads');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleEdit = (field: string) => {
    if (activeCommentField === field) {
      setActiveCommentField(null);
      setCommentText('');
    } else {
      setActiveCommentField(field);
      setCommentText('');
    }
  };

  const openPreview = () => {
    if (ad.content.previewLink) {
      window.open(ad.content.previewLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col animate-in fade-in duration-300 overflow-hidden bg-white">
      {showToast && (
        <div className="fixed top-6 right-6 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 border border-emerald-400 max-w-sm">
          <div className="bg-white/20 p-2 rounded-full flex-shrink-0"><Mail size={24} /></div>
          <div>
            <p className="text-sm font-black">{toastMessage.title}</p>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider leading-tight">{toastMessage.sub}</p>
          </div>
        </div>
      )}

      <div className="flex h-full">
        {/* SIDEBAR */}
        <aside className="w-72 border-r border-slate-100 bg-white flex flex-col p-5 overflow-y-auto scrollbar-hide shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/ads" className="p-2 -ml-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors"><ArrowLeft size={18} /></Link>
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm"><Smartphone size={16} /></div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">AdManager</h2>
          </div>

          <section className="mb-6">
            <SidebarSectionHeader label="KÊNH & PHÂN PHỐI" icon={Globe} />
            <div className="grid grid-cols-2 gap-1.5 mb-2">
               <ClickableContentItem label="KÊNH" value={ad.platform} field="platform" compact activeComment={unresolvedComments.find(c => c.field === 'platform')} isEditing={activeCommentField === 'platform'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
               <ClickableContentItem label="HÌNH THỨC" value={ad.adObjective} field="adObjective" compact activeComment={unresolvedComments.find(c => c.field === 'adObjective')} isEditing={activeCommentField === 'adObjective'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
            </div>
            <div className="space-y-1.5">
              <ClickableContentItem label="TÀI KHOẢN QC" value={ad.account} field="account" compact activeComment={unresolvedComments.find(c => c.field === 'account')} isEditing={activeCommentField === 'account'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
              <ClickableContentItem label="DỊCH VỤ" value={ad.serviceCategory} field="serviceCategory" compact activeComment={unresolvedComments.find(c => c.field === 'serviceCategory')} isEditing={activeCommentField === 'serviceCategory'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
              <ClickableContentItem label="ĐỐI TÁC" value={ad.partnerBank} field="partnerBank" compact activeComment={unresolvedComments.find(c => c.field === 'partnerBank')} isEditing={activeCommentField === 'partnerBank'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
            </div>
          </section>

          <section className="mb-6">
            <SidebarSectionHeader label="NHẮM MỤC TIÊU" icon={Target} />
            <div className="space-y-1.5">
              <ClickableContentItem label="ĐỘ TUỔI" value={ad.targetAudience.age} field="targetAudience.age" compact activeComment={unresolvedComments.find(c => c.field === 'targetAudience.age')} isEditing={activeCommentField === 'targetAudience.age'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
              <div className="p-2 rounded-xl bg-slate-50/30 border border-slate-100 flex flex-col justify-center">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 leading-none">SỞ THÍCH</p>
                <div className="flex flex-wrap gap-1">
                  {ad.targetAudience.interests.length > 0 ? ad.targetAudience.interests.map((int, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-white text-slate-600 rounded text-[9px] font-bold border border-slate-200 leading-none">{int}</span>
                  )) : <span className="text-[9px] text-slate-400 font-bold">---</span>}
                </div>
              </div>
              <ClickableContentItem label="CHI TIẾT" value={ad.targetAudience.detailedTargeting || '---'} field="targetAudience.detailedTargeting" compact activeComment={unresolvedComments.find(c => c.field === 'targetAudience.detailedTargeting')} isEditing={activeCommentField === 'targetAudience.detailedTargeting'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
            </div>
          </section>

          <section className="mb-6">
            <SidebarSectionHeader label="NGÂN SÁCH & LỊCH" icon={Wallet} />
            <div className="mb-2.5 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest leading-none mb-1">Budget</p>
                <p className="text-base font-black text-indigo-600 leading-none truncate">
                  {new Intl.NumberFormat('vi-VN').format(ad.budget)} <span className="text-[10px] font-extrabold uppercase">đ</span>
                </p>
              </div>
              <span className="text-[9px] bg-white border border-indigo-100 px-2 py-0.5 rounded text-indigo-600 font-black uppercase shrink-0 ml-1">{ad.budgetType}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <ClickableContentItem label="BẮT ĐẦU" value={ad.startDate} field="startDate" compact activeComment={unresolvedComments.find(c => c.field === 'startDate')} isEditing={activeCommentField === 'startDate'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
              <ClickableContentItem label="KẾT THÚC" value={ad.endDate} field="endDate" compact activeComment={unresolvedComments.find(c => c.field === 'endDate')} isEditing={activeCommentField === 'endDate'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
            </div>
          </section>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 bg-[#fcfcfd] overflow-y-auto p-6 scrollbar-hide">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between sticky top-0 bg-[#fcfcfd]/90 backdrop-blur-md py-3 z-40 border-b border-slate-100 -mx-4 px-4 mb-2">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{ad.status}</span>
                {unresolvedComments.length > 0 && <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle size={12} /> {unresolvedComments.length} Lỗi</span>}
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-tight leading-none">Version {ad.version} • {new Date(ad.lastUpdated).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {!isApproved && (
                  <>
                    <button disabled={isUpdating} onClick={() => handleStatusChange(AdStatus.REJECTED)} className="px-5 py-1.5 border border-slate-200 text-slate-600 hover:bg-white rounded-xl font-extrabold text-xs transition-all active:scale-95">Từ chối</button>
                    <button disabled={isUpdating || unresolvedComments.length > 0} onClick={() => handleStatusChange(AdStatus.APPROVED)} className="px-8 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50">
                      {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Duyệt & Gửi mail
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4"><Layers size={16} className="text-indigo-600" /> CẤU TRÚC CHIẾN DỊCH</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <ClickableContentItem label="CHIẾN DỊCH" value={ad.campaignName} link={ad.campaignLink} field="campaignName" activeComment={unresolvedComments.find(c => c.field === 'campaignName')} isEditing={activeCommentField === 'campaignName'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
                <ClickableContentItem label="NHÓM QUẢNG CÁO" value={ad.adGroupName} link={ad.adGroupLink} isBold={false} field="adGroupName" activeComment={unresolvedComments.find(c => c.field === 'adGroupName')} isEditing={activeCommentField === 'adGroupName'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
                <ClickableContentItem label="QUẢNG CÁO" value={ad.adName} link={ad.adLink} isBold={false} field="adName" activeComment={unresolvedComments.find(c => c.field === 'adName')} isEditing={activeCommentField === 'adName'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
                <ClickableContentItem label="PREVIEW ADS" value={ad.content.previewLink} field="content.previewLink" isBold={false} activeComment={unresolvedComments.find(c => c.field === 'content.previewLink')} isEditing={activeCommentField === 'content.previewLink'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm h-fit">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6"><FileText size={16} className="text-indigo-600" /> NỘI DUNG & LIÊN KẾT</h3>
                <div className="space-y-4">
                  <ClickableContentItem label="FANPAGE" value={ad.fanpage.name} icon={User} field="fanpage.name" activeComment={unresolvedComments.find(c => c.field === 'fanpage.name')} isEditing={activeCommentField === 'fanpage.name'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
                  <ClickableContentItem label="HEADLINE" value={ad.content.headline} field="content.headline" large activeComment={unresolvedComments.find(c => c.field === 'content.headline')} isEditing={activeCommentField === 'content.headline'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
                  <ClickableContentItem label="CAPTION" value={ad.content.caption} field="content.caption" isBold={false} activeComment={unresolvedComments.find(c => c.field === 'caption')} isEditing={activeCommentField === 'caption'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
                  <div className="grid grid-cols-2 gap-3">
                    <ClickableContentItem label="CTA" value={ad.content.cta} field="content.cta" activeComment={unresolvedComments.find(c => c.field === 'content.cta')} isEditing={activeCommentField === 'content.cta'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
                    <ClickableContentItem label="LINK ĐÍCH" value={ad.content.destinationUrl} field="content.destinationUrl" activeComment={unresolvedComments.find(c => c.field === 'content.destinationUrl')} isEditing={activeCommentField === 'content.destinationUrl'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-xl border border-dashed border-slate-200">
                    <ClickableContentItem label="NGUỒN TƯ LIỆU" value={ad.assetSource} icon={History} field="assetSource" activeComment={unresolvedComments.find(c => c.field === 'assetSource')} isEditing={activeCommentField === 'assetSource'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
                    <ClickableContentItem label="TIMELINE" value={ad.assetTimeline} icon={Clock} field="assetTimeline" activeComment={unresolvedComments.find(c => c.field === 'assetTimeline')} isEditing={activeCommentField === 'assetTimeline'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
                  </div>
                  <ClickableContentItem label="DEEPLINK" value={ad.content.deeplink} field="content.deeplink" activeComment={unresolvedComments.find(c => c.field === 'deeplink')} isEditing={activeCommentField === 'deeplink'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
                  <ClickableContentItem label="MEDIA SOURCE" value={ad.content.mediaUrl} customText={ad.content.mediaUrl ? "Mở link media" : undefined} icon={Eye} field="content.mediaUrl" activeComment={unresolvedComments.find(c => c.field === 'content.mediaUrl')} isEditing={activeCommentField === 'mediaUrl'} isApproved={isApproved} onToggleEdit={handleToggleEdit} onCommentChange={setCommentText} onAddComment={handleAddComment} onResolveComment={handleResolveComment} commentText={commentText} />
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-sm relative overflow-hidden h-fit">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-3"><div className="bg-rose-50 p-1 rounded-lg text-rose-600"><Eye size={14} /></div> AD PREVIEW</h3>
                  <div className="relative overflow-hidden rounded-xl border border-slate-100 shadow-inner bg-black/5">
                    {ad.content.previewLink ? (
                      <div className="relative group/overlay cursor-pointer" onClick={openPreview}>
                         <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/0 group-hover/overlay:bg-black/40 transition-all opacity-0 group-hover/overlay:opacity-100">
                            <div className="bg-white px-4 py-2 rounded-lg shadow-2xl flex items-center gap-2 transform translate-y-2 group-hover/overlay:translate-y-0 transition-all ring-4 ring-indigo-500/10">
                               <ExternalLinkIcon size={14} className="text-indigo-600" />
                               <span className="text-[10px] font-black text-slate-900 uppercase">Mở Preview Ads</span>
                            </div>
                         </div>
                         <div className="origin-top scale-[0.98]">
                            <AdPreview ad={ad} />
                         </div>
                      </div>
                    ) : (
                      <div className="origin-top scale-[0.98]">
                         <AdPreview ad={ad} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdDetail;
