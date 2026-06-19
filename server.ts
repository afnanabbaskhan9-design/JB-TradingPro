import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "https://bfnrdazwyfszpmqkwtqd.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "sb_publishable_rjR8H91Ibm8HZwBywSfE-Q_rVDIZ2wm";

const supabase = createClient(supabaseUrl, supabaseKey);

// Ensure the Gemini API key is configured with the standard aistudio-build telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY_FOR_LOCAL_DEV",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const app = express();
const PORT = 3000;

app.use(express.json());

// ==========================================
// STATE SIMULATION (In-Memory database)
// ==========================================

// Core User Account
let mockUser = {
  email: "afnanabbaskhan9@gmail.com",
  fullName: "Afnan Abbas Khan",
  phone: "+44 7911 123456",
  country: "United Kingdom",
  isDemo: true,
  balance: 2450.00, // Live funds simulation
  demoBalance: 10000.00, // Demo virtual funds
  equity: 10000.00,
  margin: 0.00,
  freeMargin: 10000.00,
  floatingPl: 0.00,
  is2FAEnabled: false,
  isVerified: true,
  isBanned: false,
  registeredAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
};

// Open trading positions
let mockPositions: any[] = [
  {
    id: "POS_10482",
    symbol: "BTC/USD",
    type: "BUY",
    entryPrice: 65980.00,
    currentPrice: 66420.00,
    sl: 64500.00,
    tp: 69000.00,
    profit: 220.00,
    volume: 0.5,
    marginUsed: 330.00,
    openTime: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    status: "OPEN"
  },
  {
    id: "POS_10483",
    symbol: "EUR/USD",
    type: "SELL",
    entryPrice: 1.0872,
    currentPrice: 1.0854,
    sl: 1.0920,
    tp: 1.0780,
    profit: 180.00,
    volume: 1.0,
    marginUsed: 540.00,
    openTime: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    status: "OPEN"
  }
];

// Transaction history list
let mockTransactions: any[] = [
  { id: "TX_93021", type: "DEPOSIT", amount: 2000.00, method: "Crypto Wallet (BTC)", status: "APPROVED", time: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), account: "Live Account" },
  { id: "TX_93022", type: "DEPOSIT", amount: 450.00, method: "Credit Card (Visa)", status: "APPROVED", time: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), account: "Live Account" },
  { id: "TX_93023", type: "WITHDRAWAL", amount: 150.00, method: "Bank Transfer", status: "PENDING", time: new Date().toISOString(), account: "Live Account" }
];

// News section feed
let mockNews = [
  { id: "news_1", source: "JB Finance", category: "FOREX", title: "EUR/USD Inches Lower as Fed Retains Hawkish Tone in Latest Minutes", summary: "The Fed's minutes demonstrated a persistent concern over inflation trends, prompting markets to recalibrate short-term interest rate cuts which pressured EUR/USD lower towards the 1.0840 support.", date: "Just now", sentiment: "BEARISH" },
  { id: "news_2", source: "CoinPulse", category: "CRYPTO", title: "Bitcoin Consolidation Pattern Nears Breakout Zone Above $66,000", summary: "Market structure analysis indicates BTC is forming a bullish flag pattern. Breakout confirmations above $67,500 could unlock momentum targets aiming at $71,000 key resistance levels.", date: "15m ago", sentiment: "BULLISH" },
  { id: "news_3", source: "Gold Watch", category: "STOCKS", title: "Standard & Poor's Indices Retreat from Record Highs as Yields Climb", summary: "U.S. 10-year treasury yields climbed back above 4.25%, triggers profit-taking in mega-cap technology shares ahead of next week's crucial CPI reports and economic indices.", date: "45m ago", sentiment: "NEUTRAL" },
  { id: "news_4", source: "JB Commodities", category: "COMMODITIES", title: "Gold Prices Hold Ground as Geopolitical Risk Offsets Rate Headwinds", summary: "Spot Gold prices defended support at $2310/oz despite a solid dollar performance, buoyed by defensive institutional physical gold buying orders across global markets.", date: "1h ago", sentiment: "BULLISH" }
];

// Economic Calendar Event
let mockCalendarEvents = [
  { id: "cal_1", eventName: "Fed Chair Powell Speaks", time: "14:30 UTC", country: "USD", impact: "HIGH", actual: null, forecast: "--", previous: "--" },
  { id: "cal_2", eventName: "Non-Farm Payrolls (NFP)", time: "12:30 UTC", country: "USD", impact: "HIGH", actual: "215K", forecast: "185K", previous: "175K" },
  { id: "cal_3", eventName: "CPI MoM Inflation Report", time: "12:30 UTC", country: "USD", impact: "HIGH", actual: "0.2%", forecast: "0.3%", previous: "0.4%" },
  { id: "cal_4", eventName: "EU Core CPI YoY %", time: "09:00 UTC", country: "EUR", impact: "MEDIUM", actual: "2.4%", forecast: "2.5%", previous: "2.6%" },
  { id: "cal_5", eventName: "UK GDP Quarterly Estimate", time: "07:00 UTC", country: "GBP", impact: "MEDIUM", actual: "0.1%", forecast: "0.2%", previous: "0.0%" }
];

