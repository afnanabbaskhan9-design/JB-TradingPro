import React from 'react';
import { 
  Users, 
  TrendingUp, 
  Percent, 
  Award, 
  CheckCircle2, 
  HelpCircle,
  ShieldCheck,
  Flame,
  ArrowRightLeft
} from 'lucide-react';
import { CopyTraderProvider } from '../types';

interface CopyTradingProps {
  providers: CopyTraderProvider[];
  onToggleCopy: (id: string) => Promise<void>;
}

export default function CopyTrading({
  providers,
  onToggleCopy
}: CopyTradingProps) {
  return (
    <div id="copytrading-pane" className="flex-1 p-6 overflow-y-auto bg-[#05070c] space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1 font-display">Copy Trading Signal Registry</h2>
          <p className="text-xs text-gray-400">Replicate professional high-performance strategies automatically into your active terminal.</p>
        </div>

        <div className="flex gap-4 items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs">
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Currently Mimicking</p>
            <p className="text-sm font-mono font-bold text-[#06b6d4]">
              {providers.filter(p => p.copied).length} Providers
            </p>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold">Copy Trading Leverage</p>
            <p className="text-sm font-bold text-white">Full Risk-Ratio</p>
          </div>
        </div>
      </div>

      {/* Intro info banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-950/15 via-black/20 to-black/40 rounded-xl border border-white/5 flex gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 h-fit mt-0.5">
            <Award className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-white uppercase tracking-wider">Verified Auditing</h4>
            <p className="text-gray-400 leading-normal">
              Every signal provider profile has been verified directly by trading engine tick databases to ensure zero telemetry skew.
            </p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-950/15 via-black/20 to-black/40 rounded-xl border border-white/5 flex gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 h-fit mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-white uppercase tracking-wider">Secured Allocation</h4>
            <p className="text-gray-400 leading-normal">
              Specify custom parameters. If the signal provider exceeds a max drawdown, the position auto-shuts down securely.
            </p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-950/15 via-black/20 to-black/40 rounded-xl border border-white/5 flex gap-3">
          <div className="p-2 bg-[#06b6d4]/10 rounded-lg text-[#06b6d4] h-fit mt-0.5">
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-white uppercase tracking-wider">Immediate Replication</h4>
            <p className="text-gray-400 leading-normal">
              When Providers place limits, orders are mirrored to your terminal index within sub 50 milliseconds via API.
            </p>
          </div>
        </div>
      </div>

      {/* Provider Cards listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((sig) => (
          <div
            key={sig.id}
            id={`copy-provider-${sig.id}`}
            className={`bg-black/30 rounded-2xl border transition-all duration-300 p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between min-h-[220px] ${
              sig.copied 
                ? 'border-blue-500/40 shadow-xl shadow-blue-500/5 bg-gradient-to-b from-blue-950/10 to-black/50' 
                : 'border-white/10 hover:border-white/20 hover:bg-black/40'
            }`}
          >
            {/* Top Row profile badges */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-800 flex items-center justify-center shadow-lg font-bold text-white font-display">
                  {sig.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-display flex items-center gap-1.5">
                    {sig.name}
                    <span className="text-[9px] bg-blue-500/15 text-blue-400 font-mono px-2 py-0.5 rounded">
                      Rank #{sig.ranking}
                    </span>
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono">ID: {sig.id} | System Strategist</p>
                </div>
              </div>

              {/* Status active mimicking */}
              {sig.copied && (
                <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-1.5 rounded-lg font-bold uppercase tracking-wider animate-pulse border border-green-500/25 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Active Mirroring
                </span>
              )}
            </div>

            {/* Middle Stats Grid columns */}
            <div className="grid grid-cols-4 gap-2 mb-5 p-3 rounded-xl bg-black/40 border border-white/5 text-center font-mono">
              <div>
                <p className="text-[9px] text-gray-500 uppercase tracking-tight">Total Return</p>
                <p className="text-xs font-bold text-emerald-400 mt-1">+{sig.roi}%</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase tracking-tight">Win Ratio</p>
                <p className="text-xs font-bold text-blue-400 mt-1">{sig.winRate}%</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase tracking-tight">Max DD</p>
                <p className="text-xs font-bold text-red-400 mt-1">{sig.drawdown}%</p>
              </div>
              <div>
                <p className="text-[9px] text-gray-500 uppercase tracking-tight">Followers</p>
                <p className="text-xs font-bold text-white mt-1">{sig.followers.toLocaleString()}</p>
              </div>
            </div>

            {/* Bottom row mimicking action button and monthly metrics */}
            <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-auto">
              <div>
                <span className="text-[9px] block text-gray-500 font-bold uppercase tracking-wide">Avg Monthly Return</span>
                <span className="text-xs font-bold text-white font-mono">
                  ${sig.monthlyProfit.toLocaleString()} / mo
                </span>
              </div>

              <button
                id={`toggle-copy-${sig.id}`}
                onClick={() => onToggleCopy(sig.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  sig.copied
                    ? 'bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                }`}
              >
                {sig.copied ? 'Stop Mimicking' : 'Copy Strategy'}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
