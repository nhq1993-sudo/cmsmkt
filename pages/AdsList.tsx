
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { Ad, AdStatus, AdPlatform } from '@/types';
import { 
  ExternalLink, 
  Facebook,
  Smartphone,
  Search as GoogleIcon,
  Video,
  Plus,
  Image as ImageIcon,
  UserCircle,
  FolderTree,
  Edit2,
  Trash2,
  Filter,
  X,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Copy,
  RefreshCcw,
  CalendarDays,
  Clock,
  Calendar as CalendarIcon,
  Check
} from 'lucide-react';

interface Props {
  ads: Ad[];
  onCreateRequest: () => void;
  onEdit: (ad: Ad) => void;
  onDelete: (id: string) => void;
  onDuplicate: (ad: Ad) => void;
}

export const BANK_LOGOS: Record<string, string> = {
  'Vietcombank': 'https://cdn2.tuoitre.vn/thumb_w/600/471584752817336320/2023/2/23/29229888323456029822604684420721366064172575n-16771238637691533081421.jpg',
  'BIDV': 'https://yt3.googleusercontent.com/D1f41PW2ElJTaEo6yofAVo8G11ACt0WZ6mIQV0T_e-xVbYwaISn4ESrSkVKYknl4ah_4Qd0y=s900-c-k-c0x00ffffff-no-rj',
  'Agribank': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE3CG06puxzXXeY9OHtjoY7iU5Zi-YobTwOQ&s',
  'Vietinbank': 'https://play-lh.googleusercontent.com/F8D0AbyMmiuwsTZYLaPsu_o40XGfQHgvRnq25lVSWupgHPpH3-TQ9soMrWwDJco3siI',
  'VNPAY App': 'https://play-lh.googleusercontent.com/B1Zi8JrNjFjZKOQ2b5O8M-Or2uY3pSWZa-6-XnDMJ8YTFesdJRsIFhd1KxpqV0f2kg',
  'VnShop': 'https://vnpay.vn/s1/vnpay-vn/uploads/2023/08/logo-vnshop.png',
  'Vietlott': 'https://vnpay.vn/s1/vnpay-vn/uploads/2023/11/Vietlott.png',
  'Eximbank': 'https://play-lh.googleusercontent.com/qBHHuY35S6D218ysV-5rR17iHg8EpqoW60Wga0NUW7X_Vw3cv0hzlJ1J-YbalfATjvb-',
  'VietABank': 'https://cdn.aptoide.com/imgs/b/7/6/b761f828f81b235e592e6490274f662b_icon.png',
  'Sacombank': 'https://play-lh.googleusercontent.com/9fcJ7ylwAgswm5VbbroNr3e100ofiXf07ixr1vFVwV5NTTfCkTZ0hYdgInd3QiE_lVJwXuGXQkGmuwUKfZvl',
  'VietBank': 'https://play-lh.googleusercontent.com/6tmh_mH9ru6-N2LKZA7YAMPUc-2tlDNWmIMG9Im5rXUBRmfJp9GBCRmfehtJeWzKXs0',
  'OCB': 'https://cdn.nhandan.vn/images/22f099ca8bc7ae81aa2a8d3416a84bf88089b7215cc19d3f1bdde36a07520443f2d2e4fc1c098a3a9862897202c200bf2a9dbce8cd73a8135feabc05583b68e870d9b3e71a50adfe4550d4e56dd7f8ab/logo-temp-copy-2092.jpg',
  'IVB Bank': 'https://play-lh.googleusercontent.com/36Zb9ATXs4ztfF7LyeSm1LkhOPzXxOa6gVwLDWeJlAhjp8lrb5vLWhbubt7CyQfn3alK',
  'Vé máy bay': 'https://vnpay.vn/s1/vnpay-vn/uploads/2023/05/icon-ve-may-bay.png',
  'Vé xem phim': 'https://vnpay.vn/s1/vnpay-vn/uploads/2023/05/icon-ve-xem-phim.png',
  'Taxi': 'https://vnpay.vn/s1/vnpay-vn/uploads/2023/05/icon-goi-taxi.png'
};