// Copy Trader signals
let mockCopyProviders = [
  { id: "sig_1", name: "Helios Capital", avatar: "H", ranking: 1, roi: 148.2, winRate: 84.5, drawdown: 8.4, monthlyProfit: 4520, followers: 1820, copied: false },
  { id: "sig_2", name: "Vortex Trading", avatar: "V", ranking: 2, roi: 92.4, winRate: 74.8, drawdown: 11.2, monthlyProfit: 2180, followers: 950, copied: false },
  { id: "sig_3", name: "Alpha Scalping", avatar: "A", ranking: 3, roi: 112.5, winRate: 79.1, drawdown: 14.5, monthlyProfit: 3100, followers: 740, copied: false },
  { id: "sig_4", name: "Macro FX fund", avatar: "M", ranking: 4, roi: 64.9, winRate: 88.2, drawdown: 4.1, monthlyProfit: 1450, followers: 1200, copied: false }
];

// Alert stream logs
let mockAlerts: any[] = [
  { id: "alert_1", type: "NEWS_ALERT", message: "NFP data released: 215K (Forecast 185K) - Strong bullish implications for USD", time: new Date(Date.now() - 10 * 60000).toISOString(), read: false }
];

// ==========================================
// SUPABASE REAL-TIME SYNCHRONIZATION HELPERS
// ==========================================
async function syncUserToSupabase(user: typeof mockUser) {
  try {
    const payload = {
      email: user.email,
      full_name: user.fullName,
      phone: user.phone,
      country: user.country,
      is_demo: user.isDemo,
      balance: user.balance,
      demo_balance: user.demoBalance,
      equity: user.equity,
      margin: user.margin,
      free_margin: user.freeMargin,
      floating_pl: user.floatingPl,
      is_2fa_enabled: user.is2FAEnabled,
      is_verified: user.isVerified,
      is_banned: user.isBanned,
      registered_at: user.registeredAt
    };

    const { error } = await supabase
      .from("users")
      .upsert(payload, { onConflict: "email" });

    if (error) {
      const { error: insertError } = await supabase
        .from("users")
        .insert(payload);
      if (insertError) {
        console.warn("Could not sync user to Supabase 'users' table -", insertError.message);
      }
    }
  } catch (err: any) {
    console.warn("Error inside syncUserToSupabase:", err.message);
  }
}

async function syncTransactionToSupabase(tx: any) {
  try {
    const payload = {
      tx_id: tx.id,
      email: mockUser.email,
      type: tx.type,
      amount: tx.amount,
      method: tx.method,
      status: tx.status,
      created_at: tx.time,
      account: tx.account
    };

    const { error } = await supabase
      .from("transactions")
      .upsert(payload, { onConflict: "tx_id" });

    if (error) {
      const { error: insertError } = await supabase
        .from("transactions")
        .insert(payload);
      if (insertError) {
        console.warn("Could not sync tx to Supabase 'transactions' table -", insertError.message);
      }
    }
  } catch (err: any) {
    console.warn("Error inside syncTransactionToSupabase:", err.message);
  }
}

async function initializeSupabaseSync() {
  console.log("Detecting and initializing Supabase data synchronizer...");
  try {
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("*")
      .order("registered_at", { ascending: false });

    if (!usersError && usersData && usersData.length > 0) {
      const foundUser = usersData.find(u => u.email?.toLowerCase() === mockUser.email?.toLowerCase()) || usersData[0];
      mockUser = {
        email: foundUser.email || mockUser.email,
        fullName: foundUser.full_name || mockUser.fullName,
        phone: foundUser.phone || mockUser.phone,
        country: foundUser.country || mockUser.country,
        isDemo: foundUser.is_demo !== undefined ? foundUser.is_demo : mockUser.isDemo,
        balance: foundUser.balance !== undefined ? parseFloat(foundUser.balance) : mockUser.balance,
        demoBalance: foundUser.demo_balance !== undefined ? parseFloat(foundUser.demo_balance) : mockUser.demoBalance,
        equity: foundUser.equity !== undefined ? parseFloat(foundUser.equity) : mockUser.equity,
        margin: foundUser.margin !== undefined ? parseFloat(foundUser.margin) : mockUser.margin,
        freeMargin: foundUser.free_margin !== undefined ? parseFloat(foundUser.free_margin) : mockUser.freeMargin,
        floatingPl: foundUser.floating_pl !== undefined ? parseFloat(foundUser.floating_pl) : mockUser.floatingPl,
        is2FAEnabled: foundUser.is_2fa_enabled !== undefined ? foundUser.is_2fa_enabled : mockUser.is2FAEnabled,
        isVerified: foundUser.is_verified !== undefined ? foundUser.is_verified : mockUser.isVerified,
        isBanned: foundUser.is_banned !== undefined ? foundUser.is_banned : mockUser.isBanned,
        registeredAt: foundUser.registered_at || mockUser.registeredAt
      };
      console.log("Successfully loaded system parameters from Supabase 'users' table:", mockUser.email);
    } else {
      if (!usersError) {
        await syncUserToSupabase(mockUser);
      } else {
        console.log("Note: Supabase 'users' table is not created yet. The app is falling back to safe local memory.");
      }
    }
  } catch (err: any) {
    console.warn("Supabase users sync failed to initiate:", err.message);
  }

  try {
    const { data: txsData, error: txsError } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!txsError && txsData && txsData.length > 0) {
      mockTransactions = txsData.map((d: any) => ({
        id: d.tx_id || d.id,
        type: d.type,
        amount: parseFloat(d.amount),
        method: d.method,
        status: d.status,
        time: d.created_at || d.time,
        account: d.account
      }));
      console.log(`Successfully imported ${mockTransactions.length} transaction entries from Supabase.`);
    } else {
      if (!txsError) {
        for (const tx of mockTransactions) {
          await syncTransactionToSupabase(tx);
        }
      } else {
        console.log("Note: Supabase 'transactions' table is not created yet. The app is falling back to safe local memory.");
      }
    }
  } catch (err: any) {
    console.warn("Supabase transactions sync failed to initiate:", err.message);
  }
}


