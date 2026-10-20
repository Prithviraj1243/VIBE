import React from 'react';
import { BarChart3, TrendingUp, Users, Eye, Sparkles, ArrowUpRight } from 'lucide-react';

export const AnalyticsWorkspace: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Performance & Growth Intelligence
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
              Live Mock Data
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Aggregated cross-platform analytics for Instagram and LinkedIn without fabricated metrics.
          </p>
        </div>

        <div className="text-xs text-neutral-400">
          Cycle: <strong className="text-white">Last 30 Days</strong>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#181818] border border-[#2e2e2e]">
          <span className="text-xs text-neutral-400 font-medium">Total Impressions</span>
          <div className="text-2xl font-black text-white mt-2">184,200</div>
          <div className="flex items-center gap-1 text-emerald-400 text-xs mt-1">
            <TrendingUp size={14} /> +24.8% vs last month
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#181818] border border-[#2e2e2e]">
          <span className="text-xs text-neutral-400 font-medium">Cross-Platform Engagement</span>
          <div className="text-2xl font-black text-white mt-2">5.6%</div>
          <div className="flex items-center gap-1 text-emerald-400 text-xs mt-1">
            <TrendingUp size={14} /> +1.2% benchmark
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#181818] border border-[#2e2e2e]">
          <span className="text-xs text-neutral-400 font-medium">Qualified Client Inquiries</span>
          <div className="text-2xl font-black text-white mt-2">14</div>
          <div className="flex items-center gap-1 text-emerald-400 text-xs mt-1">
            <TrendingUp size={14} /> 4 converted calls
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#181818] border border-[#2e2e2e]">
          <span className="text-xs text-neutral-400 font-medium">Time Reclaimed by AI</span>
          <div className="text-2xl font-black text-white mt-2">42 hrs</div>
          <div className="text-xs text-neutral-400 mt-1 font-mono">
            Across 6 active agents
          </div>
        </div>
      </div>

      {/* AI Growth Memo */}
      <div className="p-6 rounded-2xl bg-[#181818] border border-[#2e2e2e] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F28C45]/20 text-[#F28C45] flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <h3 className="text-sm font-bold text-white">Growth Analyst Weekly Memorandum</h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
            Generated Today
          </span>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          "Your LinkedIn essays with bold contrarian first lines experienced <strong>3.4x higher comment depth</strong> than standard tips. Conversely, Instagram reels showing desk/behind-the-scenes hardware delivered 85% of your direct messaging lead conversions. Recommendation: retain the 2-to-1 ratio of tactical essays on LinkedIn vs personal setup clips on Instagram."
        </p>
      </div>

      {/* Top Posts Breakdown Table */}
      <div className="p-6 rounded-2xl bg-[#181818] border border-[#2e2e2e] space-y-4">
        <h3 className="text-sm font-bold text-white">Top Performing Content Assets</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="text-[10px] uppercase font-bold text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="pb-3">Content Title</th>
                <th className="pb-3">Platform</th>
                <th className="pb-3">Reach</th>
                <th className="pb-3">Engagement</th>
                <th className="pb-3">Inquiries</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              <tr>
                <td className="py-3 font-semibold text-white">Building Micro-SaaS in 2026</td>
                <td className="py-3 text-blue-400">LinkedIn</td>
                <td className="py-3">42,500</td>
                <td className="py-3 text-emerald-400">7.4%</td>
                <td className="py-3 font-bold text-[#F28C45]">6 leads</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Behind The Scenes: Studio 2.0</td>
                <td className="py-3 text-pink-400">Instagram</td>
                <td className="py-3">38,100</td>
                <td className="py-3 text-emerald-400">5.9%</td>
                <td className="py-3 font-bold text-[#F28C45]">4 leads</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">AI Tools That Actually Save 10+ Hours</td>
                <td className="py-3 text-blue-400">LinkedIn</td>
                <td className="py-3">29,400</td>
                <td className="py-3 text-emerald-400">6.1%</td>
                <td className="py-3 font-bold text-[#F28C45]">3 leads</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
