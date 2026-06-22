import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Youtube, Facebook, Instagram, Users, PlusCircle } from 'lucide-react';
import { DashboardData } from './types';

function getPlatformIcon(platform: string) {
  switch (platform) {
    case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
    case 'instagram': return <Instagram className="w-4 h-4 text-pink-600" />;
    case 'facebook_group': return <Users className="w-4 h-4 text-indigo-500" />;
    case 'youtube':
    default: return <Youtube className="w-4 h-4 text-red-600" />;
  }
}

export default function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stagnationThreshold, setStagnationThreshold] = useState<number>(0.5);
  const [newChannelId, setNewChannelId] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('week'); // Default to week based on Block C Day 2 requirements

  // Group manual load
  const [addingGroupMembers, setAddingGroupMembers] = useState<string | null>(null);
  const [groupMembersValue, setGroupMembersValue] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [period]); // Re-fetch when period changes

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard/metrics?period=${period}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForceIngest = async () => {
    setLoading(true);
    await fetch('/api/dashboard/ingest', { method: 'POST' });
    await fetchData();
  };

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelId) return;
    try {
      await fetch('/api/dashboard/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: newChannelId })
      });
      setNewChannelId('');
      handleForceIngest();
    } catch(err) {
      console.error('Error adding channel', err);
    }
  };

  const submitGroupMembers = async (channelId: string) => {
    if (!groupMembersValue) return;
    try {
      await fetch('/api/dashboard/groups/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, members: parseInt(groupMembersValue, 10) })
      });
      setAddingGroupMembers(null);
      setGroupMembersValue('');
      await fetchData();
    } catch(err) {
      console.error('Error adding members', err);
    }
  };

  if (!data) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#F8FAFC] text-slate-900">
        <svg className={`w-8 h-8 text-indigo-600 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    );
  }

  const displayedChannels = selectedChannelId ? data.channels.filter(ch => ch.channelId === selectedChannelId) : data.channels;
  const displayedVideos = selectedChannelId ? data.videos.filter(v => v.channelId === selectedChannelId) : data.videos;

  const displayedAvgEngagement = displayedChannels.length > 0 
    ? displayedChannels.reduce((sum, ch) => sum + ch.metrics.engagementPromedio, 0) / displayedChannels.length
    : 0;

  let shortsER = 0, shortsCount = 0, longsER = 0, longsCount = 0;
  displayedVideos.forEach(v => {
    if (v.views > 0) {
      if (v.isShort) { shortsER += v.engagementRate; shortsCount++; }
      else { longsER += v.engagementRate; longsCount++; }
    }
  });
  const aggShorts = shortsCount > 0 ? shortsER / shortsCount : 0;
  const aggLongs = longsCount > 0 ? longsER / longsCount : 0;

  const shortsShare = aggShorts + aggLongs > 0
    ? (aggShorts / (aggShorts + aggLongs)) * 100
    : (displayedVideos.length === 0 ? 0 : 35);
  const longsShare = displayedVideos.length === 0 && shortsShare === 0 ? 0 : 100 - shortsShare;

  return (
    <div className="flex flex-col h-full w-full bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 text-white p-2 rounded-lg shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight uppercase text-indigo-900">RPSoft Dashboard v1 <span className="text-slate-400 font-normal">| YouTube Engine</span></h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Director: Wilber Peralta • Bootcamp Hackathon</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase">API Quota / System Status</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 w-[14%] h-full"></div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600">ONLINE</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-200 shrink-0"></div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Period</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-xs font-bold bg-slate-100 border-none rounded-md px-2 py-1.5 uppercase focus:ring-0 text-slate-700 appearance-none outline-none cursor-pointer hover:bg-slate-200 transition-colors"
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="all">All-Time</option>
            </select>
          </div>
          <div className="h-8 w-[1px] bg-slate-200 shrink-0"></div>

          <form onSubmit={handleAddChannel} className="flex gap-2">
            <input 
              type="text" 
              placeholder="YouTube Channel ID..."
              value={newChannelId}
              onChange={e => setNewChannelId(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-w-[200px]"
            />
            <button type="submit" disabled={loading || !newChannelId} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-2 rounded-md flex items-center justify-center transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            </button>
          </form>

          <button 
            onClick={handleForceIngest}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-xs font-bold uppercase tracking-tight transition-colors"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            ) : "Sync Data"}
          </button>
        </div>
      </header>

      <div className="flex-grow p-6 overflow-hidden flex flex-col gap-6 lg:flex-row">
        {/* LEADERBOARD & SETTINGS (LEFT COLUMN) */}
        <div className="w-full lg:w-[280px] xl:w-[320px] shrink-0 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col h-[60%]">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest shrink-0">Growth Leaderboard</h3>
            <div className="space-y-3 overflow-y-auto pr-1 flex-grow scrollbar-thin">
              {data.channels.map((ch, idx) => {
                const isStagnant = ch.metrics.growthRatePercent <= stagnationThreshold;
                const isSelected = selectedChannelId === ch.channelId;
                const activeClasses = isSelected ? "ring-2 ring-indigo-500 shadow-md " : "cursor-pointer hover:bg-slate-50 opacity-90 hover:opacity-100 transition-all ";
                
                const renderChannelInfo = (titleColor: string, subColor: string, isLeader: boolean) => (
                  <div className="flex-grow min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {getPlatformIcon(ch.platform)}
                      <p className={`text-xs font-bold truncate ${titleColor}`}>{ch.channelName}</p>
                    </div>
                    <p className={`text-[10px] ${subColor}`}>{isLeader ? 'Leader (Top Growth)' : 'Snapshot: Daily'}</p>
                  </div>
                );

                const renderGroupManualInput = () => {
                  if (ch.platform !== 'facebook_group') return null;
                  if (addingGroupMembers === ch.channelId) {
                    return (
                      <div className="w-full mt-2 flex gap-1 items-center" onClick={e => e.stopPropagation()}>
                        <input type="number" 
                          value={groupMembersValue} 
                          onChange={e => setGroupMembersValue(e.target.value)}
                          placeholder="Members count"
                          className="text-[10px] p-1 border rounded w-full border-slate-300 focus:outline-indigo-500" />
                        <button onClick={() => submitGroupMembers(ch.channelId)} className="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </button>
                        <button onClick={() => setAddingGroupMembers(null)} className="bg-slate-200 text-slate-600 p-1 rounded hover:bg-slate-300">
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    );
                  }
                  return (
                    <button className="absolute bottom-2 right-2 text-indigo-400 hover:text-indigo-600 z-10" onClick={(e) => { e.stopPropagation(); setAddingGroupMembers(ch.channelId); setGroupMembersValue(''); }}>
                       <PlusCircle className="w-3.5 h-3.5" />
                    </button>
                  );
                };

                if (isStagnant) {
                  return (
                    <div key={ch.channelId} onClick={() => setSelectedChannelId(isSelected ? null : ch.channelId)} className={`${activeClasses} flex flex-col p-3 border border-red-100 bg-red-50 rounded-lg relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] px-1 font-bold italic uppercase">Stagnant</div>
                      <div className="flex items-center justify-between w-full relative">
                        {renderChannelInfo('text-red-900', 'text-red-400', false)}
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-red-600">{ch.metrics.growthRatePercent > 0 ? '+' : ''}{ch.metrics.growthRatePercent.toFixed(1)}%</p>
                          <p className="text-[9px] text-red-400 font-mono">Gain: {ch.metrics.dailyGrowth > 0 ? '+' : ''}{ch.metrics.dailyGrowth}</p>
                        </div>
                      </div>
                      {renderGroupManualInput()}
                    </div>
                  );
                } else if (idx === 0) {
                  return (
                    <div key={ch.channelId} onClick={() => setSelectedChannelId(isSelected ? null : ch.channelId)} className={`${activeClasses} flex flex-col p-3 bg-indigo-50 border border-indigo-100 rounded-lg relative overflow-hidden`}>
                      <div className="flex items-center justify-between w-full relative">
                        {renderChannelInfo('text-indigo-900', 'text-indigo-400', true)}
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-emerald-600">+{ch.metrics.growthRatePercent.toFixed(1)}%</p>
                          <p className="text-[9px] text-indigo-400 font-mono">Gain: +{ch.metrics.dailyGrowth}</p>
                        </div>
                      </div>
                      {renderGroupManualInput()}
                    </div>
                  );
                } else {
                  return (
                    <div key={ch.channelId} onClick={() => setSelectedChannelId(isSelected ? null : ch.channelId)} className={`${activeClasses} flex flex-col p-3 border border-slate-100 rounded-lg relative overflow-hidden`}>
                      <div className="flex items-center justify-between w-full relative">
                        {renderChannelInfo('text-slate-800', 'text-slate-500', false)}
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-slate-700">{ch.metrics.growthRatePercent > 0 ? '+' : ''}{ch.metrics.growthRatePercent.toFixed(1)}%</p>
                          <p className="text-[9px] text-slate-400 font-mono">Gain: {ch.metrics.dailyGrowth > 0 ? '+' : ''}{ch.metrics.dailyGrowth}</p>
                        </div>
                      </div>
                      {renderGroupManualInput()}
                    </div>
                  );
                }
              })}
              {data.channels.length === 0 && <p className="text-xs text-slate-500 p-2 text-center">No channels found</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm shrink-0">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">Global Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-2">Stagnation Threshold (%)</label>
                <input 
                  type="range" 
                  className="w-full accent-indigo-600" 
                  value={stagnationThreshold} 
                  onChange={e => setStagnationThreshold(parseFloat(e.target.value))}
                  min="0" max="5" step="0.1" 
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>0.0%</span>
                  <span className="font-bold text-indigo-600">{stagnationThreshold.toFixed(1)}% (Set)</span>
                  <span>5.0%</span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center">
                <p className="text-[10px] text-slate-400 uppercase leading-relaxed">
                  Automatic Sync Every<br/><span className="text-slate-700 font-bold tracking-widest">06:00 AM (CRON ACTIVE)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN KPIS AND CHARTS (RIGHT COLUMN) */}
        <div className="flex-grow flex flex-col gap-6 overflow-hidden">
          <div className="grid grid-cols-3 gap-6 shrink-0">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-opacity">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Average Engagement</p>
              <p className="text-3xl font-bold text-slate-900">{displayedAvgEngagement.toFixed(2)}%</p>
              <p className="text-[10px] text-emerald-500 font-bold mt-2 uppercase tracking-wide">{selectedChannelId ? 'Selected Channel' : 'System Aggregated'}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-opacity">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Content Split (Engagement)</p>
              <div className="flex h-8 bg-slate-100 rounded-md mt-4 overflow-hidden">
                <div className="bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold transition-all" style={{width: `${longsShare}%`}}>{longsShare.toFixed(0)}% Video</div>
                <div className="bg-amber-400 flex items-center justify-center text-[10px] text-white font-bold transition-all" style={{width: `${shortsShare}%`}}>{shortsShare.toFixed(0)}% Short</div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-opacity">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{selectedChannelId ? 'Channel Engagement' : 'Top Channel Engagement'}</p>
              <p className="text-3xl font-bold text-indigo-600 italic">
                {displayedChannels.length > 0 ? [...displayedChannels].sort((a,b) => b.metrics.engagementPromedio - a.metrics.engagementPromedio)[0].metrics.engagementPromedio.toFixed(1) : 0}%
              </p>
              <p className="text-[10px] text-slate-400 mt-2 italic truncate">
                "{displayedChannels.length > 0 ? [...displayedChannels].sort((a,b) => b.metrics.engagementPromedio - a.metrics.engagementPromedio)[0].channelName : 'N/A'}"
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-grow min-h-0">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col p-5 overflow-hidden">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Historical Snapshot Series</h3>
                <span className="text-[10px] border border-slate-200 rounded px-2 py-1 uppercase font-bold text-slate-500 bg-white">
                  {selectedChannelId && displayedChannels.length > 0 ? displayedChannels[0].channelName : 'ALL CHANNELS'}
                </span>
              </div>
              <div className="flex-grow min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <XAxis dataKey="date" type="category" allowDuplicatedCategory={false} tick={{fontSize: 10, fill: '#94a3b8'}} stroke="#cbd5e1" />
                    <YAxis tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(val)} tick={{fontSize: 10, fill: '#94a3b8'}} stroke="#cbd5e1" width={40} />
                    <Tooltip formatter={(val: number) => new Intl.NumberFormat('en-US').format(val)} contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                    {displayedChannels.map((ch, i) => (
                      <Line key={ch.channelId} dataKey="subscribers" data={ch.history} name={ch.channelName} stroke={['#4f46e5', '#38bdf8', '#fbbf24', '#f43f5e', '#10b981'][i % 5]} strokeWidth={2} dot={{ r: 3, strokeWidth: 1 }} activeDot={{ r: 5 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col p-5 overflow-hidden">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 shrink-0">Success Video Ranking</h3>
              <div className="overflow-y-auto flex-grow scrollbar-thin">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-slate-100">
                      <th className="pb-3 pr-2 text-[10px] font-bold text-slate-400 uppercase text-left">Title / Format</th>
                      <th className="pb-3 px-3 text-[10px] font-bold text-slate-400 uppercase text-right">Views Gained</th>
                      <th className="pb-3 px-3 text-[10px] font-bold text-slate-400 uppercase text-right">Interactions</th>
                      <th className="pb-3 pl-3 text-[10px] font-bold text-slate-400 uppercase text-right">Engagement</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {displayedVideos.map((v) => {
                      const channelInfo = data.channels.find(c => c.channelId === v.channelId);
                      return (
                        <tr key={v.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                          <td className="py-3 pr-2">
                            <span className="font-bold text-slate-900 line-clamp-1" title={v.title}>{v.title}</span>
                            <div className="flex gap-2 items-center mt-1">
                              <span className={`block text-[9px] uppercase font-bold flex items-center gap-1 ${v.isShort ? 'text-amber-500' : 'text-indigo-500'}`}>
                                {channelInfo && channelInfo.platform !== 'youtube' ? (
                                  <>
                                    <span className="opacity-70 scale-75">{getPlatformIcon(channelInfo.platform)}</span>
                                    {channelInfo.platform === 'facebook' ? 'Post' : 'Post'}
                                  </>
                                ) : (
                                  <>
                                    <span className="opacity-70 scale-75"><Youtube className="w-4 h-4 text-red-600" /></span>
                                    {v.isShort ? 'Short' : 'Video'}
                                  </>
                                )}
                              </span>
                              {!selectedChannelId && channelInfo && (
                                <span className="text-[9px] text-slate-400 truncate max-w-[120px]">• {channelInfo.channelName}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-600 font-bold">+{v.viewsGained?.toLocaleString() || v.views.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-400">{v.interacciones.toLocaleString()}</td>
                          <td className="py-3 pl-3 text-right font-bold text-[11px] text-indigo-600">{v.engagementRate.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                    {displayedVideos.length === 0 && (
                      <tr><td colSpan={4} className="py-4 text-center text-slate-400 text-xs">No videos available</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="px-8 py-3 bg-slate-900 text-slate-500 text-[10px] uppercase font-bold tracking-widest flex justify-between shrink-0">
        <div className="flex gap-4">
          <span>Backend: NestJS v9.x</span>
          <span>Data: YouTube Data API v3</span>
          <span>Ingestion Status: <span className="text-emerald-400">Standby</span></span>
        </div>
        <div>
          © 2024 RPSoft Systems - Confidential
        </div>
      </footer>
    </div>
  );
}
