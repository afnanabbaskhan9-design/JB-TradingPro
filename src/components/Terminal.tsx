import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Sparkles,
  RefreshCw, 
  Settings, 
  HelpCircle,
  Menu,
  ChevronDown,
  Info,
  ShieldCheck,
  Zap,
  Play
} from 'lucide-react';
import { Asset, Position, UserAccount, OrderType, PositionType } from '../types';

interface TerminalProps {
  assets: Asset[];
  positions: Position[];
  user: UserAccount;
  selectedAsset: Asset | null;
  setSelectedAsset: (asset: Asset) => void;
  onPlaceOrder: (order: {
    symbol: string;
    type: OrderType;
    side: PositionType;
    volume: number;
    price?: number;
    stopLoss?: number;
    takeProfit?: number;
  }) => Promise<void>;
  onClosePosition: (id: string, partialVolume?: number) => Promise<void>;
  onEditLimits: (id: string, sl: number | null, tp: number | null) => Promise<void>;
}

export default function Terminal({
  assets,
  positions,
  user,
  selectedAsset,
  setSelectedAsset,
  onPlaceOrder,
  onClosePosition,
  onEditLimits
}: TerminalProps) {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'FOREX' | 'CRYPTO' | 'COMMODITIES' | 'INDICES'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Chart configurations
  const [timeframe, setTimeframe] = useState<string>('1h');
  const [chartType, setChartType] = useState<'CANDLE' | 'HEIKIN_ASHI' | 'LINE' | 'AREA'>('CANDLE');
  
  // Order parameters state
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [orderSide, setOrderSide] = useState<PositionType>('BUY');
  const [volume, setVolume] = useState<number>(0.5);
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [stopLossInput, setStopLossInput] = useState<string>('');
  const [takeProfitInput, setTakeProfitInput] = useState<string>('');
  
  // AI assistant loading states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [showAiModal, setShowAiModal] = useState(false);

  // Edit limit controls modal and tracking
  const [editLimitPos, setEditLimitPos] = useState<Position | null>(null);
  const [editSlText, setEditSlText] = useState('');
  const [editTpText, setEditTpText] = useState('');

  // Settle helper variables
  const currentAsset = selectedAsset || assets[0];

  useEffect(() => {
    if (currentAsset) {
      // Sync up custom suggestion limits automatically based on direction
      const price = currentAsset.lastPrice;
      const pipValue = currentAsset.pipSize === 5 ? 0.0010 : currentAsset.pipSize === 2 ? 5.00 : 10.00;
      setLimitPrice(price.toFixed(currentAsset.pipSize));
      setStopLossInput((price - pipValue).toFixed(currentAsset.pipSize));
      setTakeProfitInput((price + pipValue * 2).toFixed(currentAsset.pipSize));
    }
  }, [currentAsset]);

  // Filter tickers
  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = selectedCategory === 'ALL' || asset.category === selectedCategory;
    const matchesSearch = asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSuggestLimits = () => {
    if (!currentAsset) return;
    const price = currentAsset.lastPrice;
    const isBuy = orderSide === 'BUY';
    const multiplier = isBuy ? 1 : -1;
    const stopOffset = currentAsset.lastPrice * 0.005; // 0.5% stop loss
    const profitOffset = currentAsset.lastPrice * 0.01; // 1% profit target

    setStopLossInput((price - (multiplier * stopOffset)).toFixed(currentAsset.pipSize));
    setTakeProfitInput((price + (multiplier * profitOffset)).toFixed(currentAsset.pipSize));
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAsset) return;

    const data: any = {
      symbol: currentAsset.symbol,
      type: orderType,
      side: orderSide,
      volume: Number(volume),
    };

    if (orderType !== 'MARKET' && limitPrice) {
      data.price = Number(limitPrice);
    }
    if (stopLossInput) {
      data.stopLoss = Number(stopLossInput);
    }
    if (takeProfitInput) {
      data.takeProfit = Number(takeProfitInput);
    }

    try {
      await onPlaceOrder(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAiAnalysis = async () => {
    if (!currentAsset) return;
    setIsAiLoading(true);
    setShowAiModal(true);
    setAiResponse('');

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: currentAsset.symbol })
      });
      
      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.success) {
          setAiResponse(data.analysis);
        } else {
          setAiResponse(data.message || "Institutional engine connection timed out. Please review the environment metadata.");
        }
      } else {
        setAiResponse("Institutional engine returned an invalid response. Please try again or check server logs.");
      }
    } catch (error) {
      setAiResponse("Network error while trying to fetch analyst suggestions from standard endpoint.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const openEditLimitsModal = (pos: Position) => {
    setEditLimitPos(pos);
    setEditSlText(pos.sl ? pos.sl.toString() : '');
    setEditTpText(pos.tp ? pos.tp.toString() : '');
  };

  const saveEditedLimits = async () => {
    if (!editLimitPos) return;
    const slVal = editSlText ? Number(editSlText) : null;
    const tpVal = editTpText ? Number(editTpText) : null;
    await onEditLimits(editLimitPos.id, slVal, tpVal);
    setEditLimitPos(null);
  };

  // SVG dynamic data visualization math
  const getMinMaxCandles = () => {
    if (!currentAsset || !currentAsset.candles || currentAsset.candles.length === 0) return { min: 0, max: 100 };
    const values = currentAsset.candles.flatMap(c => [c.low, c.high]);
    return {
      min: Math.min(...values) * 0.999,
      max: Math.max(...values) * 1.001
    };
  };

  const { min: yMin, max: yMax } = getMinMaxCandles();
  const yRange = yMax - yMin;

  // Leverage equation for margin
  const defaultLeverage = currentAsset?.category === 'FOREX' ? 200 : 50;
  const hypotheticalContractSize = currentAsset?.category === 'FOREX' ? 100000 : currentAsset?.category === 'CRYPTO' ? 1 : 100;
  const assetPriceToUse = currentAsset ? (orderSide === 'BUY' ? currentAsset.ask : currentAsset.bid) : 1.0;
  const estimatedRequiredMargin = parseFloat(((assetPriceToUse * volume * hypotheticalContractSize) / defaultLeverage).toFixed(2));

  return (
    <div id="terminal-pane" className="flex-1 flex overflow-hidden">
      
      {/* 1. Market Watch (Left Sidebar) */}
      <aside className="w-68 border-r border-white/10 flex flex-col bg-black/25 backdrop-blur-md">
        
        {/* Category Pill Switcher */}
        <div className="p-3 border-b border-white/5 bg-black/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 font-display">Watch Filters</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-500">Active</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {['ALL', 'FOREX', 'CRYPTO', 'COMMODITIES', 'INDICES'].map((cat: any) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded-md text-[9px] font-semibold tracking-tight transition-all cursor-pointer ${
                  selectedCategory === cat 
                    ? 'bg-blue-600/30 text-blue-400 border border-blue-500/20' 
                    : 'text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                {cat === 'COMMODITIES' ? 'COMM' : cat}
              </button>
            ))}
          </div>

          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 w-3 h-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[11px] bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-1.5 focus:outline-none focus:border-blue-500/60 placeholder-gray-500 text-gray-300"
            />
          </div>
        </div>

        {/* Ticker Row */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          <div className="grid grid-cols-12 px-3 py-1.5 text-[9px] font-bold text-gray-500 tracking-wider uppercase bg-black/20">
            <span className="col-span-5">Asset</span>
            <span className="col-span-4 text-right">Bid/Price</span>
            <span className="col-span-3 text-right">Change</span>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500">No matching pairs active.</div>
          ) : (
            filteredAssets.map((asset) => {
              const isSelected = currentAsset.symbol === asset.symbol;
              const isPositive = asset.pctChange >= 0;
              return (
                <div
                  key={asset.symbol}
                  id={`asset-row-${asset.symbol.replace('/', '-')}`}
                  onClick={() => setSelectedAsset(asset)}
                  className={`grid grid-cols-12 px-3 py-2 items-center text-xs cursor-pointer transition-all ${
                    isSelected ? 'bg-blue-600/10 border-l-2 border-blue-500' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="col-span-5 flex flex-col">
                    <span className="font-bold text-white text-[11px]">{asset.symbol}</span>
                    <span className="text-[9px] text-gray-500 truncate">{asset.name}</span>
                  </div>
                  <div className="col-span-4 text-right font-mono font-bold text-gray-300">
                    {asset.lastPrice.toLocaleString(undefined, { minimumFractionDigits: asset.pipSize })}
                  </div>
                  <div className="col-span-3 text-right font-mono text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded ${
                      isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {isPositive ? '+' : ''}{asset.pctChange}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* AI Quick Panel Trigger */}
        <div className="p-4 border-t border-white/10 bg-blue-920/15 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-[9px] font-bold text-white font-display">AI</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 font-display">Trading Assistant</span>
          </div>
          <p className="text-[10px] leading-relaxed text-gray-400 mb-3 italic">
            Tap to get specialized institutional trade signals and resistance ranges for <span className="font-bold text-gray-300 font-mono">{currentAsset?.symbol}</span>
          </p>
          <button
            id="ai-assistant-terminal-trigger"
            onClick={handleAiAnalysis}
            className="w-full py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-400 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            Run JB AI Assistant
          </button>
        </div>
      </aside>

      {/* 2. Main Middle Chart & Position workspace */}
      <section className="flex-1 flex flex-col bg-[#05070c]">
        
        {/* Chart Header Bar */}
        <div className="h-10 border-b border-white/10 flex items-center px-4 justify-between bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white font-display">{currentAsset.symbol}</span>
              <span className="text-[10px] text-gray-500 font-mono">({currentAsset.name})</span>
            </div>
            
            <div className="h-4 w-px bg-white/10"></div>
            
            {/* Timeframe switchers */}
            <div className="flex gap-1">
              {['1m', '5m', '15m', '1H', 'Daily', 'Weekly'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`text-[10px] px-2 py-0.5 rounded cursor-pointer font-medium font-mono ${
                    timeframe === tf ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-white/10"></div>

            {/* Chart type select */}
            <div className="flex gap-1">
              {['CANDLE', 'LINE', 'AREA'].map((type: any) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                    chartType === type ? 'bg-white/15 text-blue-400' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="font-bold">Bid:</span>
              <span className="font-mono text-gray-200">{currentAsset.bid.toFixed(currentAsset.pipSize)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="font-bold">Ask:</span>
              <span className="font-mono text-gray-200">{currentAsset.ask.toFixed(currentAsset.pipSize)}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Charting Component Canvas inside relative layout */}
        <div id="interactive-tradingview-chart" className="flex-1 relative bg-black/30 overflow-hidden select-none border-b border-white/15">
          {currentAsset.candles && currentAsset.candles.length > 0 ? (
            <svg className="w-full h-full" viewBox="0 0 800 350" preserveAspectRatio="none">
              {/* Grid Lines */}
              {[40, 100, 160, 220, 280].map((yHeight, idx) => (
                <line key={idx} x1="0" y1={yHeight} x2="800" y2={yHeight} stroke="#111827" strokeWidth="1" strokeDasharray="3" />
              ))}
              
              {/* Draw asset Candle candlesticks or Line or Area */}
              {chartType === 'LINE' || chartType === 'AREA' ? (
                (() => {
                  const points = currentAsset.candles.map((c, i) => {
                    const xCoord = (i / (currentAsset.candles.length - 1)) * 740 + 30;
                    const yCoord = 280 - ((c.close - yMin) / yRange) * 220;
                    return `${xCoord},${yCoord}`;
                  }).join(' ');

                  const fillPoints = `${currentAsset.candles.map((c, i) => {
                    const xCoord = (i / (currentAsset.candles.length - 1)) * 740 + 30;
                    return `${xCoord},${280 - ((c.close - yMin) / yRange) * 220}`;
                  }).join(' ')} 770,280 30,280`;

                  return (
                    <>
                      {chartType === 'AREA' && (
                        <polygon points={fillPoints} fill="url(#chart-area-grad)" opacity="0.15" />
                      )}
                      <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                      
                      <defs>
                        <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    </>
                  );
                })()
              ) : (
                // Candlestick blocks
                currentAsset.candles.map((c, i) => {
                  const xCoord = (i / (currentAsset.candles.length - 1)) * 730 + 30;
                  const candleWidth = 6;
                  
                  // Translate to SVG Y values
                  const openY = 280 - ((c.open - yMin) / yRange) * 220;
                  const closeY = 280 - ((c.close - yMin) / yRange) * 220;
                  const highY = 280 - ((c.high - yMin) / yRange) * 220;
                  const lowY = 280 - ((c.low - yMin) / yRange) * 220;
                  
                  const isGreen = c.close >= c.open;
                  const themeColor = isGreen ? '#10b981' : '#ef4444';

                  return (
                    <g key={i} className="hover:opacity-85">
                      {/* Technical wick */}
                      <line x1={xCoord} y1={highY} x2={xCoord} y2={lowY} stroke={themeColor} strokeWidth="1.2" />
                      {/* Body */}
                      <rect
                        x={xCoord - candleWidth / 2}
                        y={Math.min(openY, closeY)}
                        width={candleWidth}
                        height={Math.max(Math.abs(openY - closeY), 1.5)}
                        fill={themeColor}
                        rx="1"
                      />
                    </g>
                  );
                })
              )}

              {/* Dynamic Stop Loss/Take Profit live chart tags for active selected user trade if applicable */}
              {positions.filter(p => p.symbol === currentAsset.symbol).map((activePos) => {
                const currentY = 280 - ((activePos.entryPrice - yMin) / yRange) * 220;
                return (
                  <g key={activePos.id}>
                    {/* Entry level dot indicator line */}
                    <line x1="0" y1={currentY} x2="800" y2={currentY} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4" />
                    <text x="35" y={currentY - 4} fill="#60a5fa" fontSize="9" fontWeight="bold">
                      ENTRY: {activePos.entryPrice}
                    </text>

                    {/* SL indicator line label */}
                    {activePos.sl && (
                      (() => {
                        const slY = 285 - ((activePos.sl - yMin) / yRange) * 220;
                        if (slY > 0 && slY < 320) {
                          return (
                            <g>
                              <line x1="0" y1={slY} x2="800" y2={slY} stroke="#ef4444" strokeWidth="1" strokeDasharray="3" />
                              <text x="35" y={slY - 4} fill="#f87171" fontSize="9" fontWeight="bold">
                                SL Limit: {activePos.sl}
                              </text>
                            </g>
                          );
                        }
                        return null;
                      })()
                    )}

                    {/* TP indicator line label */}
                    {activePos.tp && (
                      (() => {
                        const tpY = 285 - ((activePos.tp - yMin) / yRange) * 220;
                        if (tpY > 0 && tpY < 320) {
                          return (
                            <g>
                              <line x1="0" y1={tpY} x2="800" y2={tpY} stroke="#10b981" strokeWidth="1" strokeDasharray="3" />
                              <text x="35" y={tpY - 4} fill="#34d399" fontSize="9" fontWeight="bold">
                                TP Target: {activePos.tp}
                              </text>
                            </g>
                          );
                        }
                        return null;
                      })()
                    )}
                  </g>
                );
              })}

              {/* Ticking live horizontal Price Line indicator */}
              {(() => {
                const liveY = 280 - ((currentAsset.lastPrice - yMin) / yRange) * 220;
                return (
                  <g>
                    <line x1="0" y1={liveY} x2="800" y2={liveY} stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="1" />
                    <circle cx="770" cy={liveY} r="3.5" fill="#06b6d4" />
                  </g>
                );
              })()}
            </svg>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-500 text-xs">Awaiting candlestick pricing index...</span>
            </div>
          )}

          {/* Floating Live market pricing tag */}
          <div className="absolute right-3 bottom-14 bg-blue-600/15 backdrop-blur-md border border-blue-500/35 px-2.5 py-1 rounded-lg">
            <span className="text-[10px] text-gray-400 capitalize">Daily Peak Matrix</span>
            <div className="flex gap-3 mt-0.5">
              <span className="text-xs font-mono font-bold text-gray-200">H: {currentAsset.high}</span>
              <span className="text-xs font-mono font-bold text-gray-200">L: {currentAsset.low}</span>
            </div>
          </div>
        </div>

        {/* Position Management table list (Bottom) */}
        <div className="h-52 flex flex-col bg-black/40 backdrop-blur-md">
          {/* Section Headers */}
          <div className="flex justify-between items-center bg-black/20 border-b border-white/5 pr-4">
            <div className="flex">
              <button className="px-4 py-2 text-[11px] font-bold text-blue-400 border-b border-blue-500 bg-white/5 font-display flex items-center gap-1.5 cursor-pointer">
                <Zap className="w-3 h-3 text-blue-400" />
                Active Contracts ({positions.length})
              </button>
            </div>
            
            <span className="text-[10px] text-gray-500">
              Simulated direct server execution | STP Routing
            </span>
          </div>

          {/* Actual Positions Grid list */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-gray-500 font-bold border-b border-white/5 bg-black/10 tracking-wide uppercase">
                <tr>
                  <th className="px-4 py-1.5">Trade ID & Symbol</th>
                  <th className="px-2 py-1.5">Direction</th>
                  <th className="px-2 py-1.5">Volume</th>
                  <th className="px-2 py-1.5">Entry Target</th>
                  <th className="px-2 py-1.5">Current Bid</th>
                  <th className="px-2 py-1.5 text-red-400">Stop Loss (SL)</th>
                  <th className="px-2 py-1.5 text-green-400">Take Profit (TP)</th>
                  <th className="px-2 py-1.5 text-right">Liquid P&L</th>
                  <th className="px-4 py-1.5 text-right text-gray-500">Settlements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {positions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-xs text-gray-500">
                      You do not have any open positions on this account. Complete your entry strategy in the order panel.
                    </td>
                  </tr>
                ) : (
                  positions.map((pos) => {
                    const isBuy = pos.type === 'BUY';
                    const isProfit = pos.profit >= 0;
                    return (
                      <tr key={pos.id} className="hover:bg-white/5 transition-all">
                        <td className="px-4 py-2">
                          <div className="flex flex-col">
                            <span className="font-bold text-white font-mono">{pos.symbol}</span>
                            <span className="text-[9px] text-gray-500 font-mono">{pos.id}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <span className={`text-[10px] font-bold uppercase rounded-md px-1.5 py-0.5 ${
                            isBuy ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {pos.type}
                          </span>
                        </td>
                        <td className="px-2 py-2 font-mono text-gray-300 font-bold">{pos.volume} Lots</td>
                        <td className="px-2 py-2 font-mono text-gray-400">{pos.entryPrice}</td>
                        <td className="px-2 py-2 font-mono text-gray-200">{pos.currentPrice}</td>
                        <td className="px-2 py-2 font-mono text-gray-400">
                          {pos.sl ? (
                            <span className="text-red-400">{pos.sl}</span>
                          ) : (
                            <button 
                              onClick={() => openEditLimitsModal(pos)} 
                              className="text-gray-600 hover:text-white underline cursor-pointer text-[10px]"
                            >
                              Add SL
                            </button>
                          )}
                        </td>
                        <td className="px-2 py-2 font-mono text-gray-400">
                          {pos.tp ? (
                            <span className="text-green-400">{pos.tp}</span>
                          ) : (
                            <button 
                              onClick={() => openEditLimitsModal(pos)} 
                              className="text-gray-600 hover:text-white underline cursor-pointer text-[10px]"
                            >
                              Add TP
                            </button>
                          )}
                        </td>
                        <td className="px-2 py-2 text-right font-mono font-bold">
                          <span className={isProfit ? 'text-green-400 font-bold' : 'text-red-400'}>
                            {isProfit ? '+' : ''}${pos.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => openEditLimitsModal(pos)}
                              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-[10px] border border-white/10 cursor-pointer"
                            >
                              SL/TP
                            </button>
                            <button
                              onClick={() => onClosePosition(pos.id)}
                              className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold text-[10px] transition-colors cursor-pointer"
                            >
                              Close
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. New Order Placement panel (Right Sidebar) */}
      <aside className="w-68 border-l border-white/10 p-4 flex flex-col bg-black/25 backdrop-blur-md z-10 justify-between">
        <form onSubmit={handleOrderSubmit} id="order-placement-side-form" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 font-display">New Order Panel</span>
            <span className="text-[10px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded font-mono uppercase">
              {orderType}
            </span>
          </div>

          {/* Side switches (BUY SELL) */}
          <div className="grid grid-cols-2 gap-2 p-0.5 bg-black/30 rounded-lg border border-white/5">
            <button
              type="button"
              onClick={() => setOrderSide('BUY')}
              className={`py-2 rounded-md font-bold text-center text-xs tracking-wide transition-all cursor-pointer ${
                orderSide === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setOrderSide('SELL')}
              className={`py-2 rounded-md font-bold text-center text-xs tracking-wide transition-all cursor-pointer ${
                orderSide === 'SELL'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/10'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              SELL
            </button>
          </div>

          <div className="space-y-3">
            {/* Order types select block */}
            <div>
              <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1 block">Order Type</label>
              <div className="grid grid-cols-4 gap-1">
                {(['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'] as OrderType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`py-1 text-[8px] font-bold rounded text-center transition-all cursor-pointer ${
                      orderType === type 
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/40' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Target for Limit/Stop Orders */}
            {orderType !== 'MARKET' && (
              <div>
                <label className="text-[9px] uppercase font-bold text-blue-400 tracking-wider mb-1 block">Trigger / Target Price</label>
                <input
                  type="number"
                  step="any"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="w-full text-xs font-mono bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Standard Volume Selection Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Volume (Lots)</label>
                <span className="text-xs font-mono font-bold text-blue-400">{volume} Lots</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="5.0"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[8px] text-gray-500 font-mono mt-0.5">
                <span>0.01 Min</span>
                <span>2.5 Mid</span>
                <span>5.0 Max</span>
              </div>
            </div>

            {/* Stop Loss & Take Profit limits (Styled inside dynamic alert block) */}
            <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#06b6d4] font-display">Risk Control Modules</span>
                <button
                  type="button"
                  onClick={handleSuggestLimits}
                  className="text-[9px] text-blue-400 font-bold hover:underline cursor-pointer"
                >
                  Auto Suggest 50:100
                </button>
              </div>

              <div>
                <div className="flex justify-between text-[9px] font-bold text-red-400 mb-1">
                  <span>Stop Loss (SL Limit / Price)</span>
                </div>
                <input
                  type="number"
                  step="any"
                  placeholder="Not Set (Unprotected)"
                  value={stopLossInput}
                  onChange={(e) => setStopLossInput(e.target.value)}
                  className="w-full text-xs font-mono bg-white/5 border border-white/10 rounded px-2.5 py-1.5 focus:outline-none focus:border-red-500/50 text-red-300 placeholder-gray-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[9px] font-bold text-green-400 mb-1">
                  <span>Take Profit (TP Target / Price)</span>
                </div>
                <input
                  type="number"
                  step="any"
                  placeholder="Not Set (Uncontrolled)"
                  value={takeProfitInput}
                  onChange={(e) => setTakeProfitInput(e.target.value)}
                  className="w-full text-xs font-mono bg-white/5 border border-white/10 rounded px-2.5 py-1.5 focus:outline-none focus:border-green-500/50 text-green-300 placeholder-gray-600"
                />
              </div>
            </div>

            {/* Margin estimations info logs */}
            <div className="pt-2 space-y-1.5 border-t border-white/5 text-[10px]">
              <div className="flex justify-between text-gray-500">
                <span>Calculated Pip value:</span>
                <span className="font-mono text-gray-300">
                  ${(volume * 10).toLocaleString()} / Pip
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Estimated Margin:</span>
                <span className="font-mono text-amber-400">${estimatedRequiredMargin.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Available Margin:</span>
                <span className="font-mono text-blue-400">
                  ${user.freeMargin.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <button
            id={`place-${orderSide.toLowerCase()}-order-btn`}
            type="submit"
            className={`w-full py-3.5 mt-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg text-white hover:brightness-110 cursor-pointer ${
              orderSide === 'BUY'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 shadow-emerald-500/10'
                : 'bg-gradient-to-r from-red-600 to-rose-500 shadow-red-500/10'
            }`}
          >
            EXECUTE {orderSide} CONTRACT
          </button>
        </form>

        <div className="text-[10px] text-gray-500 text-center flex items-center justify-center gap-1.5 pt-4 border-t border-white/5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Real-time Risk management online</span>
        </div>
      </aside>

      {/* AI SUGGESTIONS INTERACTIVE MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#090d16] border border-blue-500/20 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-blue-950/20 border-b border-blue-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400 animate-spin" />
                <div>
                  <h3 className="font-bold text-sm text-white font-display">JB AI Assistant</h3>
                  <p className="text-[10px] text-gray-400">Artificial Intelligence Quantitative Market Evaluation Strategy</p>
                </div>
              </div>
              <button
                id="close-ai-modal"
                onClick={() => setShowAiModal(false)}
                className="p-1 px-3 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 font-bold hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs leading-relaxed text-gray-300 custom-scrollbar">
              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-400 rounded-full animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto w-4 h-4 text-blue-400 animate-pulse" />
                  </div>
                  <p className="font-mono text-gray-400 text-xs">Requesting neural predictive mapping from JB AI Assistant...</p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none text-left">
                  {/* Clean custom rendering */}
                  <div className="whitespace-pre-line text-gray-300 font-sans tracking-wide">
                    {aiResponse}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-black/40 border-t border-white/5 text-[10px] text-gray-500 text-center">
              Evaluation is generated automatically based on historical candlesticks series & current standard deviations index.
            </div>
          </div>
        </div>
      )}

      {/* EDIT SL/TP LIMITS MODAL */}
      {editLimitPos && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#090d16] border border-white/10 rounded-xl shadow-2xl p-5">
            <h3 className="font-bold text-sm text-white mb-1 font-display">Modify SL/TP Limits</h3>
            <p className="text-[10px] text-gray-400 mb-4 font-mono">Position ID: {editLimitPos.id} | {editLimitPos.symbol}</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] text-red-400 uppercase font-bold tracking-wider block mb-1">
                  Stop Loss (SL) Price
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="No Stop Loss Set"
                  value={editSlText}
                  onChange={(e) => setEditSlText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs font-mono text-red-300 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-green-400 uppercase font-bold tracking-wider block mb-1">
                  Take Profit (TP) Price
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="No Take Profit Set"
                  value={editTpText}
                  onChange={(e) => setEditTpText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs font-mono text-green-300 focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setEditLimitPos(null)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="save-limits-btn"
                onClick={saveEditedLimits}
                className="px-4 py-1.5 text-xs text-white rounded bg-blue-600 hover:bg-blue-500 font-bold cursor-pointer"
              >
                Save Limits
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