const AdsList: React.FC<Props> = ({ ads, onCreateRequest, onEdit, onDelete, onDuplicate }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { username } = useParams<{ username: string }>();

  const platformFilter = searchParams.get('platform') || 'All';
  const serviceFilter = searchParams.get('service') || 'All';
  const bankFilter = searchParams.get('bank') || 'All';
  const accountFilter = searchParams.get('account') || 'All';
  const fromDateFilter = searchParams.get('from') || '';
  const toDateFilter = searchParams.get('to') || '';
  const activeTab = (searchParams.get('status') || 'ALL') as AdStatus | 'ALL';
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempFromDate, setTempFromDate] = useState(fromDateFilter);
  const [tempToDate, setTempToDate] = useState(toDateFilter);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Lấy tháng hiện tại cho lịch
  const [currentMonthView, setCurrentMonthView] = useState(new Date());

  const platforms = ['All', ...new Set(ads.map(ad => ad.platform))];
  const services = ['All', ...new Set(ads.map(ad => ad.serviceCategory))];
  const banks = ['All', ...new Set(ads.map(ad => ad.partnerBank).filter(Boolean) as string[])];
  const accounts = ['All', ...new Set(ads.map(ad => ad.account))];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      const matchCreator = username ? ad.owner === username : true;
      const matchPlatform = platformFilter === 'All' ? true : ad.platform === platformFilter;
      const matchService = serviceFilter === 'All' ? true : ad.serviceCategory === serviceFilter;
      const matchBank = bankFilter === 'All' ? true : ad.partnerBank === bankFilter;
      const matchAccount = accountFilter === 'All' ? true : ad.account === accountFilter;
      
      const adDate = ad.createdAt ? new Date(ad.createdAt) : new Date(ad.lastUpdated);
      const matchFromDate = fromDateFilter ? adDate >= new Date(fromDateFilter) : true;
      
      let matchToDate = true;
      if (toDateFilter) {
        const endOfDay = new Date(toDateFilter);
        endOfDay.setHours(23, 59, 59, 999);
        matchToDate = adDate <= endOfDay;
      }
      
      let matchTab = true;
      if (activeTab === AdStatus.PENDING) {
        matchTab = ad.status === AdStatus.PENDING || ad.status === AdStatus.IN_REVIEW;
      } else if (activeTab !== 'ALL') {
        matchTab = ad.status === activeTab;
      }
      
      return matchCreator && matchPlatform && matchService && matchBank && matchAccount && matchTab && matchFromDate && matchToDate;
    }).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }, [ads, platformFilter, serviceFilter, bankFilter, accountFilter, activeTab, username, fromDateFilter, toDateFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [platformFilter, serviceFilter, bankFilter, accountFilter, activeTab, username, itemsPerPage, fromDateFilter, toDateFilter]);

  const totalPages = Math.ceil(filteredAds.length / itemsPerPage);

  const paginatedAds = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAds.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAds, currentPage, itemsPerPage]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'All') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const applyDateFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    if (tempFromDate) newParams.set('from', tempFromDate); else newParams.delete('from');
    if (tempToDate) newParams.set('to', tempToDate); else newParams.delete('to');
    setSearchParams(newParams);
    setIsDatePickerOpen(false);
  };

  const setPreset = (preset: string) => {
    const now = new Date();
    let from = new Date();
    let to = new Date();

    switch (preset) {
      case 'today':
        break;
      case 'yesterday':
        from.setDate(now.getDate() - 1);
        to.setDate(now.getDate() - 1);
        break;
      case 'last7':
        from.setDate(now.getDate() - 7);
        break;
      case 'last14':
        from.setDate(now.getDate() - 14);
        break;
      case 'last28':
        from.setDate(now.getDate() - 28);
        break;
      case 'last30':
        from.setDate(now.getDate() - 30);
        break;
      case 'thisMonth':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        to = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'all':
        setTempFromDate('');
        setTempToDate('');
        return;
    }

    setTempFromDate(from.toISOString().split('T')[0]);
    setTempToDate(to.toISOString().split('T')[0]);
  };

  const generateCalendarDays = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    
    return days;
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (!tempFromDate || (tempFromDate && tempToDate)) {
      setTempFromDate(dateStr);
      setTempToDate('');
    } else {
      if (dateStr < tempFromDate) {
        setTempToDate(tempFromDate);
        setTempFromDate(dateStr);
      } else {
        setTempToDate(dateStr);
      }
    }
  };

  const isSelected = (date: Date) => {
    const d = date.toISOString().split('T')[0];
    return d === tempFromDate || d === tempToDate;
  };

  const isInRange = (date: Date) => {
    if (!tempFromDate || !tempToDate) return false;
    const d = date.toISOString().split('T')[0];
    return d > tempFromDate && d < tempToDate;
  };

  const getStatusStyle = (status: AdStatus) => {
    switch (status) {
      case AdStatus.APPROVED: return 'bg-emerald-100 text-emerald-700';
      case AdStatus.PENDING:
      case AdStatus.IN_REVIEW: return 'bg-amber-100 text-amber-700';
      case AdStatus.REJECTED: return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPlatformIcon = (platform: AdPlatform) => {
    switch (platform) {
      case AdPlatform.FACEBOOK: return <Facebook className="text-blue-600" size={18} />;
      case AdPlatform.GOOGLE: return <GoogleIcon className="text-orange-500" size={18} />;
      case AdPlatform.TIKTOK: return <Video className="text-black" size={18} />;
      default: return <Smartphone size={18} />;
    }
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const secondMonthView = new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() + 1, 1);

  return (
    <div className="p-8 h-full overflow-y-auto scrollbar-hide space-y-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            {username ? `Quảng cáo của: ${username}` : 'Quản lý quảng cáo'}
            <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-black">
              {filteredAds.length} mẫu
            </span>
          </h2>
          <p className="text-slate-500 font-bold">
            Theo dõi và phê duyệt mẫu quảng cáo đa nền tảng.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onCreateRequest} 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-black shadow-lg transition-all active:scale-95 border border-indigo-500"
          >
            <Plus size={18} /> Tạo Ads Mới
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-wider">
            <Filter size={16} className="text-indigo-600" /> Bộ lọc nâng cao
          </div>
          {(platformFilter !== 'All' || serviceFilter !== 'All' || bankFilter !== 'All' || accountFilter !== 'All' || fromDateFilter || toDateFilter) && (
            <button 
              onClick={() => setSearchParams({ status: activeTab })}
              className="text-xs font-black text-rose-600 hover:underline flex items-center gap-1"
            >
              <X size={14} /> Xóa tất cả lọc
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Kênh / Nền tảng</label>
            <select 
              value={platformFilter} 
              onChange={(e) => updateFilter('platform', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
            >
              {platforms.map(p => <option key={p} value={p}>{p === 'All' ? 'Tất cả Kênh' : p}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Dịch vụ</label>
            <select 
              value={serviceFilter} 
              onChange={(e) => updateFilter('service', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
            >
              {services.map(s => <option key={s} value={s}>{s === 'All' ? 'Tất cả Dịch vụ' : s}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Ngân hàng đối tác</label>
            <select 
              value={bankFilter} 
              onChange={(e) => updateFilter('bank', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
            >
              {banks.map(b => <option key={b} value={b}>{b === 'All' ? 'Tất cả Ngân hàng' : b}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tài khoản QC</label>
            <select 
              value={accountFilter} 
              onChange={(e) => updateFilter('account', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
            >
              {accounts.map(a => <option key={a} value={a}>{a === 'All' ? 'Tất cả Tài khoản' : a}</option>)}
            </select>
          </div>
          
          <div className="space-y-1.5 relative" ref={datePickerRef}>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Khoảng ngày tạo</label>
            <button 
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-100 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2 truncate">
                <CalendarIcon size={16} className="text-slate-400" />
                <span className="truncate">
                  {fromDateFilter ? `${formatDateLabel(fromDateFilter)} - ${formatDateLabel(toDateFilter)}` : 'Tất cả thời gian'}
                </span>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDatePickerOpen && (
              <div className="absolute top-full right-0 mt-2 z-[100] w-[850px] bg-white border border-slate-200 rounded-[24px] shadow-2xl flex overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Sidebar Presets */}
                <div className="w-56 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto scrollbar-hide flex flex-col gap-1">
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">Gợi ý nhanh</p>
                   {[
                     { label: 'Hôm nay', id: 'today' },
                     { label: 'Hôm qua', id: 'yesterday' },
                     { label: '7 ngày qua', id: 'last7' },
                     { label: '14 ngày qua', id: 'last14' },
                     { label: '28 ngày qua', id: 'last28' },
                     { label: '30 ngày qua', id: 'last30' },
                     { label: 'Tháng này', id: 'thisMonth' },
                     { label: 'Tháng trước', id: 'lastMonth' },
                     { label: 'Tối đa (Maximum)', id: 'all' }
                   ].map(item => (
                     <button 
                       key={item.id}
                       type="button"
                       onClick={() => setPreset(item.id)}
                       className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white hover:shadow-sm text-sm font-bold text-slate-600 hover:text-indigo-600 text-left transition-all group"
                     >
                       <span>{item.label}</span>
                       <div className="w-4 h-4 border-2 border-slate-200 rounded-full flex items-center justify-center group-hover:border-indigo-600" />
                     </button>
                   ))}
                </div>

                {/* Main Picker Content */}
                <div className="flex-1 p-8 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-12">
                       <span className="text-lg font-black text-slate-900">
                         {currentMonthView.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
                       </span>
                       <span className="text-lg font-black text-slate-900">
                         {secondMonthView.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
                       </span>
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => setCurrentMonthView(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() - 1, 1))} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all"><ChevronLeft size={20}/></button>
                       <button onClick={() => setCurrentMonthView(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() + 1, 1))} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all"><ChevronRight size={20}/></button>
                    </div>
                  </div>

                  <div className="flex gap-8 mb-10">
                    <div className="flex-1">
                      <div className="grid grid-cols-7 gap-1 text-center mb-4">
                        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                          <span key={d} className="text-[10px] font-black text-slate-400 uppercase">{d}</span>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center font-bold text-sm text-slate-800">
                        {generateCalendarDays(currentMonthView).map((date, i) => (
                          <div key={i} onClick={() => date && handleDateClick(date)} className={`p-2 rounded-lg cursor-pointer transition-all ${!date ? '' : isSelected(date) ? 'bg-indigo-600 text-white shadow-md z-10' : isInRange(date) ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'}`}>{date ? date.getDate() : ''}</div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-7 gap-1 text-center mb-4">
                        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                          <span key={d} className="text-[10px] font-black text-slate-400 uppercase">{d}</span>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center font-bold text-sm text-slate-800">
                        {generateCalendarDays(secondMonthView).map((date, i) => (
                          <div key={i} onClick={() => date && handleDateClick(date)} className={`p-2 rounded-lg cursor-pointer transition-all ${!date ? '' : isSelected(date) ? 'bg-indigo-600 text-white shadow-md z-10' : isInRange(date) ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'}`}>{date ? date.getDate() : ''}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto border-t border-slate-100 pt-8 flex items-center justify-end">
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setIsDatePickerOpen(false)} className="px-6 py-2.5 text-sm font-black text-slate-500 hover:bg-slate-50 rounded-xl transition-all border border-slate-200">Hủy bỏ</button>
                        <button type="button" onClick={applyDateFilter} className="px-10 py-2.5 text-sm font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition-all active:scale-95">Cập nhật</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 gap-6 flex-shrink-0">
        {['ALL', AdStatus.PENDING, AdStatus.APPROVED, AdStatus.REJECTED].map((tab) => (
          <button key={tab} onClick={() => updateFilter('status', tab)} className={`pb-3 text-sm font-black transition-all relative ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>{tab === 'ALL' ? 'Tất cả' : tab === AdStatus.PENDING ? 'Chờ duyệt' : tab === AdStatus.APPROVED ? 'Đã duyệt' : 'Từ chối'}{activeTab === tab && (<div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.4)]" />)}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto flex-1 scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-sm font-black text-slate-900 uppercase tracking-wider">Mẫu QC / Chiến dịch</th>
                <th className="px-6 py-4 text-sm font-black text-slate-900 uppercase tracking-wider">Tài khoản</th>
                <th className="px-6 py-4 text-sm font-black text-slate-900 uppercase tracking-wider">Kênh & Dịch vụ</th>
                <th className="px-6 py-4 text-sm font-black text-slate-900 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-4 text-sm font-black text-slate-900 uppercase tracking-wider">Ngân sách</th>
                <th className="px-6 py-4 text-sm font-black text-slate-900 uppercase tracking-wider text-right">Thao tác</th>
                <th className="px-6 py-4 text-sm font-black text-slate-900 uppercase tracking-wider text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedAds.length > 0 ? paginatedAds.map(ad => {
                const canDelete = true; 
                const canEdit = [AdStatus.PENDING, AdStatus.IN_REVIEW, AdStatus.REJECTED, AdStatus.DRAFT].includes(ad.status as AdStatus);
                const logoUrl = (ad.partnerBank && BANK_LOGOS[ad.partnerBank]) || (ad.serviceCategory && BANK_LOGOS[ad.serviceCategory]);
                const createdDate = ad.createdAt ? new Date(ad.createdAt) : new Date(ad.lastUpdated);
                return (
                  <tr key={ad.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white overflow-hidden border border-slate-200 flex items-center justify-center p-1 shadow-sm">
                          {logoUrl ? (<img src={logoUrl} className="max-w-full max-h-full object-contain" onError={(e) => {(e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/10433/10433048.png';}} />) : (<ImageIcon size={24} className="text-slate-300" />)}
                        </div>
                        <div><p className="text-sm font-black text-slate-900">{ad.adName}</p><p className="text-sm text-slate-500 line-clamp-1 font-bold">{ad.campaignName}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-slate-700 flex items-center gap-1.5"><UserCircle size={16} className="text-slate-400" /> {ad.account}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1 font-bold"><FolderTree size={16} className="text-slate-400" /> {ad.adGroupName}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 mb-1 font-bold">{getPlatformIcon(ad.platform)} <span className="text-sm text-slate-900 font-black">{ad.platform}</span></div>
                      <p className="text-sm font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit uppercase">{ad.serviceCategory}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-700 font-bold text-sm"><CalendarDays size={14} className="text-slate-400" />{createdDate.toLocaleDateString('vi-VN')}</div>
                      <div className="flex items-center gap-2 text-slate-400 font-medium text-[11px] mt-1"><Clock size={12} />{createdDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-emerald-700">{new Intl.NumberFormat('vi-VN').format(ad.budget)}đ</p>
                      <p className="text-sm text-slate-400 font-black">{ad.budgetType}</p>
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={(e) => { e.preventDefault(); onDuplicate(ad); }} className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all shadow-sm border border-slate-100 hover:border-emerald-200 active:scale-90" title="Quick Clone"><Copy size={18} /></button>
                        {canEdit && (<button onClick={(e) => { e.preventDefault(); onEdit(ad); }} className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all shadow-sm border border-slate-100 hover:border-indigo-200 active:scale-90" title="Sửa"><Edit2 size={18} /></button>)}
                        {canDelete && (<button onClick={(e) => { e.preventDefault(); onDelete(ad.id); }} className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all shadow-sm border border-slate-100 hover:border-rose-200 active:scale-90" title="Xóa"><Trash2 size={18} /></button>)}
                        <Link to={`/ads/${ad.id}`} className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md active:scale-95 border border-indigo-500"><ExternalLink size={18} /></Link>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center"><span className={`px-3 py-1 rounded-full text-sm font-black uppercase ${getStatusStyle(ad.status)}`}>{ad.status}</span></td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center bg-slate-50/50">
                    <div className="flex flex-col items-center gap-3"><ImageIcon size={48} className="text-slate-200" /><p className="text-slate-400 font-black text-lg">Không tìm thấy mẫu quảng cáo nào.</p><p className="text-slate-400 font-medium text-sm">Hãy thử thay đổi bộ lọc hoặc tạo mẫu mới.</p></div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-slate-500 uppercase">Hiển thị:</label>
              <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10"><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select>
            </div>
            <p className="text-sm font-bold text-slate-500">Hiển thị <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredAds.length)}</span> trong tổng <span className="text-slate-900">{filteredAds.length}</span> mẫu</p>
          </div>
          <div className="flex items-center gap-1">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:hover:bg-transparent text-slate-600"><ChevronLeft size={20} /></button>
            <div className="flex items-center gap-1">{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {let pageNum; if (totalPages <= 5) pageNum = i + 1; else if (currentPage <= 3) pageNum = i + 1; else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i; else pageNum = currentPage - 2 + i; return (<button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`min-w-[36px] h-9 rounded-lg text-sm font-black transition-all ${currentPage === pageNum ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}>{pageNum}</button>);})}</div>
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:hover:bg-transparent text-slate-600"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsList;
