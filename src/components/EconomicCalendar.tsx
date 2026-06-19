import React, { useState } from 'react';
import { 
  CalendarRange, 
  HelpCircle, 
  Search, 
  Info, 
  BookOpen, 
  Calculator, 
  Globe2, 
  ArrowRightLeft, 
  Database,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { EconomicCalendarEvent, NewsItem, Asset } from '../types';

interface EconomicCalendarProps {
  events: EconomicCalendarEvent[];
  news: NewsItem[];
  assets: Asset[];
}

export default function EconomicCalendar({
  events,
  news,
  assets
}: EconomicCalendarProps) {
  // Calculator values state
  const [pipAsset, setPipAsset] = useState('EUR/USD');
  const [pipLots, setPipLots] = useState('1.0');
  const [pipResult, setPipResult] = useState<number | null>(10.00);

  const [marginAsset, setMarginAsset] = useState('BTC/USD');
  const [marginLots, setMarginLots] = useState('0.1');
  const [marginLeverage, setMarginLeverage] = useState('100');
  const [marginResult, setMarginResult] = useState<number | null>(66.42);

  // Search/Filters news
  const [newsCategory, setNewsCategory] = useState<'ALL' | 'FOREX' | 'CRYPTO' | 'STOCKS'>('ALL');

  const calculatePips = (symbol: string, lots: number) => {
    // Standard Forex 1 Lot pip ≈ $10
    const asset = assets.find((a) => a.symbol === symbol);
    if (!asset) return;
    const size = asset.category === 'CRYPTO' ? 1 : 10;
    setPipResult(parseFloat((lots * size).toFixed(2)));
  };

  const calculateMargin = (symbol: string, lots: number, lev: number) => {
    const asset = assets.find((a) => a.symbol === symbol);
    if (!asset) return;
    const price = asset.lastPrice;
    const size = asset.category === 'FOREX' ? 100000 : asset.category === 'CRYPTO' ? 1 : 100;
    setMarginResult(parseFloat(((price * lots * size) / lev).toFixed(2)));
  };

  const filteredNews = news.filter((item) => {
    return newsCategory === 'ALL' || item.category === newsCategory;
  });

  return (
    <div id="calendar-pane" className="flex-1 p-6 overflow-y-auto bg-[#05070c] space-y-8">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-white mb-1 font-display">Macro Indicators & Strategic Tools</h2>
        <p className="text-xs text-gray-400">Evaluate macroeconomic data releases, check core calendars, & pre-calculate risk parameters.</p>
      </div>

      {/* Grid columns: Left is News & Calendar, Right is risk calculators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* News Feed section and Economic schedule (Left 8 columns) */}
        <div className="col-span-1 lg:col-span-8 space-y-8">
          
          {/* Economic Calendar Schedule */}
          <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
            <div className="px-5 py-4 border-b border-white/5 bg-black/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm text-white font-display">Economic Release Schedule</h3>
              </div>
              <span className="text-[10px] bg-blue-500/15 text-blue-400 px-2.5 py-1 rounded font-mono uppercase font-bold">
                Live Data
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#090d16] text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-2.5">Time / GMT</th>
                    <th className="px-4 py-2.5">Asset Region</th>
                    <th className="px-4 py-2.5">Economic Indicator</th>
                    <th className="px-4 py-2.5 text-center">Impact Level</th>
                    <th className="px-4 py-2.5 text-right">Forecast</th>
                    <th className="px-4 py-2.5 text-right">Previous</th>
                    <th className="px-6 py-2.5 text-right text-emerald-400">Actual Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-white/5 transition-all">
                      <td className="px-6 py-2.5 font-mono text-gray-400">{ev.time}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5 font-bold font-mono text-gray-300">
                          <Globe2 className="w-3.5 h-3.5 text-gray-500" />
                          {ev.country}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-white font-bold">{ev.eventName}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          ev.impact === 'HIGH' ? 'bg-red-500/10 text-red-400 border border-red-500/25' :
                          ev.impact === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/25'
                        }`}>
                          {ev.impact}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-gray-400">{ev.forecast}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-gray-500">{ev.previous}</td>
                      <td className="px-6 py-2.5 text-right font-mono font-bold text-emerald-400 bg-emerald-500/5">
                        {ev.actual || '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Institutional news columns */}
          <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
            <div className="px-5 py-4 border-b border-white/5 bg-black/10 flex justify-between items-center flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#06b6d4]" />
                <h3 className="font-bold text-sm text-white font-display">JB Live News Ticker feed</h3>
              </div>

              {/* News switches pills */}
              <div className="flex gap-1">
                {['ALL', 'FOREX', 'CRYPTO', 'STOCKS'].map((cat: any) => (
                  <button
                    key={cat}
                    onClick={() => setNewsCategory(cat)}
                    className={`px-2.5 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-all ${
                      newsCategory === cat
                        ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                        : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 space-y-4 max-h-[380px] overflow-y-auto divide-y divide-white/5">
              {filteredNews.map((n) => {
                const isBullish = n.sentiment === 'BULLISH';
                const isBearish = n.sentiment === 'BEARISH';
                return (
                  <div key={n.id} className="pt-3 first:pt-0 text-left">
                    <div className="flex justify-between items-start flex-wrap gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 font-mono">[{n.source}]</span>
                        <span className="text-[9px] bg-white/5 text-gray-300 font-bold px-1.5 py-0.5 rounded">
                          {n.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-500">{n.date}</span>
                        <span className={`text-[9px] font-bold uppercase rounded px-1.5 py-0.5 flex items-center gap-0.5 ${
                          isBullish ? 'bg-green-500/10 text-green-400' :
                          isBearish ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-gray-400'
                        }`}>
                          {isBullish ? <TrendingUp className="w-3 h-3" /> : isBearish ? <TrendingDown className="w-3 h-3" /> : null}
                          {n.sentiment}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-bold text-white text-xs leading-tight mb-1 hover:text-blue-400 cursor-pointer">{n.title}</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{n.summary}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Dynamic Risk Calculators (Right 4 columns) */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          
          {/* Pip Value Calculator */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-xs text-white font-display uppercase tracking-wider">Pip Value Tool</h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[9px] font-bold uppercase text-gray-500 mb-1 block">Contract Asset</label>
                <select
                  value={pipAsset}
                  onChange={(e) => {
                    setPipAsset(e.target.value);
                    calculatePips(e.target.value, Number(pipLots));
                  }}
                  className="w-full bg-[#05070c] border border-white/10 text-xs rounded p-2 text-white"
                >
                  {assets.map((a) => (
                    <option key={a.symbol} value={a.symbol}>{a.symbol} ({a.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase text-gray-500 mb-1 block">Total Lots Size</label>
                <input
                  type="number"
                  step="0.01"
                  value={pipLots}
                  onChange={(e) => {
                    setPipLots(e.target.value);
                    calculatePips(pipAsset, Number(e.target.value));
                  }}
                  className="w-full bg-[#05070c] border border-white/10 text-xs rounded p-2 text-white font-mono"
                />
              </div>

              {pipResult !== null && (
                <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 text-center font-mono">
                  <span className="text-[9px] text-gray-500 uppercase font-bold block">Unrealized Pip Value</span>
                  <span className="text-xl font-bold text-[#06b6d4] mt-1 block">
                    ${pipResult.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Margin Calculator */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-5 backdrop-blur-md animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-xs text-white font-display uppercase tracking-wider">Required Margin Tool</h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[9px] font-bold uppercase text-gray-500 mb-1 block">Trading Asset</label>
                <select
                  value={marginAsset}
                  onChange={(e) => {
                    setMarginAsset(e.target.value);
                    calculateMargin(e.target.value, Number(marginLots), Number(marginLeverage));
                  }}
                  className="w-full bg-[#05070c] border border-white/10 text-xs rounded p-2 text-white"
                >
                  {assets.map((a) => (
                    <option key={a.symbol} value={a.symbol}>{a.symbol}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase text-gray-500 mb-1 block">Order Multiplier (Lots)</label>
                <input
                  type="number"
                  step="0.01"
                  value={marginLots}
                  onChange={(e) => {
                    setMarginLots(e.target.value);
                    calculateMargin(marginAsset, Number(e.target.value), Number(marginLeverage));
                  }}
                  className="w-full bg-[#05070c] border border-white/10 text-xs rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase text-gray-500 mb-1 block">Leverage Ratio</label>
                <select
                  value={marginLeverage}
                  onChange={(e) => {
                    setMarginLeverage(e.target.value);
                    calculateMargin(marginAsset, Number(marginLots), Number(e.target.value));
                  }}
                  className="w-full bg-[#05070c] border border-white/10 text-xs rounded p-2 text-white font-mono"
                >
                  <option value="400">1:400 Institutional Extreme</option>
                  <option value="200">1:200 Standard Broker</option>
                  <option value="100">1:100 Intermediate Scalping</option>
                  <option value="50">1:50 Recommended Swing</option>
                </select>
              </div>

              {marginResult !== null && (
                <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-center font-mono">
                  <span className="text-[9px] text-gray-500 uppercase font-bold block">Necessary Margin Required</span>
                  <span className="text-xl font-bold text-amber-500 mt-1 block">
                    ${marginResult.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