// Price simulation variables
const contractSizes: Record<string, number> = {
  "EUR/USD": 100000, "GBP/USD": 100000, "USD/JPY": 100000, "AUD/USD": 100000, "USD/CAD": 100000,
  "BTC/USD": 1, "ETH/USD": 10, "SOL/USD": 100, "XRP/USD": 10000,
  "Gold": 100, "Silver": 5000, "Oil": 1000,
  "NASDAQ": 10, "S&P 500": 10, "Dow Jones": 10
};

const basePrices: Record<string, { price: number; spread: number; pipSize: number; category: string; description: string }> = {
  "EUR/USD": { price: 1.0854, spread: 0.00012, pipSize: 5, category: "FOREX", description: "Euro / US Dollar" },
  "GBP/USD": { price: 1.2672, spread: 0.00016, pipSize: 5, category: "FOREX", description: "British Pound / US Dollar" },
  "USD/JPY": { price: 151.42, spread: 0.015, pipSize: 3, category: "FOREX", description: "US Dollar / Japanese Yen" },
  "AUD/USD": { price: 0.6542, spread: 0.00014, pipSize: 5, category: "FOREX", description: "Australian Dollar / US Dollar" },
  "USD/CAD": { price: 1.3524, spread: 0.00015, pipSize: 5, category: "FOREX", description: "US Dollar / Canadian Dollar" },
  "BTC/USD": { price: 66420.00, spread: 15.00, pipSize: 2, category: "CRYPTO", description: "Bitcoin" },
  "ETH/USD": { price: 3450.00, spread: 2.50, pipSize: 2, category: "CRYPTO", description: "Ethereum" },
  "SOL/USD": { price: 172.50, spread: 0.20, pipSize: 3, category: "CRYPTO", description: "Solana" },
  "XRP/USD": { price: 0.5820, spread: 0.0006, pipSize: 4, category: "CRYPTO", description: "Ripple" },
  "Gold": { price: 2324.50, spread: 0.45, pipSize: 2, category: "COMMODITIES", description: "Spot Gold" },
  "Silver": { price: 27.20, spread: 0.025, pipSize: 3, category: "COMMODITIES", description: "Spot Silver" },
  "Oil": { price: 81.30, spread: 0.03, pipSize: 2, category: "COMMODITIES", description: "WTI Crude Oil" },
  "NASDAQ": { price: 18120.00, spread: 2.00, pipSize: 1, category: "INDICES", description: "US Tech 100 Index" },
  "S&P 500": { price: 5180.00, spread: 0.60, pipSize: 1, category: "INDICES", description: "US SPX 500 Index" },
  "Dow Jones": { price: 39150.00, spread: 3.50, pipSize: 0, category: "INDICES", description: "US Wall Street 30 Index" }
};

interface SimulatedAsset {
  symbol: string;
  name: string;
  category: any;
  bid: number;
  ask: number;
  spread: number;
  pctChange: number;
  high: number;
  low: number;
  lastPrice: number;
  pipSize: number;
  volume24h: number;
  candles: any[];
}

let simulatedAssets: Record<string, SimulatedAsset> = {};

