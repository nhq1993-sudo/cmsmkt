
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, Globe, Facebook, Video, Info, Calendar, Target, 
  Building2, Briefcase, Eye, UserCircle, Search, 
  ChevronDown, CheckCircle2, 
  Layout, MousePointer2, Smartphone, Type, Link as LinkIcon,
  Activity, CopyPlus, Save, Loader2, MapPinned,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { Ad, AdPlatform, AdStatus, Comment } from '@/types';
import AdPreview from './AdPreview.tsx';

// --- SUB-COMPONENTS ---

const InputField = ({ label, error, placeholder, value, onChange, type = "text", icon: Icon }: any) => {
  return (
    <div className="space-y-2 flex-1">
      <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-wider flex items-center gap-2">
        {label} {error && <AlertCircle size={14} className="text-rose-500" />}
      </label>
      <div className="relative group">
        {Icon && <Icon size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-indigo-600'}`} />}
        <input 
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-white border rounded-xl py-3 ${Icon ? 'pl-11' : 'px-5'} pr-5 outline-none transition-all font-semibold text-base text-slate-900 shadow-sm ${
            error ? 'border-rose-400 ring-4 ring-rose-50/50' : 'border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600'
          }`}
        />
      </div>
      <div className="min-h-[20px] mt-1">
        {error && (
          <div className="flex gap-2 items-start px-2 animate-in slide-in-from-top-1">
             <MessageSquare size={14} className="text-rose-500 mt-0.5 shrink-0" />
             <p className="text-[11px] font-bold text-rose-600 leading-tight">{error.text}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SearchableSelect: React.FC<{
  label: string;
  field?: string;
  error?: Comment;
  icon?: React.ReactNode;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}> = ({ label, field, error, icon, options, value, onChange, placeholder = "Tìm kiếm..." }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="text-xs font-black text-slate-500 uppercase mb-2 block flex items-center gap-2 tracking-wider">
        {label} {error && <AlertCircle size={14} className="text-rose-500" />}
      </label>
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`w-full flex items-center justify-between px-5 py-3 bg-white border rounded-xl outline-none text-base text-slate-900 font-semibold shadow-sm transition-all ${
          error ? 'border-rose-400 ring-4 ring-rose-50/50' : 'border-slate-200 focus:ring-4 focus:ring-indigo-500/10'
        }`}
      >
        <div className="flex items-center gap-3 truncate">
          {icon && <span className={error ? 'text-rose-400' : 'text-slate-400'}>{icon}</span>}
          <span className="truncate">{value || 'Chọn...'}</span>
        </div>
        <ChevronDown size={18} className={`text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
      </button>
      {isMenuOpen && (
        <div className="absolute z-[110] w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          <div className="p-4 bg-white border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-indigo-500 transition-all">
              <Search size={16} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                className="w-full text-sm outline-none font-medium text-slate-900 placeholder:text-slate-400 bg-transparent"
                placeholder={placeholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto p-2 scrollbar-hide bg-white">
            {filteredOptions.length > 0 ? filteredOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setIsMenuOpen(false); setSearch(''); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-all mb-1 ${
                  value === opt ? 'bg-indigo-600 text-white border border-indigo-700 shadow-sm' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            )) : <div className="py-8 text-center bg-white"><p className="text-sm text-slate-400 font-bold">Không tìm thấy kết quả</p></div>}
          </div>
        </div>
      )}
    </div>
  );
};

const SectionCard = ({ id, title, icon: Icon, children, noPadding = false, isActive = false }: any) => (
  <div id={`section-${id}`} className={`bg-white rounded-[32px] border transition-all duration-500 ${isActive ? 'border-indigo-500 shadow-xl shadow-indigo-100/20 scale-[1.01]' : 'border-slate-200 shadow-sm'} ${noPadding ? '' : 'p-10'} space-y-8`}>
    <div className={`flex items-center gap-4 ${noPadding ? 'pt-10 px-10' : ''}`}>
      <div className={`p-3 rounded-2xl shadow-lg transition-colors duration-500 ${isActive ? 'bg-indigo-600 shadow-indigo-200' : 'bg-slate-400 shadow-slate-100'}`}>
        <Icon className="text-white" size={22} />
      </div>
      <h3 className={`text-xl font-extrabold transition-colors duration-500 ${isActive ? 'text-indigo-600' : 'text-slate-900'}`}>{title}</h3>
    </div>
    <div className={`space-y-8 ${noPadding ? 'pb-10 px-10' : ''}`}>{children}</div>
  </div>
);

// --- MAIN COMPONENT ---

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ad: Ad, stayOpen?: boolean) => Promise<void>;
  initialData?: Ad;
  currentUserName: string;
}

const CreateAdModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialData, currentUserName }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const scrollContainerRef = useRef<HTMLFormElement>(null);

  const steps = [
    { id: 1, label: 'Thông tin Chiến dịch' },
    { id: 2, label: 'Ngân sách & Lịch' },
    { id: 3, label: 'Nhắm mục tiêu' },
    { id: 4, label: 'Nội dung sáng tạo' },
    { id: 5, label: 'Vận hành' }
  ];

  const serviceCategories = ['Vietlott', 'Vay nhanh', 'Vay ngắn ngày', 'Xem phim', 'Tàu Hỏa', 'Xe Khách', 'Taxi', 'VnShop', 'Vé máy bay', 'Khác'];
  const banks = [
    'VNPAY',
    'Vietcombank', 
    'BIDV', 
    'Agribank', 
    'Vietinbank', 
    'VNPAY App', 
    'VnShop', 
    'Eximbank', 
    'VietABank', 
    'Sacombank', 
    'VietBank', 
    'OCB', 
    'Co-op Bank', 
    'IVB Bank', 
    'Khác'
  ];
  const fanpages = ['Agribank', 'Agribank Plus', 'VietinBank', 'Ứng dụng VNPAY', 'BIDV', 'VNPAY Taxi', 'VNPAY', 'Vietcombank', 'Sacombank', 'VNPAY-QR', 'VNPAY-POS', 'Phim này xem chưa', 'VneDoc', 'VIB', 'OCB', 'Eximbank', 'Vé xem phim', 'Vé máy bay', 'VnShop', 'Khác'];
  const placementOptions = [
    'Tự động (Advantage+)',
    'Thủ công (Bảng tin, Stories, Reels)',
    'Chỉ Bảng tin (Feed)',
    'Chỉ Stories & Reels',
    'Chỉ thiết bị di động',
    'Chỉ máy tính',
    'Toàn bộ mạng lưới hiển thị'
  ];

  const ACCOUNTS_BY_PLATFORM = {
    [AdPlatform.FACEBOOK]: [
      'VNPAY 2', 
      'VNPAY-QR', 
      'Vé máy bay', 
      'Vé xem phim', 
      'Bank miền Nam',
      'VnShop', 
      'BIDV SmartBanking 2', 
      'Agribank E-Mobile Banking 2', 
      'VCB Digibank 2', 
      'VietinBank iPay Mobile 2', 
      'VNPAY SDK', 
      'Ví VNPAY', 
      'Ví VNPAY Ads', 
      'Ocean Bank 2', 
      'Eximbank'
    ],
    [AdPlatform.GOOGLE]: ['Agribank Ads Account', 'BIDV Master', 'VCB Digibank', 'Ví VNPAY', 'Vietinbank', 'VNPAY định kỳ', 'VNPAY SDK', 'VnShop 2', 'VNPAY-QR'],
    [AdPlatform.TIKTOK]: ['VNPAY SDK', 'VNPAY SDK 2', 'Ví VNPAY Ads', 'Ví VNPAY 2', 'VCB Digibank', 'VnShop 2', 'VNPAY 2', 'BIDV SmartBanking', 'SDK VNPAY']
  };

  const OBJECTIVES_BY_PLATFORM = {
    [AdPlatform.FACEBOOK]: ['Tương tác', 'Tiếp cận', 'Xem video', 'Click to web', 'Click to app', 'Cài đặt ứng dụng', 'Tin nhắn'],
    [AdPlatform.GOOGLE]: ['Tìm kiếm', 'Hiển thị (GDN)', 'Youtube', 'Pmax', 'Mua sắm', 'UAC (Cài đặt app)'],
    [AdPlatform.TIKTOK]: ['Tiếp cận', 'Click to web', 'Xem video', 'Tương tác', 'Nhận diện thương hiệu', 'Cài đặt ứng dụng', 'Mua hàng']
  };

  const defaultFormData = {
    platform: AdPlatform.FACEBOOK,
    adObjective: OBJECTIVES_BY_PLATFORM[AdPlatform.FACEBOOK][0],
    serviceCategory: serviceCategories[0],
    partnerBank: banks[0],
    account: ACCOUNTS_BY_PLATFORM[AdPlatform.FACEBOOK][0],
    campaignName: '', campaignLink: '', adGroupName: '', adGroupLink: '', adName: '', adLink: '',
    budget: 0, budgetType: 'Hàng ngày' as 'Hàng ngày' | 'Trọn đời',
    placementOptimization: placementOptions[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    headline: '', caption: '', cta: 'Tìm hiểu thêm', destinationUrl: '', deeplink: '', mediaUrl: '', previewLink: '',
    ageRange: '18-65', interests: '', detailedTargeting: '', fanpageName: fanpages[0], assetTimeline: '', assetSource: '', otherIssues: '',
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [displayBudget, setDisplayBudget] = useState('0');
  const initialDataIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const currentId = initialData?.id || 'new';
      if (initialDataIdRef.current !== currentId) {
        if (initialData) {
          setFormData({
            platform: initialData.platform,
            adObjective: initialData.adObjective || OBJECTIVES_BY_PLATFORM[initialData.platform][0],
            serviceCategory: initialData.serviceCategory,
            partnerBank: initialData.partnerBank || banks[0],
            account: initialData.account,
            campaignName: initialData.campaignName, campaignLink: initialData.campaignLink || '',
            adGroupName: initialData.adGroupName, adGroupLink: initialData.adGroupLink || '',
            adName: initialData.adName, adLink: initialData.adLink || '',
            budget: initialData.budget, budgetType: initialData.budgetType,
            placementOptimization: initialData.placementOptimization || placementOptions[0],
            startDate: initialData.startDate, endDate: initialData.endDate,
            headline: initialData.content.headline, caption: initialData.content.caption,
            cta: initialData.content.cta, destinationUrl: initialData.content.destinationUrl,
            deeplink: initialData.content.deeplink || '', mediaUrl: initialData.content.mediaUrl,
            previewLink: initialData.content.previewLink || '',
            ageRange: initialData.targetAudience.age, interests: initialData.targetAudience.interests.join(', '),
            detailedTargeting: initialData.targetAudience.detailedTargeting || '',
            fanpageName: initialData.fanpage.name, assetTimeline: initialData.assetTimeline,
            assetSource: initialData.assetSource, otherIssues: initialData.otherIssues || '',
          });
          setDisplayBudget(new Intl.NumberFormat('vi-VN').format(initialData.budget));
        } else {
          setFormData(defaultFormData);
          setDisplayBudget('0');
        }
        initialDataIdRef.current = currentId;
      }
    } else {
      initialDataIdRef.current = null;
    }
  }, [initialData, isOpen]);

  // Scroll-based progress tracking
  useEffect(() => {
    if (!isOpen) return;
    
    const observerOptions = {
      root: scrollContainerRef.current,
      rootMargin: '0px 0px -80% 0px', // Trigger when section is in the top 20%
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      // Find the first intersecting entry (the one closest to the top)
      const visibleSection = entries.find(entry => entry.isIntersecting);
      if (visibleSection) {
        const id = parseInt(visibleSection.target.id.replace('section-', ''));
        if (!isNaN(id)) {
          setActiveStep(id);
        }
      }
    }, observerOptions);

    const sectionIds = [1, 2, 3, 4, 5];
    // Use a small timeout to ensure elements are rendered
    const timeoutId = setTimeout(() => {
      sectionIds.forEach(id => {
        const el = document.getElementById(`section-${id}`);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [isOpen]);

  const handlePlatformChange = (platform: AdPlatform) => {
    setFormData(prev => ({ 
      ...prev, 
      platform, 
      account: ACCOUNTS_BY_PLATFORM[platform][0],
      adObjective: OBJECTIVES_BY_PLATFORM[platform][0]
    }));
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    const numVal = parseInt(rawVal) || 0;
    setDisplayBudget(new Intl.NumberFormat('vi-VN').format(numVal));
    setFormData(prev => ({ ...prev, budget: numVal }));
  };

  const previewAd: Ad = useMemo(() => ({
    id: initialData?.id && !initialData.id.startsWith('clone_') ? initialData.id : `ad_${Date.now()}`,
    platform: formData.platform,
    account: formData.account,
    serviceCategory: formData.serviceCategory,
    partnerBank: formData.partnerBank,
    campaignName: formData.campaignName,
    campaignLink: formData.campaignLink,
    adGroupName: formData.adGroupName,
    adGroupLink: formData.adGroupLink,
    adName: formData.adName,
    adLink: formData.adLink,
    adObjective: formData.adObjective,
    status: AdStatus.PENDING,
    startDate: formData.startDate,
    endDate: formData.endDate,
    budget: formData.budget,
    budgetType: formData.budgetType,
    placementOptimization: formData.placementOptimization,
    targetAudience: { age: formData.ageRange, interests: formData.interests.split(','), locations: ['Việt Nam'], detailedTargeting: formData.detailedTargeting },
    fanpage: { name: formData.fanpageName, avatar: 'https://picsum.photos/seed/brand/100/100' },
    content: { 
      headline: formData.headline, 
      caption: formData.caption, 
      cta: formData.cta, 
      destinationUrl: formData.destinationUrl, 
      deeplink: formData.deeplink,
      mediaUrl: formData.mediaUrl,
      mediaType: formData.platform === AdPlatform.TIKTOK || formData.mediaUrl.match(/\.(mp4|mov|webm)$/i) ? 'video' : 'image',
      previewLink: formData.previewLink
    },
    assetTimeline: formData.assetTimeline,
    assetSource: formData.assetSource,
    lastUpdated: new Date().toISOString(),
    version: initialData ? initialData.version + 1 : 1,
    owner: currentUserName,
    ownerEmail: initialData?.ownerEmail || undefined,
    checklist: initialData?.checklist || { brandVoice: false, policyCheck: false, linkCheck: false, guidelineCheck: false, ctaCheck: false },
    comments: initialData?.comments || []
  }), [formData, currentUserName, initialData]);

  const getFieldError = (field: string) => initialData?.comments?.find(c => c.field === field && !c.resolved);

  const handleFormSubmit = async (e: React.FormEvent, stayOpen: boolean = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(previewAd, stayOpen);
      if (stayOpen) {
        setSuccessToast(true);
        setTimeout(() => setSuccessToast(false), 3000);
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (id: number) => {
    setActiveStep(id);
    const element = document.getElementById(`section-${id}`);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!isOpen) return null;
  const isUpdatingExisting = initialData && initialData.id && !initialData.id.startsWith('ad_') && !initialData.id.startsWith('clone_');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="w-full max-w-[95vw] h-[95vh] bg-[#f8fafc] rounded-[48px] shadow-2xl flex overflow-hidden border border-white/20">
        {successToast && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4">
            <CheckCircle2 size={24} />
            <p className="font-extrabold text-lg">Đã lưu mẫu quảng cáo vào hệ thống!</p>
          </div>
        )}
        <aside className="w-80 bg-white border-r border-slate-100 p-12 flex flex-col shrink-0">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-12">Tiến trình thiết lập</p>
          <nav className="flex-1 space-y-8">
            {steps.map((step) => (
              <button key={step.id} type="button" onClick={() => scrollToSection(step.id)} className="flex items-center gap-5 group w-full text-left">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeStep === step.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110' : activeStep > step.id ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                  {activeStep > step.id ? <CheckCircle2 size={20} /> : <span className="text-sm font-black">{step.id}</span>}
                </div>
                <span className={`text-base font-black transition-colors ${activeStep === step.id ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-800'}`}>{step.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="px-12 py-10 flex items-center justify-between bg-[#f8fafc]">
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">{isUpdatingExisting ? 'Chỉnh sửa' : 'Tạo mới / Nhân bản'} Quảng cáo</h2>
              <p className="text-base font-medium text-slate-500 mt-2">Thiết lập chi tiết chiến dịch marketing đa kênh.</p>
            </div>
            <button type="button" onClick={onClose} className="p-4 bg-white hover:bg-slate-100 rounded-2xl shadow-sm border border-slate-200 transition-colors"><X size={28} className="text-slate-900" /></button>
          </header>
          <form id="create-ad-form" className="flex-1 overflow-y-auto px-12 pb-32 space-y-12 scrollbar-hide" ref={scrollContainerRef}>
            <SectionCard id={1} title="Thông tin Chiến dịch" icon={Info} isActive={activeStep === 1}>
              <div className="grid grid-cols-2 gap-10">
                <SearchableSelect label="Tài khoản QC" field="account" error={getFieldError('account')} icon={<UserCircle size={18}/>} options={ACCOUNTS_BY_PLATFORM[formData.platform]} value={formData.account} onChange={(val) => setFormData(prev => ({...prev, account: val}))} />
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-wider flex items-center gap-2">Chọn Kênh {getFieldError('platform') && <AlertCircle size={14} className="text-rose-500" />}</label>
                  <div className="flex gap-5">
                    {[{ id: AdPlatform.FACEBOOK, icon: Facebook, label: 'Facebook' }, { id: AdPlatform.GOOGLE, icon: Globe, label: 'Google' }, { id: AdPlatform.TIKTOK, icon: Video, label: 'TikTok' }].map(p => (
                      <button key={p.id} type="button" onClick={() => handlePlatformChange(p.id)} className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all font-black text-base ${formData.platform === p.id ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-8 ring-indigo-50 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                        <p.icon size={24} className={formData.platform === p.id ? 'text-indigo-600' : 'text-slate-400'} />{p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-10">
                <div className="space-y-6">
                  <InputField label="Tên Chiến dịch" field="campaignName" error={getFieldError('campaignName')} placeholder="VD: Summer_Collection_2024" value={formData.campaignName} onChange={(e: any) => setFormData(prev => ({...prev, campaignName: e.target.value}))} />
                  <InputField label="Link Chiến dịch" field="campaignLink" error={getFieldError('campaignLink')} placeholder="https://..." icon={LinkIcon} value={formData.campaignLink} onChange={(e: any) => setFormData(prev => ({...prev, campaignLink: e.target.value}))} />
                </div>
                <div className="space-y-6">
                  <InputField label="Nhóm Quảng cáo" field="adGroupName" error={getFieldError('adGroupName')} placeholder="Nhập tên nhóm quảng cáo" value={formData.adGroupName} onChange={(e: any) => setFormData(prev => ({...prev, adGroupName: e.target.value}))} />
                  <InputField label="Link Nhóm QC" field="adGroupLink" error={getFieldError('adGroupLink')} placeholder="https://..." icon={LinkIcon} value={formData.adGroupLink} onChange={(e: any) => setFormData(prev => ({...prev, adGroupLink: e.target.value}))} />
                </div>
                <div className="space-y-6">
                  <InputField label="Tên Quảng cáo" field="adName" error={getFieldError('adName')} placeholder="Nhập tên mẫu quảng cáo" value={formData.adName} onChange={(e: any) => setFormData(prev => ({...prev, adName: e.target.value}))} />
                  <InputField label="Link Mẫu QC" field="adLink" error={getFieldError('adLink')} placeholder="https://..." icon={LinkIcon} value={formData.adLink} onChange={(e: any) => setFormData(prev => ({...prev, adLink: e.target.value}))} />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-10">
                <SearchableSelect label="Hình thức chạy" field="adObjective" error={getFieldError('adObjective')} icon={<Activity size={18}/>} options={OBJECTIVES_BY_PLATFORM[formData.platform]} value={formData.adObjective} onChange={(val) => setFormData(prev => ({...prev, adObjective: val}))} />
                <SearchableSelect label="Vị trí hiển thị" field="placementOptimization" error={getFieldError('placementOptimization')} icon={<MapPinned size={18}/>} options={placementOptions} value={formData.placementOptimization} onChange={(val) => setFormData(prev => ({...prev, placementOptimization: val}))} />
                <SearchableSelect label="Dịch vụ" field="serviceCategory" error={getFieldError('serviceCategory')} icon={<Briefcase size={18}/>} options={serviceCategories} value={formData.serviceCategory} onChange={(val) => setFormData(prev => ({...prev, serviceCategory: val}))} />
                <SearchableSelect label="Ngân hàng đối tác" field="partnerBank" error={getFieldError('partnerBank')} icon={<Building2 size={18}/>} options={banks} value={formData.partnerBank} onChange={(val) => setFormData(prev => ({...prev, partnerBank: val}))} />
              </div>
            </SectionCard>
            <SectionCard id={2} title="Ngân sách & Lịch" icon={Calendar} isActive={activeStep === 2}>
              <div className="grid grid-cols-4 gap-8">
                <InputField type="date" label="Ngày bắt đầu" field="startDate" error={getFieldError('startDate')} value={formData.startDate} onChange={(e: any) => setFormData(prev => ({...prev, startDate: e.target.value}))} />
                <InputField type="date" label="Ngày kết thúc" field="endDate" error={getFieldError('endDate')} value={formData.endDate} onChange={(e: any) => setFormData(prev => ({...prev, endDate: e.target.value}))} />
                <div className="space-y-2"><label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-wider">Loại ngân sách</label><div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner h-[56px]">{['Hàng ngày', 'Trọn đời'].map((type) => (<button key={type} type="button" onClick={() => setFormData(prev => ({...prev, budgetType: type as 'Hàng ngày' | 'Trọn đời'}))} className={`flex-1 text-sm font-black rounded-lg transition-all ${formData.budgetType === type ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}>{type}</button>))}</div></div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-wider flex items-center gap-2">Ngân sách (VND) {getFieldError('budget') && <AlertCircle size={14} className="text-rose-500" />}</label>
                  <div className="relative group"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-indigo-600 text-lg">₫</span><input type="text" value={displayBudget} onChange={handleBudgetChange} className={`w-full bg-white border rounded-xl py-3.5 pl-9 pr-5 outline-none transition-all font-bold text-slate-900 text-base shadow-sm ${getFieldError('budget') ? 'border-rose-400 ring-4 ring-rose-50/50' : 'border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600'}`}/></div>
                </div>
              </div>
            </SectionCard>
            <SectionCard id={3} title="Nhắm mục tiêu" icon={Target} isActive={activeStep === 3}>
              <div className="grid grid-cols-2 gap-10">
                <InputField label="Độ tuổi" field="targetAudience.age" error={getFieldError('targetAudience.age')} placeholder="VD: 18-35" value={formData.ageRange} onChange={(e: any) => setFormData(prev => ({...prev, ageRange: e.target.value}))} />
                <InputField label="Sở thích mục tiêu" field="targetAudience.interests" error={getFieldError('targetAudience.interests')} placeholder="VD: Tài chính, Mua sắm, Du lịch" icon={MousePointer2} value={formData.interests} onChange={(e: any) => setFormData(prev => ({...prev, interests: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-wider flex items-center gap-2">Nhắm mục tiêu chi tiết {getFieldError('targetAudience.detailedTargeting') && <AlertCircle size={14} className="text-rose-500" />}</label>
                <textarea rows={4} value={formData.detailedTargeting} onChange={e => setFormData(prev => ({...prev, detailedTargeting: e.target.value}))} placeholder="Nhập nhân khẩu học, sở thích hoặc hành vi cụ thể..." className={`w-full bg-white border rounded-2xl p-5 outline-none transition-all font-semibold text-slate-900 text-base shadow-sm resize-none ${getFieldError('targetAudience.detailedTargeting') ? 'border-rose-400 ring-4 ring-rose-50/50' : 'border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600'}`}/>
              </div>
            </SectionCard>
            <SectionCard id={4} title="Nội dung sáng tạo & Xem trước" icon={Layout} noPadding isActive={activeStep === 4}>
              <div className="flex flex-col lg:flex-row min-h-[800px] border-t border-slate-100">
                <div className="lg:w-3/5 p-10 space-y-8 border-r border-slate-100">
                  <div className="grid grid-cols-2 gap-10">
                    <SearchableSelect label="Fanpage / Danh tính" field="fanpage.name" error={getFieldError('fanpage.name')} icon={<Smartphone size={18}/>} options={fanpages} value={formData.fanpageName} onChange={(val) => setFormData(prev => ({...prev, fanpageName: val}))} />
                    <InputField label="Tiêu đề (Headline)" field="content.headline" error={getFieldError('content.headline')} placeholder="Nhập tiêu đề thu hút" icon={Type} value={formData.headline} onChange={(e: any) => setFormData(prev => ({...prev, headline: e.target.value}))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-wider flex items-center gap-2">Nội dung chính (Caption) {getFieldError('content.caption') && <AlertCircle size={14} className="text-rose-500" />}</label>
                    <textarea rows={10} value={formData.caption} onChange={e => setFormData(prev => ({...prev, caption: e.target.value}))} placeholder="Kể câu chuyện về sản phẩm của bạn..." className={`w-full bg-white border rounded-3xl p-6 outline-none transition-all font-medium text-slate-900 text-base shadow-sm resize-none leading-relaxed ${getFieldError('content.caption') ? 'border-rose-400 ring-4 ring-rose-50/50' : 'border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600'}`}/>
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                    <InputField label="Link đích (URL)" field="content.destinationUrl" error={getFieldError('content.destinationUrl')} placeholder="https://..." icon={LinkIcon} value={formData.destinationUrl} onChange={(e: any) => setFormData(prev => ({...prev, destinationUrl: e.target.value}))} />
                    <InputField label="Deeplink" field="content.deeplink" error={getFieldError('content.deeplink')} placeholder="Nhập deeplink..." icon={LinkIcon} value={formData.deeplink} onChange={(e: any) => setFormData(prev => ({...prev, deeplink: e.target.value}))} />
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                    <InputField label="Link xem trước (Ads Preview)" field="content.previewLink" error={getFieldError('content.previewLink')} placeholder="VD: https://fb.me/..." value={formData.previewLink} onChange={(e: any) => setFormData(prev => ({...prev, previewLink: e.target.value}))} />
                    <InputField label="Nguồn hình ảnh/video" field="content.mediaUrl" error={getFieldError('content.mediaUrl')} placeholder="Dán link Drive hoặc link ảnh/video" value={formData.mediaUrl} onChange={(e: any) => setFormData(prev => ({...prev, mediaUrl: e.target.value}))} />
                  </div>
                </div>
                <div className="lg:w-2/5 bg-slate-50/50 p-10 flex flex-col items-center justify-start relative">
                  <div className="absolute top-10 left-10 z-10"><p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Eye size={16} /> BẢN XEM TRƯỚC TRỰC TIẾP</p></div>
                  <div className="w-full h-full overflow-y-auto scrollbar-hide pt-16 flex justify-center pb-16"><div className="w-full max-w-[380px] transform origin-top scale-[0.9] lg:scale-100"><AdPreview ad={previewAd} /></div></div>
                </div>
              </div>
            </SectionCard>
            <SectionCard id={5} title="Vận hành" icon={Briefcase} isActive={activeStep === 5}>
              <div className="grid grid-cols-2 gap-10">
                <InputField label="Timeline tư liệu" field="assetTimeline" error={getFieldError('assetTimeline')} placeholder="VD: Hoàn thành trước 15/06" value={formData.assetTimeline} onChange={(e: any) => setFormData(prev => ({...prev, assetTimeline: e.target.value}))} />
                <InputField label="Nguồn tư liệu" field="assetSource" error={getFieldError('assetSource')} placeholder="Nội bộ / Tên Agency" value={formData.assetSource} onChange={(e: any) => setFormData(prev => ({...prev, assetSource: e.target.value}))} />
              </div>
            </SectionCard>
          </form>
          <footer className="px-12 py-10 bg-white border-t border-slate-100 flex items-center justify-between sticky bottom-0 z-50">
            <button type="button" onClick={onClose} className="px-10 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-base rounded-2xl transition-all">Hủy bỏ</button>
            <div className="flex gap-5">
              {!isUpdatingExisting && (<button type="button" disabled={isSubmitting} onClick={(e) => handleFormSubmit(e, true)} className="px-10 py-4 bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-black text-base rounded-2xl transition-all flex items-center gap-3 shadow-sm disabled:opacity-50">{isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <CopyPlus size={20} />}Lưu & Tạo mẫu tiếp theo</button>)}
              <button type="button" disabled={isSubmitting} onClick={(e) => handleFormSubmit(e, false)} className="px-14 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center gap-3 disabled:opacity-50">{isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}{isUpdatingExisting ? 'Lưu thay đổi' : 'Hoàn tất & Đóng'}</button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default CreateAdModal;
