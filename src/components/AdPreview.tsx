
import React, { useState } from 'react';
import { Ad, AdPlatform } from '@/types';
import { MoreHorizontal, MessageSquare, Share2, ThumbsUp, Music, Send, ChevronRight, AlertCircle, ExternalLink } from 'lucide-react';

// Đồng bộ logo chính xác với AdsList
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

interface Props {
  ad: Ad;
}

const AdPreview: React.FC<Props> = ({ ad }) => {
  const { platform, content, fanpage, partnerBank } = ad;
  const [hasError, setHasError] = useState(false);

  const bankLogo = partnerBank ? BANK_LOGOS[partnerBank] : (ad.serviceCategory ? BANK_LOGOS[ad.serviceCategory] : null);

  const getHostname = (url: string) => {
    if (!url) return 'WEBSITE';
    try {
      return new URL(url).hostname;
    } catch {
      return 'WEBSITE';
    }
  };

  const getEmbeddableUrl = (url: string) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    if (url.includes('drive.google.com')) {
        const driveIdMatch = url.match(/\/d\/([^\/]+)/);
        if (driveIdMatch) return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
    }
    return null;
  };

  const renderMedia = (className: string) => {
    const mediaUrl = content.mediaUrl?.trim();
    const embedUrl = getEmbeddableUrl(mediaUrl);
    const hasPreviewLink = !!content.previewLink?.trim();
    const isNonDirect = mediaUrl?.includes('prnt.sc');

    if (hasError || !mediaUrl || isNonDirect) {
      if (hasPreviewLink) {
        return (
          <a href={content.previewLink} target="_blank" rel="noopener noreferrer" className={`${className} bg-indigo-50 hover:bg-indigo-100 transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center border-y border-slate-100 relative group/cta overflow-hidden`}>
            <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover/cta:opacity-100 transition-opacity" />
            <div className="bg-white p-5 rounded-3xl shadow-xl mb-4 group-hover/cta:scale-110 group-hover/cta:-translate-y-1 transition-all border border-indigo-100"><ExternalLink size={40} className="text-indigo-600" /></div>
            <p className="text-base font-black text-indigo-700 uppercase tracking-tight">Xem mẫu quảng cáo</p>
            <p className="text-[10px] font-bold text-indigo-400 mt-1 uppercase tracking-widest">Mở link preview chính thức</p>
          </a>
        );
      }
      return (
        <div className={`${className} bg-slate-50 flex flex-col items-center justify-center p-8 text-center border-y border-slate-100`}>
          {bankLogo ? <img src={bankLogo} alt="Logo" className="w-16 h-16 object-contain opacity-30 grayscale mb-3" /> : <AlertCircle size={40} className="text-slate-300 mb-2" />}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{hasError ? 'Link Media lỗi' : 'Chưa có nội dung Media'}</p>
        </div>
      );
    }

    if (embedUrl) {
      return (
        <div className={`${className} bg-black overflow-hidden relative`}>
          <iframe src={embedUrl} title="Media Embed" className="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
        </div>
      );
    }

    if (content.mediaType === 'video' || mediaUrl.match(/\.(mp4|mov|webm|ogg)$/i)) {
      return (
        <div className={`${className} bg-black flex items-center justify-center relative`}>
          <video src={mediaUrl} className="w-full h-full object-cover" controls autoPlay muted playsInline loop onError={() => setHasError(true)} />
        </div>
      );
    }

    return (
      <div className={`${className} bg-slate-100 relative overflow-hidden flex items-center justify-center`}>
        <img src={mediaUrl} alt="Ad Creative" className="w-full h-full object-cover" onError={() => setHasError(true)} />
      </div>
    );
  };

  const renderFacebook = () => (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm max-w-md mx-auto">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={fanpage.avatar} alt="Avatar" className="w-10 h-10 rounded-full bg-slate-100 object-cover" />
          <div>
            <h4 className="font-bold text-slate-800 text-sm">{fanpage.name}</h4>
            <p className="text-xs text-slate-500 font-medium">Sponsored • <span className="inline-block bg-slate-200 w-1 h-1 rounded-full align-middle mx-1"></span> Public</p>
          </div>
        </div>
        <MoreHorizontal className="text-slate-400" size={20} />
      </div>
      <div className="px-4 pb-3">
        <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed line-clamp-4 font-medium">{content.caption}</p>
      </div>
      {renderMedia("aspect-[1.91/1] w-full border-y border-slate-100 min-h-[220px]")}
      <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
        <div className="flex-1 mr-4">
          <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">{getHostname(content.destinationUrl)}</p>
          <h5 className="font-bold text-slate-800 truncate mt-0.5">{content.headline}</h5>
        </div>
        <button className="bg-slate-200 text-slate-800 text-sm font-bold px-4 py-2 rounded transition-colors whitespace-nowrap">{content.cta}</button>
      </div>
      <div className="p-3 border-t border-slate-100 flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-4"><div className="flex items-center gap-1.5"><ThumbsUp size={18} /> <span className="text-xs font-bold">Like</span></div><div className="flex items-center gap-1.5"><MessageSquare size={18} /> <span className="text-xs font-bold">Comment</span></div></div>
        <div className="flex items-center gap-1.5"><Share2 size={18} /> <span className="text-xs font-bold">Share</span></div>
      </div>
    </div>
  );

  const renderGoogle = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm">G</div>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Sponsored • {getHostname(content.destinationUrl)}</p>
      </div>
      <h3 className="text-xl text-blue-700 font-bold mb-2 leading-tight">{content.headline}</h3>
      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4 whitespace-pre-wrap">{content.caption}</p>
      {renderMedia("aspect-video rounded-xl mb-4 border border-slate-100 min-h-[180px]")}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {['Promotion', 'Latest News', 'Contact Us'].map(slink => (
          <span key={slink} className="text-blue-700 text-xs font-bold bg-blue-50 px-4 py-2 rounded-xl whitespace-nowrap border border-blue-100">{slink}</span>
        ))}
      </div>
    </div>
  );

  const renderTikTok = () => (
    <div className="max-w-[320px] mx-auto bg-black rounded-[32px] overflow-hidden aspect-[9/16] relative shadow-2xl border-[6px] border-slate-800 ring-4 ring-indigo-500/10">
      {renderMedia("absolute inset-0 w-full h-full opacity-95")}
      <div className="absolute inset-0 flex flex-col justify-end p-5 bg-gradient-to-t from-black/80 via-black/10 to-transparent">
        <div className="mb-4">
          <h4 className="text-white font-extrabold text-sm flex items-center gap-1">@{fanpage.name.replace(/\s/g, '').toLowerCase()}</h4>
          <p className="text-white text-xs mt-1.5 mb-2 line-clamp-3 font-medium leading-relaxed whitespace-pre-wrap">{content.caption}</p>
          <div className="flex items-center gap-2 text-white/90 text-[10px] font-bold">
            <div className="bg-white/20 p-1 rounded-full"><Music size={10} className="animate-spin-slow" /></div>
            <span className="truncate max-w-[150px]">Original Sound - Styled Music</span>
          </div>
        </div>
        <button className="bg-white text-black font-black py-3 px-4 rounded-lg flex items-center justify-between text-sm w-full mb-12 shadow-2xl transition-all hover:bg-slate-100">
          {content.cta}
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-6 text-white drop-shadow-lg">
        <div className="relative">
          <img src={fanpage.avatar} className="w-11 h-11 rounded-full border-2 border-white shadow-xl object-cover" alt="Avatar" />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-rose-500 rounded-full w-4 h-4 border border-white flex items-center justify-center">
            <div className="text-white text-[12px] font-black">+</div>
          </div>
        </div>
        <div className="flex flex-col items-center"><ThumbsUp size={26} fill="white" className="drop-shadow-sm"/><span className="text-[10px] font-black mt-1">12.4k</span></div>
        <div className="flex flex-col items-center"><MessageSquare size={26} fill="white" className="drop-shadow-sm"/><span className="text-[10px] font-black mt-1">345</span></div>
        <div className="flex flex-col items-center"><Send size={26} fill="white" className="drop-shadow-sm"/><span className="text-[10px] font-black mt-1">89</span></div>
      </div>
    </div>
  );

  switch (platform) {
    case AdPlatform.FACEBOOK: return renderFacebook();
    case AdPlatform.GOOGLE: return renderGoogle();
    case AdPlatform.TIKTOK: return renderTikTok();
    default: return <div className="p-12 text-center bg-slate-50 border-4 border-dashed border-slate-200 rounded-3xl text-slate-400 font-black">PREVIEW NOT AVAILABLE</div>;
  }
};

export default AdPreview;