// Helper to pre-populate 50 realistic historical candlesticks
function generateHistoricalCandles(baseVal: number, count = 50, pipSize = 4): any[] {
  let candles: any[] = [];
  let currentVal = baseVal * 0.98;
  const now = Math.floor(Date.now() / 1000);
  const candleInterval = 60; // 1 minute candles

  for (let i = 0; i < count; i++) {
    const time = now - (count - i) * candleInterval;
    const volatility = currentVal * 0.0015;
    const change = (Math.random() - 0.48) * volatility;
    const open = parseFloat(currentVal.toFixed(pipSize));
    const close = parseFloat((currentVal + change).toFixed(pipSize));
    const high = parseFloat((Math.max(open, close) + Math.random() * volatility * 0.5).toFixed(pipSize));
    const low = parseFloat((Math.min(open, close) - Math.random() * volatility * 0.5).toFixed(pipSize));
    currentVal = close;

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 500) + 50
    });
  }
  return candles;
}

// Initialize all assets
Object.keys(basePrices).forEach((symbol) => {
  const meta = basePrices[symbol];
  const initialCandles = generateHistoricalCandles(meta.price, 40, meta.pipSize);
  const lastClose = initialCandles[initialCandles.length - 1].close;

  simulatedAssets[symbol] = {
    symbol,
    name: meta.description,
    category: meta.category,
    lastPrice: lastClose,
    bid: parseFloat((lastClose - meta.spread / 2).toFixed(meta.pipSize)),
    ask: parseFloat((lastClose + meta.spread / 2).toFixed(meta.pipSize)),
    spread: meta.spread,
    pctChange: parseFloat(((Math.random() * 3) - 1.2).toFixed(2)),
    high: parseFloat((lastClose * 1.01).toFixed(meta.pipSize)),
    low: parseFloat((lastClose * 0.99).toFixed(meta.pipSize)),
    pipSize: meta.pipSize,
    volume24h: Math.floor(Math.random() * 150000) + 10000,
    candles: initialCandles
  };
});

// Calculate specific position's floating P&L
function calculateProfit(symbol: string, type: "BUY" | "SELL", entryPrice: number, currentPrice: number, volume: number): number {
  const contractSize = contractSizes[symbol] || 100000;
  if (type === "BUY") {
    return parseFloat(((currentPrice - entryPrice) * volume * contractSize).toFixed(2));
  } else {
    return parseFloat(((entryPrice - currentPrice) * volume * contractSize).toFixed(2));
  }
}

// Global pricing walker tick every 1.5 seconds
setInterval(() => {
  let totalFloatingPl = 0.00;
  let totalMarginUsed = 0.00;

  Object.keys(simulatedAssets).forEach((symbol) => {
    const asset = simulatedAssets[symbol];
    const meta = basePrices[symbol];
    const volatility = asset.lastPrice * 0.0006;
    const priceWalk = (Math.random() - 0.5) * volatility;
    
    // Update price
    const oldPrice = asset.lastPrice;
    asset.lastPrice = parseFloat((oldPrice + priceWalk).toFixed(asset.pipSize));
    asset.bid = parseFloat((asset.lastPrice - asset.spread / 2).toFixed(asset.pipSize));
    asset.ask = parseFloat((asset.lastPrice + asset.spread / 2).toFixed(asset.pipSize));

    if (asset.lastPrice > asset.high) asset.high = asset.lastPrice;
    if (asset.lastPrice < asset.low) asset.low = asset.lastPrice;

    // Update current candle
    if (asset.candles && asset.candles.length > 0) {
      let activeCandle = asset.candles[asset.candles.length - 1];
      activeCandle.close = asset.lastPrice;
      if (asset.lastPrice > activeCandle.high) activeCandle.high = asset.lastPrice;
      if (asset.lastPrice < activeCandle.low) activeCandle.low = asset.lastPrice;
      activeCandle.volume += Math.floor(Math.random() * 5);
      
      // Periodically cycle and output a new candlestick (approx 60 ticks)
      if (Math.random() < 0.04) {
        const nextTime = activeCandle.time + 60;
        asset.candles.push({
          time: nextTime,
          open: asset.lastPrice,
          high: asset.lastPrice,
          low: asset.lastPrice,
          close: asset.lastPrice,
          volume: Math.floor(Math.random() * 20) + 1
        });
        if (asset.candles.length > 80) asset.candles.shift();
      }
    }
  });

  // Check and update open positions, stop-losses, and take-profits
  let positionsToRemove: string[] = [];
  mockPositions.forEach((pos) => {
    const asset = simulatedAssets[pos.symbol];
    if (asset) {
      pos.currentPrice = pos.type === "BUY" ? asset.bid : asset.ask;
      pos.profit = calculateProfit(pos.symbol, pos.type, pos.entryPrice, pos.currentPrice, pos.volume);
      totalFloatingPl += pos.profit;
      totalMarginUsed += pos.marginUsed;

      // Check SL / TP conditions
      if (pos.sl !== null) {
        if ((pos.type === "BUY" && pos.currentPrice <= pos.sl) || (pos.type === "SELL" && pos.currentPrice >= pos.sl)) {
          positionsToRemove.push(pos.id);
          registerAlert("SL_HIT", `Stop Loss hit on ${pos.symbol} at ${pos.currentPrice}. Closed with P&L: $${pos.profit}`);
        }
      }
      if (pos.tp !== null) {
        if ((pos.type === "BUY" && pos.currentPrice >= pos.tp) || (pos.type === "SELL" && pos.currentPrice <= pos.tp)) {
          positionsToRemove.push(pos.id);
          registerAlert("TP_HIT", `Take Profit triggered on ${pos.symbol} at ${pos.currentPrice}. Closed with P&L: $${pos.profit}`);
        }
      }
    }
  });

  // Process triggered exits
  positionsToRemove.forEach((id) => {
    const index = mockPositions.findIndex((p) => p.id === id);
    if (index !== -1) {
      const p = mockPositions[index];
      // Realize balance shift
      if (mockUser.isDemo) {
        mockUser.demoBalance = parseFloat((mockUser.demoBalance + p.profit).toFixed(2));
      } else {
        mockUser.balance = parseFloat((mockUser.balance + p.profit).toFixed(2));
      }
      mockPositions.splice(index, 1);
    }
  });

  // Calculate global account equations
  const activeBalance = mockUser.isDemo ? mockUser.demoBalance : mockUser.balance;
  mockUser.floatingPl = parseFloat(totalFloatingPl.toFixed(2));
  mockUser.equity = parseFloat((activeBalance + totalFloatingPl).toFixed(2));
  mockUser.margin = parseFloat(totalMarginUsed.toFixed(2));
  mockUser.freeMargin = parseFloat((mockUser.equity - totalMarginUsed).toFixed(2));

  // Auto margin call warning logic: equity drops below margin
  if (mockUser.margin > 0 && mockUser.equity < mockUser.margin * 0.5) {
    if (!mockAlerts.some((a) => a.type === "MARGIN_CALL" && !a.read)) {
      registerAlert("MARGIN_CALL", "CRITICAL WARNING: Account margin level is below 50%. Top up or close open parameters immediately.");
    }
  }
}, 1500);

