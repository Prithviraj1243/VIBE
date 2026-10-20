import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Check, X, Sparkles, Filter, Search, Instagram, Linkedin } from 'lucide-react';

export const CommentsWorkspace: React.FC = () => {
  const { comments, approveCommentReply } = useApp();
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredComments = comments.filter(c => {
    const matchesPlatform = filterPlatform === 'all' || c.platform === filterPlatform;
    const matchesSearch = c.commentText.toLowerCase().includes(searchTerm.toLowerCase()) || c.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Comments & Triage Hub
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#F28C45]/15 text-[#F28C45] font-semibold">
              Engagement Partner Active
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Intent-classified comment streams with tone-matched draft replies awaiting your 1-click review.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Filter by author or text..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-[#181818] border border-[#2e2e2e] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-[#F28C45]"
            />
          </div>

          <select
            value={filterPlatform}
            onChange={e => setFilterPlatform(e.target.value)}
            className="bg-[#181818] border border-[#2e2e2e] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="all">All Channels</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredComments.map(comment => (
          <div
            key={comment.id}
            className="p-5 rounded-2xl bg-[#181818] border border-[#2e2e2e] space-y-4 hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={comment.authorAvatar}
                  alt={comment.author}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{comment.author}</h4>
                    <span className="text-[11px] text-neutral-400">on {comment.postTitle}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      comment.platform === 'instagram' ? 'bg-pink-500/10 text-pink-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {comment.platform}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 capitalize font-medium">
                      Intent: {comment.intent}
                    </span>
                    <span className="text-[11px] text-neutral-400">• {comment.timestamp}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {comment.status === 'replied' ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    Dispatched
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-orange-500/10 text-[#F28C45] text-xs font-bold border border-orange-500/20">
                    Pending Review
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs md:text-sm text-neutral-200 pl-13 italic">
              "{comment.commentText}"
            </p>

            {/* AI Draft Box */}
            <div className="p-4 rounded-xl bg-[#202020] border border-[#2e2e2e] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#F28C45]">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={13} /> Tone-Matched AI Draft:
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Agent: Engagement Partner</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {comment.suggestedReply}
              </p>

              {comment.status === 'pending' && (
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => approveCommentReply(comment.id, comment.suggestedReply)}
                    className="px-4 py-1.5 rounded-lg bg-[#F28C45] hover:bg-[#e07b34] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Check size={14} /> Approve & Dispatch Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
