/**
 * JB Trading Pro - Global Type Definitions
 */

export interface Candle {
  time: number; // timestamp in seconds/ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type AssetCategory = 'FOREX' | 'CRYPTO' | 'COMMODITIES' | 'INDICES';

export interface Asset {
  symbol: string;
  name: string;
  category: AssetCategory;
  bid: number;
  ask: number;
  spread: number;
  pctChange: number;
  high: number;
  low: number;
  lastPrice: number;
  pipSize: number;
  volume24h: number;
  candles: Candle[];
}

export type OrderType = 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
export type PositionType = 'BUY' | 'SELL';

export interface OrderRequest {
  symbol: string;
  type: OrderType;
  side: PositionType;
  volume: number; // e.g. 0.1 lots, 1 BTC, etc.
  price?: number; // for limit/stop orders
  stopLoss?: number;
  takeProfit?: number;
}

export interface Position {
  id: string;
  symbol: string;
  type: PositionType;
  entryPrice: number;
  currentPrice: number;
  sl: number | null;
  tp: number | null;
  profit: number;
  volume: number;
  marginUsed: number;
  openTime: string;
  status: 'OPEN' | 'CLOSED';
  closePrice?: number;
  closeTime?: string;
  realizedProfit?: number;
}

export interface UserAccount {
  email: string;
  fullName: string;
  phone: string;
  country: string;
  isDemo: boolean;
  balance: number;
  demoBalance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  floatingPl: number;
  is2FAEnabled: boolean;
  isVerified: boolean;
  isBanned: boolean;
  registeredAt: string;
}

export interface CopyTraderProvider {
  id: string;
  name: string;
  avatar: string;
  ranking: number;
  roi: number; // e.g. 124.5
  winRate: number; // e.g. 78.4
  drawdown: number; // e.g. 12.3
  monthlyProfit: number; // e.g. 2480
  followers: number;
  copied: boolean;
}

export interface NewsItem {
  id: string;
  source: string;
  category: 'FOREX' | 'CRYPTO' | 'STOCKS';
  title: string;
  summary: string;
  date: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface EconomicCalendarEvent {
  id: string;
  eventName: string;
  time: string;
  country: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  actual: string | null;
  forecast: string;
  previous: string;
}

export interface OrderHistory {
  id: string;
  symbol: string;
  type: OrderType;
  side: PositionType;
  volume: number;
  price: number;
  time: string;
  status: 'FILLED' | 'CANCELLED';
}

export interface AlertNotification {
  id: string;
  type: 'PRICE' | 'SL_HIT' | 'TP_HIT' | 'MARGIN_CALL' | 'NEWS_ALERT';
  message: string;
  time: string;
  read: boolean;
}

export interface TransactionHistory {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  method: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  time: string;
  account: string;
}
