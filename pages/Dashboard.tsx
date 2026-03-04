
import React from 'react';
// Add Link import from react-router-dom
import { Link } from 'react-router-dom';
import { Ad, AdStatus } from '@/types';
import { 
  FileClock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Calendar,
  AlertCircle,
  PieChart as PieIcon,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface Props {
  ads: Ad[];
  onCreateRequest: () => void;
}

const Dashboard: React.FC<Props> = ({ ads, onCreateRequest }) => {
  const stats = [
    { label: 'Đang chờ duyệt', value: ads.filter(a => a.status === AdStatus.PENDING).length, icon: FileClock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Đã phê duyệt', value: ads.filter(a => a.status === AdStatus.APPROVED).length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Bị từ chối', value: ads.filter(a => a.status === AdStatus.REJECTED).length, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Sắp triển khai', value: 4, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const chartData = [
    { name: 'Approved', count: ads.filter(a => a.status === AdStatus.APPROVED).length, color: '#10b981' },
    { name: 'Pending', count: ads.filter(a => a.status === AdStatus.PENDING).length, color: '#f59e0b' },
    { name: 'In Review', count: ads.filter(a => a.status === AdStatus.IN_REVIEW).length, color: '#6366f1' },
    { name: 'Rejected', count: ads.filter(a => a.status === AdStatus.REJECTED).length, color: '#f43f5e' },
  ];

  // Group by service category
  const serviceCountsMap: Record<string, number> = {};
  ads.forEach(ad => {
    serviceCountsMap[ad.serviceCategory] = (serviceCountsMap[ad.serviceCategory] || 0) + 1;
  });
  const serviceData = Object.entries(serviceCountsMap).map(([name, value]) => ({ name, value }));
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#8b5cf6', '#06b6d4'];

  return (
    <div className="p-8 h-full overflow-y-auto scrollbar-hide space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tổng quan vận hành</h2>
          <p className="text-slate-500 font-medium">Tình trạng phê duyệt nội dung quảng cáo thời gian thực.</p>
        </div>
        <button 
          onClick={onCreateRequest}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <Plus size={18} />
          Tạo Ads Mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow cursor-default group">
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
            </div>
            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Funnel */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-indigo-600" /> Tiến độ phê duyệt
            </h3>
            <select className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 rounded-lg px-3 py-1.5 focus:outline-none">
              <option>30 ngày qua</option>
              <option>7 ngày qua</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown by Service */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <PieIcon size={20} className="text-indigo-600" /> Phân bổ theo dịch vụ
          </h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2 max-h-[140px] overflow-y-auto pr-2 scrollbar-hide">
            {serviceData.map((s, idx) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-xs font-bold text-slate-700">{s.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-400">{s.value} Ads</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <AlertCircle size={20} className="text-amber-600" /> Cần xử lý ngay
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ads.filter(a => a.status === AdStatus.PENDING).slice(0, 4).map(ad => (
            <div key={ad.id} className="flex flex-col p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase">{ad.serviceCategory}</span>
                <span className="text-[10px] text-slate-400 font-bold">{ad.id}</span>
              </div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{ad.adName}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Đang chờ phê duyệt mẫu {ad.platform}</p>
              <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <img src="https://picsum.photos/seed/u1/32/32" className="w-6 h-6 rounded-full border-2 border-white" />
                  <img src="https://picsum.photos/seed/u2/32/32" className="w-6 h-6 rounded-full border-2 border-white" />
                </div>
                <Link to={`/ads/${ad.id}`} className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider hover:underline">Chi tiết</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