function registerAlert(type: string, message: string) {
  mockAlerts.unshift({
    id: `alert_${Date.now()}`,
    type,
    message,
    time: new Date().toISOString(),
    read: false
  });
  if (mockAlerts.length > 30) mockAlerts.pop();
}

// ==========================================
// API REST ENDPOINTS
// ==========================================

// Authenticate / User Details
app.get("/api/auth/user", (req, res) => {
  res.json({ success: true, user: mockUser });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  // Standard demo validation
  if (email) {
    mockUser.email = email;
    mockUser.isBanned = false;
    await syncUserToSupabase(mockUser);
    res.json({ success: true, user: mockUser });
  } else {
    res.status(400).json({ success: false, message: "Invalid submission metadata" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { email, fullName, phone, country } = req.body;
  if (email && fullName) {
    mockUser.email = email;
    mockUser.fullName = fullName;
    mockUser.phone = phone || mockUser.phone;
    mockUser.country = country || mockUser.country;
    mockUser.isDemo = true;
    mockUser.demoBalance = 10000.00;
    mockUser.balance = 2450.00;
    mockUser.isVerified = true;
    await syncUserToSupabase(mockUser);
    res.json({ success: true, user: mockUser });
  } else {
    res.status(400).json({ success: false, message: "Please provide valid fields" });
  }
});

app.post("/api/auth/toggle2fa", async (req, res) => {
  mockUser.is2FAEnabled = !mockUser.is2FAEnabled;
  await syncUserToSupabase(mockUser);
  res.json({ success: true, user: mockUser });
});

app.post("/api/auth/toggle-account-type", async (req, res) => {
  mockUser.isDemo = !mockUser.isDemo;
  await syncUserToSupabase(mockUser);
  res.json({ success: true, user: mockUser });
});

app.post("/api/auth/reset-demo-balance", async (req, res) => {
  mockUser.demoBalance = 10000.00;
  mockPositions = [];
  mockUser.equity = 10000.00;
  mockUser.margin = 0.00;
  mockUser.freeMargin = 10000.00;
  mockUser.floatingPl = 0.00;
  await syncUserToSupabase(mockUser);
  res.json({ success: true, user: mockUser });
});

// Liquidity / Asset Pricing API
app.get("/api/market/assets", (req, res) => {
  res.json({ success: true, assets: Object.values(simulatedAssets) });
});

app.get("/api/market/assets/:symbol/candles", (req, res) => {
  const symbol = decodeURIComponent(req.params.symbol);
  const asset = simulatedAssets[symbol];
  if (asset) {
    res.json({ success: true, symbol, candles: asset.candles });
  } else {
    res.status(404).json({ success: false, message: "Asset signature not found" });
  }
});

// Trading engine terminal requests
app.get("/api/positions", (req, res) => {
  res.json({ success: true, positions: mockPositions });
});

// Submit a new order
app.post("/api/orders", (req, res) => {
  const { symbol, type, side, volume, price, stopLoss, takeProfit } = req.body;
  const asset = simulatedAssets[symbol];
  
  if (!asset) {
    return res.status(404).json({ success: false, message: "Asset not active" });
  }

  const executionPrice = side === "BUY" ? asset.ask : asset.bid;
  const costPrice = price || executionPrice;
  
  // Calculate simulated margin. Forex margin ≈ 0.5% (approx 200:1 leverage)
  const contractSize = contractSizes[symbol] || 100000;
  const isForex = asset.category === "FOREX";
  const leverage = isForex ? 200 : 50; 
  const marginNeeded = parseFloat(((costPrice * volume * contractSize) / leverage).toFixed(2));

  const activeFunds = mockUser.isDemo ? mockUser.demoBalance : mockUser.balance;
  if (activeFunds < marginNeeded) {
    return res.status(400).json({ success: false, message: "Insufficient free margin to establish position" });
  }

  const positionId = `POS_${Math.floor(Math.random() * 900000) + 100000}`;
  const newPosition = {
    id: positionId,
    symbol,
    type: side,
    entryPrice: costPrice,
    currentPrice: executionPrice,
    sl: stopLoss ? parseFloat(stopLoss) : null,
    tp: takeProfit ? parseFloat(takeProfit) : null,
    profit: 0.00,
    volume: parseFloat(volume),
    marginUsed: marginNeeded,
    openTime: new Date().toISOString(),
    status: "OPEN"
  };

  mockPositions.unshift(newPosition);
  registerAlert("PRICE", `Executed: ${side} ${volume} Lots ${symbol} at ${costPrice}`);

  res.json({ success: true, position: newPosition, user: mockUser });
});

// Edit Stop Loss & Take Profit limits for an open trade
app.post("/api/positions/:id/edit-limits", (req, res) => {
  const { id } = req.params;
  const { sl, tp } = req.body;

  const position = mockPositions.find((pos) => pos.id === id);
  if (!position) {
    return res.status(404).json({ success: false, message: "Position not active" });
  }

  position.sl = sl !== undefined ? (sl === null ? null : parseFloat(sl)) : position.sl;
  position.tp = tp !== undefined ? (tp === null ? null : parseFloat(tp)) : position.tp;

  registerAlert("PRICE", `Adjusted SL/TP limits for active order ${position.symbol}`);
  res.json({ success: true, position });
});

// Close a position full or partial
app.post("/api/positions/:id/close", (req, res) => {
  const { id } = req.params;
  const { partialVolume } = req.body;

  const index = mockPositions.findIndex((pos) => pos.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Position not found" });
  }

  const pos = mockPositions[index];
  const closePrice = pos.currentPrice;

  if (partialVolume && parseFloat(partialVolume) < pos.volume) {
    const shrinkVolume = parseFloat(partialVolume);
    const profitShare = parseFloat(((pos.profit * shrinkVolume) / pos.volume).toFixed(2));
    const marginReduction = parseFloat(((pos.marginUsed * shrinkVolume) / pos.volume).toFixed(2));

    // Realize profit
    if (mockUser.isDemo) {
      mockUser.demoBalance = parseFloat((mockUser.demoBalance + profitShare).toFixed(2));
    } else {
      mockUser.balance = parseFloat((mockUser.balance + profitShare).toFixed(2));
    }

    // Shrink position parameters
    pos.volume = parseFloat((pos.volume - shrinkVolume).toFixed(2));
    pos.marginUsed = parseFloat((pos.marginUsed - marginReduction).toFixed(1));
    pos.profit = parseFloat((pos.profit - profitShare).toFixed(2));

    registerAlert("PRICE", `Partially closed ${shrinkVolume} Lots of ${pos.symbol} at ${closePrice}. Realized: $${profitShare}`);
    return res.json({ success: true, position: pos, user: mockUser });
  } else {
    // Full close
    if (mockUser.isDemo) {
      mockUser.demoBalance = parseFloat((mockUser.demoBalance + pos.profit).toFixed(2));
    } else {
      mockUser.balance = parseFloat((mockUser.balance + pos.profit).toFixed(2));
    }

    mockPositions.splice(index, 1);
    registerAlert("PRICE", `Closed Position: ${pos.symbol} (${pos.type}) at ${closePrice}. Realized: $${pos.profit}`);
    return res.json({ success: true, positionClosed: pos, user: mockUser });
  }
});

// Funding Operations (Deposit / Withdrawals)
app.get("/api/funding/transactions", (req, res) => {
  res.json({ success: true, transactions: mockTransactions });
});

app.post("/api/funding/deposit", async (req, res) => {
  const { amount, method } = req.body;
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid deposit allocation" });
  }

  const tx = {
    id: `TX_${Math.floor(Math.random() * 90000) + 10000}`,
    type: "DEPOSIT",
    amount: parseFloat(amount),
    method,
    status: "PENDING", // PENDING to let the user test out administration logs!
    time: new Date().toISOString(),
    account: mockUser.isDemo ? "Demo Account" : "Live Account"
  };

  mockTransactions.unshift(tx);
  registerAlert("NEWS_ALERT", `Deposit pending approval: $${amount} via ${method}`);
  await syncTransactionToSupabase(tx);
  res.json({ success: true, transaction: tx });
});

app.post("/api/funding/withdraw", async (req, res) => {
  const { amount, method } = req.body;
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid Withdrawal parameter" });
  }

  const activeFunds = mockUser.isDemo ? mockUser.demoBalance : mockUser.balance;
  if (activeFunds < parseFloat(amount)) {
    return res.status(400).json({ success: false, message: "Insufficient funds to request withdrawal." });
  }

  const tx = {
    id: `TX_${Math.floor(Math.random() * 90000) + 10000}`,
    type: "WITHDRAWAL",
    amount: parseFloat(amount),
    method,
    status: "PENDING",
    time: new Date().toISOString(),
    account: mockUser.isDemo ? "Demo Account" : "Live Account"
  };

  mockTransactions.unshift(tx);
  registerAlert("NEWS_ALERT", `Withdrawal request submitted: $${amount} via ${method}`);
  await syncTransactionToSupabase(tx);
  res.json({ success: true, transaction: tx });
});

// News and calendar lists
app.get("/api/news", (req, res) => {
  res.json({ success: true, news: mockNews });
});

app.get("/api/calendar", (req, res) => {
  res.json({ success: true, calendar: mockCalendarEvents });
});

// Copy Trading providers & state modifiers
app.get("/api/copy-trading/providers", (req, res) => {
  res.json({ success: true, providers: mockCopyProviders });
});

app.post("/api/copy-trading/toggle/:id", (req, res) => {
  const { id } = req.params;
  const sig = mockCopyProviders.find((s) => s.id === id);
  if (sig) {
    sig.copied = !sig.copied;
    sig.followers += sig.copied ? 1 : -1;
    const action = sig.copied ? "Started copying" : "Stopped copying";
    registerAlert("NEWS_ALERT", `${action} ${sig.name} successful.`);
    res.json({ success: true, provider: sig });
  } else {
    res.status(404).json({ success: false, message: "Provider profile not found" });
  }
});

// Alerts and notifications
app.get("/api/alerts", (req, res) => {
  res.json({ success: true, alerts: mockAlerts });
});

app.post("/api/alerts/mark-all-read", (req, res) => {
  mockAlerts.forEach((a) => a.read = true);
  res.json({ success: true, alerts: mockAlerts });
});

// ==========================================
// ADMIN PANEL ENGINE ROUTES
// ==========================================
app.use("/api/admin", (req, res, next) => {
  if (mockUser.email?.toLowerCase() !== "afnanabbaskhan9@gmail.com") {
    return res.status(403).json({ success: false, message: "Unauthorized admin access: slot restricted to afnanabbaskhan9@gmail.com" });
  }
  next();
});

app.get("/api/admin/users", (req, res) => {
  // Let's bundle our sole active test user in a stateful collection
  res.json({ success: true, users: [mockUser] });
});

app.post("/api/admin/users/ban", async (req, res) => {
  mockUser.isBanned = !mockUser.isBanned;
  await syncUserToSupabase(mockUser);
  res.json({ success: true, user: mockUser });
});

app.post("/api/admin/users/verify", async (req, res) => {
  mockUser.isVerified = !mockUser.isVerified;
  await syncUserToSupabase(mockUser);
  res.json({ success: true, user: mockUser });
});

app.post("/api/admin/transactions/:id/approve", async (req, res) => {
  const { id } = req.params;
  const tx = mockTransactions.find((t) => t.id === id);
  if (tx) {
    if (tx.status === "PENDING") {
      tx.status = "APPROVED";
      // Perform balance shifts
      if (tx.type === "DEPOSIT") {
        if (mockUser.isDemo) {
          mockUser.demoBalance = parseFloat((mockUser.demoBalance + tx.amount).toFixed(2));
        } else {
          mockUser.balance = parseFloat((mockUser.balance + tx.amount).toFixed(2));
        }
      } else if (tx.type === "WITHDRAWAL") {
        if (mockUser.isDemo) {
          mockUser.demoBalance = parseFloat((mockUser.demoBalance - tx.amount).toFixed(2));
        } else {
          mockUser.balance = parseFloat((mockUser.balance - tx.amount).toFixed(2));
        }
      }
      registerAlert("NEWS_ALERT", `Transaction ${tx.id} approved. New funds logged.`);
      await syncTransactionToSupabase(tx);
      await syncUserToSupabase(mockUser);
    }
    res.json({ success: true, transaction: tx, user: mockUser, transactions: mockTransactions });
  } else {
    res.status(404).json({ success: false, message: "Transaction record not found" });
  }
});

app.post("/api/admin/transactions/:id/reject", async (req, res) => {
  const { id } = req.params;
  const tx = mockTransactions.find((t) => t.id === id);
  if (tx) {
    if (tx.status === "PENDING") {
      tx.status = "REJECTED";
      registerAlert("NEWS_ALERT", `Transaction ${tx.id} was rejected during validation.`);
      await syncTransactionToSupabase(tx);
    }
    res.json({ success: true, transaction: tx, transactions: mockTransactions });
  } else {
    res.status(404).json({ success: false, message: "Transaction record not found" });
  }
});

// ==========================================
// AI TRADING ASSISTANT (Powered by Gemini)
// ==========================================
app.post("/api/ai/assistant", async (req, res) => {
  const { symbol, recentActivity } = req.body;
  const asset = simulatedAssets[symbol || "BTC/USD"];
  
  if (!asset) {
    return res.status(404).json({ success: false, message: "Asset query not found" });
  }

  // System instructions for the model
  const systemInstruction = 
    `You are 'JB AI Assistant', an institutional-grade financial markets strategist and elite risk modeler.
Your purpose is to deliver highly structured, objective, and dense statistical evaluations, trade setups, and trend overviews based on asset pricing, candlesticks history, and current positions.
Never provide vague answers like "this is not real financial advice". Speak with confidence, citing entry price parameters and standard resistance levels. Use professional, clean Markdown tables, bullet points, and headings. Keep analyses extremely professional without any conversational filler or self-descriptions.`;

  const userPrompt = 
    `Deliver tactical technical analysis for asset ${asset.symbol} (${asset.name}).
Current Quote: Bid: ${asset.bid}, Ask: ${asset.ask}, Volatility Stdv: High-Density, Pip Count Size: ${asset.pipSize} decimals.
Last 4 Candles Close History: [${asset.candles.slice(-4).map(c => c.close).join(", ")}].
Recent Active Trades for User: ${JSON.stringify(mockPositions.filter(p => p.symbol === symbol))}.
Overall balance: Live Cash: $${mockUser.balance}, Demo Credit: $${mockUser.demoBalance}.

Please provide:
1. "EXECUTIVE STRATEGY CORRECTIVE": Highlight trend direction (UPWARD, DOWNWARD, OR RANGEBOUND consolidation) based on candlestick close series.
2. "MARKET METRICS & RESISTANCE CHANNELS": Define precise support and resistance levels for planning limit orders.
3. "TACTICAL TRADE ENTRY SUGGESTION": Propose a specific entry with suggested entry zone, Stop Loss (SL), Take Profit (TP), and corresponding Risk-Reward Ratio (e.g. 1:2.5).
4. "RISK & PORTFOLIO ALERT": Note if current margin allocations require risk adjustments.`;

  let analysisText = "";
  let systemUsedRealGemini = false;

  const validApiKey = process.env.GEMINI_API_KEY && 
                      process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" && 
                      !process.env.GEMINI_API_KEY.startsWith("MY_") &&
                      process.env.GEMINI_API_KEY.trim() !== "";

  if (validApiKey) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction
        }
      });
      if (response && response.text) {
        analysisText = response.text;
        systemUsedRealGemini = true;
      }
    } catch (error: any) {
      console.warn("AI Assistant prompt failure, falling back to simulated institutional analysis: ", error);
    }
  }

  if (!systemUsedRealGemini) {
    // Return a professional mock analysis as a robust fallback
    analysisText = `### 📈 **JB AI ASSISTANT INSTITUTIONAL ANALYSIS - ${asset.symbol}**
*(Simulated Engine Mode)*

#### **1. EXECUTIVE STRATEGY CORRECTIVE**
- **Trend Classification**: Bullish Consolidation pattern with high density.
- **Velocity Indicators**: Consecutive historical highs in close value intervals [${asset.candles.slice(-4).map(c => c.close).join(", ")}]. Momentum indicators support upward extension bias.

#### **2. MARKET METRICS & RESISTANCE CHANNELS**
- **S1 (Key Support)**: \`${(asset.lastPrice * 0.985).toFixed(asset.pipSize)}\`
- **R1 (Primary Resistance)**: \`${(asset.lastPrice * 1.015).toFixed(asset.pipSize)}\`
- **Volume Profile**: High distribution block on local candles.

#### **3. TACTICAL TRADE ENTRY SUGGESTION**
| Entry Zone | Suggested SL | Suggested TP | Risk-Reward Ratio |
| :--- | :--- | :--- | :--- |
| **Buy Limit** at \`${(asset.lastPrice * 0.995).toFixed(asset.pipSize)}\` | \`${(asset.lastPrice * 0.982).toFixed(asset.pipSize)}\` | \`${(asset.lastPrice * 1.025).toFixed(asset.pipSize)}\` | **1:2.35** |

#### **4. RISK & PORTFOLIO ALERT**
- **Exposure Metric**: Risk-adjusted metric is secure.
- **Advice**: Keep leverage size under 1:100 on indices parameters.`;
  }

  res.json({ success: true, analysis: analysisText });
});

// ==========================================
// VITE DEV / PRODUCTION ENGINE MOUNTING
// ==========================================
async function startServer() {
  // Bootstrap data synchronization with user's Supabase tables
  await initializeSupabaseSync();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[JB Trading Pro] Simulator Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
