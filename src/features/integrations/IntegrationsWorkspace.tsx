import React from 'react';
import { useApp } from '../../context/AppContext';
import { Instagram, Linkedin, ShieldCheck, RefreshCw, Key, Check } from 'lucide-react';

export const IntegrationsWorkspace: React.FC = () => {
  const { socialAccounts, toggleAccountStatus } = useApp();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#262626]">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Social Platform Integrations
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Safe integration gateway. Connect official APIs for Instagram Graph and LinkedIn v2 without storing passwords locally.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {socialAccounts.map(account => {
          const isIg = account.platform === 'instagram';
          const isConnected = account.status === 'connected' || account.status === 'demo_connection';

          return (
            <div
              key={account.id}
              className="p-6 rounded-2xl bg-[#181818] border border-[#2e2e2e] space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isIg ? 'bg-pink-500/10 text-pink-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {isIg ? <Instagram size={24} /> : <Linkedin size={24} />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white capitalize">{account.platform}</h3>
                      <p className="text-xs text-neutral-400">{account.handle}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {isConnected ? 'Demo Authorized' : 'Disconnected'}
                  </span>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-[#121212] border border-[#222222] text-xs text-neutral-300 space-y-1">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-400" /> Granted Scopes:
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {isIg ? 'instagram_basic, instagram_content_publish, comments_manage' : 'r_liteprofile, w_member_social, messaging_intake'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500">Status: Sandbox Safe</span>
                <button
                  type="button"
                  onClick={() => toggleAccountStatus(account.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isConnected ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' : 'bg-[#F28C45] hover:bg-[#e07b34] text-white'
                  }`}
                >
                  {isConnected ? 'Disconnect' : 'Connect Account'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
