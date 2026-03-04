
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  FileCheck, 
  History, 
  RefreshCcw, 
  Bell, 
  Search,
  Plus,
  LogOut,
  User as UserIcon,
  Users,
  X,
  Send
} from 'lucide-react';
import { Ad, AdStatus, AdPlatform } from '@/types';
import { supabase } from '@/supabase';
import { User } from '@supabase/supabase-js';

// Components
import Auth from '@/components/Auth.tsx';
import Dashboard from '@/pages/Dashboard.tsx';
import AdsList from '@/pages/AdsList.tsx';
import AdDetail from '@/pages/AdDetail.tsx';
import Timeline from '@/pages/Timeline.tsx';
import CreateAdModal from '@/components/CreateAdModal.tsx';

const App: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const isUpdatingRef = useRef(false);
  const currentUserName = useMemo(() => user?.email?.split('@')[0] || 'Unknown', [user]);

  // Khởi tạo quyền Notification và Realtime Listener
  useEffect(() => {
    if (!user) return;

    // 1. Yêu cầu quyền thông báo từ trình duyệt
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    // 2. Thiết lập Realtime Subscription để lắng nghe thay đổi trạng thái Ads
    const channel = supabase
      .channel('ad-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ads',
          filter: `owner=eq.${currentUserName}` // Chỉ lắng nghe ads của chính mình
        },
        (payload) => {
          const oldAd = payload.old as Ad;
          const newAd = payload.new as Ad;

          // Nếu trạng thái thay đổi từ cái gì đó sang "Approved"
          if (oldAd.status !== AdStatus.APPROVED && newAd.status === AdStatus.APPROVED) {
            // Hiển thị thông báo trình duyệt
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Quảng cáo đã được phê duyệt! 🎉", {
                body: `Mẫu quảng cáo "${newAd.adName}" của bạn vừa được quản trị viên phê duyệt.`,
                icon: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
                tag: newAd.id // Tránh hiển thị trùng lặp cho cùng 1 Ad
              });
            }
            
            // Cập nhật lại state local để UI đồng bộ ngay lập tức
            setAds(prev => prev.map(a => a.id === newAd.id ? newAd : a));
          } else {
            // Cập nhật các thay đổi khác (ví dụ: bị reject, sửa thông tin)
            setAds(prev => prev.map(a => a.id === newAd.id ? newAd : a));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentUserName]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchAds();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && !isUpdatingRef.current) {
        fetchAds();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAds = async () => {
    if (isUpdatingRef.current) return;
    try {
      if (ads.length === 0) setLoading(true);
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('lastUpdated', { ascending: false });

      if (error) throw error;
      if (data) setAds(data);
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAd = async (updatedAd: Ad, stayOpen: boolean = false): Promise<void> => {
    isUpdatingRef.current = true;
    try {
      const { id, ...payload } = updatedAd;
      const { error } = await supabase.from('ads').update(payload).eq('id', id);
      
      if (error) {
        alert('Lỗi cập nhật: ' + error.message);
        return;
      }
      setAds(prev => prev.map(a => a.id === updatedAd.id ? updatedAd : a));
      if (!stayOpen) { setIsCreateModalOpen(false); setEditingAd(null); }
    } finally {
      isUpdatingRef.current = false;
    }
  };

  const createAd = async (newAd: Ad, stayOpen: boolean = false) => {
    isUpdatingRef.current = true;
    try {
      const { id, ...payload } = newAd; 
      const adWithCorrectOwner = { 
        ...payload, 
        owner: currentUserName,
        ownerEmail: user?.email
      };
      const { data, error } = await supabase.from('ads').insert([adWithCorrectOwner]).select();
      
      if (error) {
        alert('Lỗi tạo mới (Supabase): ' + error.message);
        return;
      }
      
      if (data && data[0]) {
        const createdAd = data[0];
        setAds(prev => [createdAd, ...prev]);
      }
      
      if (!stayOpen) { setIsCreateModalOpen(false); setEditingAd(null); }
    } finally {
      isUpdatingRef.current = false;
    }
  };

  const deleteAd = async (id: string) => {
    if (!window.confirm('XÁC NHẬN: Bạn muốn xóa vĩnh viễn mẫu quảng cáo này?')) return;
    
    isUpdatingRef.current = true;
    const backupAds = [...ads];
    
    setAds(prev => prev.filter(a => a.id !== id));

    if (id.startsWith('ad_') || id.startsWith('clone_')) {
      isUpdatingRef.current = false;
      return;
    }

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);
      
      if (error) {
        setAds(backupAds);
        alert(`Lỗi xóa: ${error.message}`);
      }
    } catch (err: any) {
      setAds(backupAds);
      alert('Lỗi hệ thống khi xóa.');
    } finally {
      isUpdatingRef.current = false;
      fetchAds();
    }
  };

  const handleEditRequest = (ad: Ad) => {
    setEditingAd(ad);
    setIsCreateModalOpen(true);
  };

  const handleDuplicateRequest = (ad: Ad) => {
    const duplicatedAd = { 
      ...ad, 
      id: `clone_${Date.now()}`, 
      adName: `${ad.adName} (Bản sao)`,
      status: AdStatus.PENDING,
      lastUpdated: new Date().toISOString()
    } as any;
    setEditingAd(duplicatedAd);
    setIsCreateModalOpen(true);
  };

  const creators = useMemo(() => {
    const owners = ads.map(ad => ad.owner).filter(Boolean);
    return Array.from(new Set(owners)).sort();
  }, [ads]);

  if (!user) return <Auth />;

  const isRealDatabaseId = (id: string) => {
    return id && !id.startsWith('ad_') && !id.startsWith('clone_');
  };

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col flex-shrink-0 shadow-sm z-30">
          <div className="p-6 flex items-center gap-3 border-b border-slate-100 bg-slate-50/50">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-inner">
              <FileCheck className="text-white w-6 h-6" />
            </div>
            <h1 className="font-black text-slate-900 text-lg tracking-tight">AdCMS <span className="text-indigo-600">PRO</span></h1>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
            <nav className="space-y-1">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Menu chính</p>
              <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900'}`}><LayoutDashboard size={18} /> Tổng quan</NavLink>
              <NavLink to="/ads" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900'}`}><Layers size={18} /> Quản lý Ads</NavLink>
              <NavLink to="/timeline" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900'}`}><History size={18} /> Creative Assets</NavLink>
            </nav>

            <nav className="space-y-1">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Users size={12} /> Người tạo
              </p>
              {creators.map(creator => (
                <NavLink 
                  key={creator}
                  to={`/creator/${creator}`} 
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-sm ${isActive ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${window.location.hash.includes(`/creator/${creator}`) ? 'bg-white' : 'bg-slate-300'}`}></div>
                  {creator}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-100">
            <button onClick={() => { setEditingAd(null); setIsCreateModalOpen(true); }} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black transition-all shadow-lg active:scale-95 border border-indigo-500"><Plus size={18} /> Tạo Ads Mới</button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-20 flex-shrink-0">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-1.5 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm group">
              <Search size={18} className="text-slate-400 group-focus-within:text-indigo-600" />
              <input type="text" placeholder="Tìm chiến dịch, mẫu ads..." className="bg-transparent border-none outline-none text-slate-900 font-bold w-72 text-sm" />
            </div>
            <div className="flex items-center gap-6">
              <button className="relative text-slate-900 hover:text-indigo-600"><Bell size={20} /><span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span></button>
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-900 leading-tight">{currentUserName}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Admin</p>
                </div>
                <div className="relative group">
                  <button className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 ring-2 ring-indigo-100"><UserIcon size={20} /></button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 hidden group-hover:block z-50">
                    <button onClick={async () => await supabase.auth.signOut()} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-sm"><LogOut size={16} /> Đăng xuất</button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 min-h-0 relative">
            {loading && ads.length === 0 ? (
              <div className="flex items-center justify-center h-full"><RefreshCcw className="animate-spin text-indigo-600" size={40} /></div>
            ) : (
              <Routes>
                <Route path="/" element={<Dashboard ads={ads} onCreateRequest={() => { setEditingAd(null); setIsCreateModalOpen(true); }} />} />
                <Route path="/ads" element={<AdsList ads={ads} onCreateRequest={() => { setEditingAd(null); setIsCreateModalOpen(true); }} onEdit={handleEditRequest} onDelete={deleteAd} onDuplicate={handleDuplicateRequest} />} />
                <Route path="/creator/:username" element={<AdsList ads={ads} onCreateRequest={() => { setEditingAd(null); setIsCreateModalOpen(true); }} onEdit={handleEditRequest} onDelete={deleteAd} onDuplicate={handleDuplicateRequest} />} />
                <Route path="/ads/:id" element={<AdDetail ads={ads} onUpdate={updateAd} />} />
                <Route path="/timeline" element={<Timeline ads={ads} />} />
              </Routes>
            )}
          </main>
        </div>
      </div>

      <CreateAdModal 
        key={editingAd ? editingAd.id : 'new-modal'}
        isOpen={isCreateModalOpen} 
        onClose={() => { setIsCreateModalOpen(false); setEditingAd(null); }} 
        onSubmit={isRealDatabaseId(editingAd?.id || '') ? updateAd : createAd} 
        initialData={editingAd || undefined}
        currentUserName={currentUserName}
      />
    </HashRouter>
  );
};

export default App;
