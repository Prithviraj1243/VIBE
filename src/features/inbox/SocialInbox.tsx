import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Inbox, Sparkles, Send, Search, Star, CheckCheck, MessageSquare } from 'lucide-react';

export const SocialInbox: React.FC = () => {
  const { messages } = useApp();
  const [selectedId, setSelectedId] = useState<string>(messages[0]?.id || '');
  const [replyText, setReplyText] = useState<string>('');

  const activeMsg = messages.find(m => m.id === selectedId) || messages[0];

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    alert(`Reply sent to ${activeMsg.sender} via safe platform queue!`);
    setReplyText('');
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Social Inbox & Lead Triage
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
              Inbox Assistant Active
            </span>
          </h1>
          <p className="text-xs text-neutral-400">
            Monitors inbound direct messages for business leads, sponsorships, and collaborations.
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-hidden">
        {/* Messages List (5 cols) */}
        <div className="md:col-span-5 bg-[#181818] border border-[#2e2e2e] rounded-2xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#262626]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full bg-[#121212] border border-[#2e2e2e] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#262626]">
            {messages.map(item => {
              const isSelected = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    setReplyText(item.suggestedResponse);
                  }}
                  className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                    isSelected ? 'bg-[#222222]' : 'hover:bg-[#1d1d1d]'
                  }`}
                >
                  <img
                    src={item.senderAvatar}
                    alt={item.sender}
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-neutral-700"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">{item.sender}</h4>
                      <span className="text-[10px] text-neutral-400">{item.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-mono bg-neutral-800 text-neutral-300">
                        {item.platform}
                      </span>
                      {item.isLead && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                          Client Lead
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 truncate mt-1.5">{item.preview}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Details (7 cols) */}
        <div className="md:col-span-7 bg-[#181818] border border-[#2e2e2e] rounded-2xl flex flex-col justify-between overflow-hidden">
          {activeMsg && (
            <>
              {/* Header */}
              <div className="p-4 border-b border-[#262626] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activeMsg.senderAvatar}
                    alt={activeMsg.sender}
                    className="w-9 h-9 rounded-full object-cover border border-neutral-700"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{activeMsg.sender}</h3>
                    <p className="text-[10px] text-neutral-400">Direct message channel via {activeMsg.platform}</p>
                  </div>
                </div>

                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                  Lead Qualified
                </span>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {/* AI Executive Summary Box */}
                <div className="p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/20 text-xs space-y-1">
                  <span className="font-bold text-[#F28C45] flex items-center gap-1.5">
                    <Sparkles size={13} /> AI Intelligence Summary:
                  </span>
                  <p className="text-neutral-300">{activeMsg.aiSummary}</p>
                </div>

                {activeMsg.messages.map((m: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-start">
                    <span className="text-[10px] text-neutral-400 mb-1">{m.timestamp}</span>
                    <div className="p-3 rounded-xl bg-[#222222] border border-[#2e2e2e] text-xs text-white max-w-md">
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-[#262626] bg-[#141414] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="text-[#F28C45] font-semibold flex items-center gap-1">
                    <Sparkles size={12} /> Suggested Response Ready
                  </span>
                  <span>Tone: Direct & Warm</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText || activeMsg.suggestedResponse}
                    onChange={e => setReplyText(e.target.value)}
                    className="flex-1 bg-[#181818] border border-[#2e2e2e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F28C45]"
                  />
                  <button
                    onClick={handleSendReply}
                    className="px-4 py-2 rounded-xl bg-[#F28C45] hover:bg-[#e07b34] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Dispatch</span>
                    <Send size={13} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
