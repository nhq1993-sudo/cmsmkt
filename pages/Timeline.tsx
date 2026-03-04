
import React from 'react';
import { Ad } from '@/types';
import { Camera, Video, User, Clock, Link as LinkIcon, History } from 'lucide-react';

interface Props {
  ads: Ad[];
}

const Timeline: React.FC<Props> = ({ ads }) => {
  // Extract asset events from ads for demo
  const timelineEvents = ads.map(ad => ({
    id: `ev-${ad.id}`,
    adName: ad.adName,
    user: ad.owner,
    timestamp: ad.lastUpdated,
    type: ad.content.mediaType,
    source: 'Creative Shared Folder / Q2 Campaign',
    note: ad.version > 1 ? `Revision v${ad.version} uploaded.` : 'Initial creative asset synced.'
  })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="p-8 h-full overflow-y-auto scrollbar-hide space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Creative Timeline</h2>
        <p className="text-slate-500">Track source origins and version history of all visual assets.</p>
      </div>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>
        
        <div className="space-y-8 pb-12">
          {timelineEvents.map((event, idx) => (
            <div key={event.id} className="relative pl-16">
              <div className="absolute left-6 top-1.5 w-4 h-4 rounded-full bg-white border-4 border-indigo-600"></div>
              
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                      {event.type === 'image' ? <Camera size={24} /> : <Video size={24} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{event.adName}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <User size={14} /> {event.user}
                        <span className="text-slate-300">•</span>
                        <Clock size={14} /> {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Source Path</p>
                    <div className="flex items-center gap-2 text-indigo-600 font-medium text-xs">
                      <LinkIcon size={14} />
                      {event.source}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <History size={16} className="text-slate-400" />
                    <span>{event.note}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
