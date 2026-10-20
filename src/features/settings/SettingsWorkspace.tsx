import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sliders, Shield, User, Bot, Trash2 } from 'lucide-react';

export const SettingsWorkspace: React.FC = () => {
  const { preferences, setPreferences } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#262626]">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          System & Personal AI Settings
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Adjust creator persona defaults, autonomy levels, and safety thresholds.
        </p>
      </div>

      {/* Autonomy Level */}
      <div className="p-6 rounded-2xl bg-[#181818] border border-[#2e2e2e] space-y-4">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-[#F28C45]" />
          <h3 className="text-sm font-bold text-white">AI Autonomy & Safety Modes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: 'review', title: 'Review Mode', desc: 'Prepares draft captions & replies. Explicit confirmation required for any external action.' },
            { id: 'balanced', title: 'Balanced Mode', desc: 'Performs routine harmless actions. Flags sensitive leads & unusual actions for review.' },
            { id: 'autopilot', title: 'Autopilot Mode', desc: 'Executes pre-authorized recurring workflows with account boundary checks.' },
          ].map(mode => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setPreferences({ ...preferences, autonomyMode: mode.id as any })}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                preferences.autonomyMode === mode.id
                  ? 'bg-[#F28C45]/10 border-[#F28C45] text-white shadow-sm'
                  : 'bg-[#121212] border-[#2e2e2e] text-neutral-400 hover:border-neutral-600'
              }`}
            >
              <div>
                <h4 className="text-xs font-bold text-white">{mode.title}</h4>
                <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">{mode.desc}</p>
              </div>
              <span className={`text-[10px] font-bold mt-3 ${preferences.autonomyMode === mode.id ? 'text-[#F28C45]' : 'text-neutral-500'}`}>
                {preferences.autonomyMode === mode.id ? '● ACTIVE' : 'SELECT'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Personal Style */}
      <div className="p-6 rounded-2xl bg-[#181818] border border-[#2e2e2e] space-y-4">
        <div className="flex items-center gap-2">
          <User size={18} className="text-[#F28C45]" />
          <h3 className="text-sm font-bold text-white">Creator Persona & Tone Profile</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase font-bold text-neutral-400 mb-1">
              Author Display Name
            </label>
            <input
              type="text"
              value={preferences.displayName}
              onChange={e => setPreferences({ ...preferences, displayName: e.target.value })}
              className="w-full bg-[#121212] border border-[#2e2e2e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F28C45]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-neutral-400 mb-1">
              Tone Style
            </label>
            <select
              value={preferences.writingStyle}
              onChange={e => setPreferences({ ...preferences, writingStyle: e.target.value as any })}
              className="w-full bg-[#121212] border border-[#2e2e2e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="storytelling">Storytelling & Founder Journey</option>
              <option value="casual">Casual & Creator</option>
              <option value="professional">Crisp & Professional</option>
              <option value="educational">Step-by-Step Educational</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl bg-[#181818] border border-red-500/20 space-y-3">
        <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
          <Trash2 size={16} /> Data Management
        </h3>
        <p className="text-xs text-neutral-400">
          Reset all stored demo preferences, drafts, and local activity histories.
        </p>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-colors"
        >
          Clear Local Demo Cache
        </button>
      </div>
    </div>
  );
};
