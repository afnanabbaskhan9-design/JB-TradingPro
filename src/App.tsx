import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Terminal from './components/Terminal';
import Portfolio from './components/Portfolio';
import CopyTrading from './components/CopyTrading';
import EconomicCalendar from './components/EconomicCalendar';
import AdminPanel from './components/AdminPanel';
import { 
  Asset, 
  Position, 
  UserAccount, 
  CopyTraderProvider, 
  NewsItem, 
  EconomicCalendarEvent, 
  AlertNotification, 
  TransactionHistory,
  OrderType,
  PositionType
} from './types';
import { 
  Globe2, 
  Coins, 
  Compass, 
  DollarSign, 
  UserPlus, 
  LogIn, 
  ShieldCheck, 
  Activity, 
  ChevronRight,
  Calculator,
  Database,
  ArrowRight,
  Play
} from 'lucide-react';

export default function App() {
  // Global states
  const [user, setUser] = useState<UserAccount | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [providers, setProviders] = useState<CopyTraderProvider[]>([]);
  const [calendar, setCalendar] = useState<EconomicCalendarEvent[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  
  const [activeTab, setActiveTab] = useState<string>('terminal');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Authentication UI state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('Afnan Abbas Khan');
  const [authPhone, setAuthPhone] = useState('+44 7911 123456');
  const [authCountry, setAuthCountry] = useState('United Kingdom');
  const [authPassword, setAuthPassword] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [authErrorMsg, setAuthErrorMsg] = useState('');

  // Admin state replication
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);

  // Periodically fetch state
  useEffect(() => {
    fetchCoreData();
    const interval = setInterval(() => {
      fetchCoreData();
    }, 2000); // 2 seconds high dynamic tick simulator
    return () => clearInterval(interval);
  }, []);

  const fetchCoreData = async () => {
    const safeFetch = async (url: string) => {
      try {
        const response = await fetch(url);
        if (!response.ok) return { success: false };
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        }
        return { success: false };
      } catch (err) {
        return { success: false };
      }
    };

    try {
      // Parallel API dispatch calls
      const [
        assetsRes, 
        positionsRes, 
        transRes, 
        newsRes, 
        providersRes, 
        calRes, 
        alertsRes, 
        userRes,
        adminUsersRes
      ] = await Promise.all([
        safeFetch('/api/market/assets'),
        safeFetch('/api/positions'),
        safeFetch('/api/funding/transactions'),
        safeFetch('/api/news'),
        safeFetch('/api/copy-trading/providers'),
        safeFetch('/api/calendar'),
        safeFetch('/api/alerts'),
        safeFetch('/api/auth/user'),
        safeFetch('/api/admin/users')
      ]);

      if (assetsRes.success) {
        setAssets(assetsRes.assets);
        // Default selected asset representation check
        if (!selectedAsset && assetsRes.assets.length > 0) {
          setSelectedAsset(assetsRes.assets[0]);
        } else if (selectedAsset) {
          // Keep synced selected ticker metric
          const found = assetsRes.assets.find((a: Asset) => a.symbol === selectedAsset.symbol);
          if (found) setSelectedAsset(found);
        }
      }
      
      if (positionsRes.success) setPositions(positionsRes.positions);
      if (transRes.success) setTransactions(transRes.transactions);
      if (newsRes.success) setNews(newsRes.news);
      if (providersRes.success) setProviders(providersRes.providers);
      if (calRes.success) setCalendar(calRes.calendar);
      if (alertsRes.success) setAlerts(alertsRes.alerts);
      
      if (userRes.success && userRes.user) {
        // Only set user if logged in (in mock mode, user is already logged in for initial preview ease!)
        setUser(userRes.user);
      }
      if (adminUsersRes.success) {
        setAllUsers(adminUsersRes.users);
      }
    } catch (e) {
      console.error("Failed to synchronize state intervals", e);
    }
  };

  // Order executors
  const handlePlaceOrder = async (order: {
    symbol: string;
    type: OrderType;
    side: PositionType;
    volume: number;
    price?: number;
    stopLoss?: number;
    takeProfit?: number;
  }) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Execution error');
      }
      await fetchCoreData();
    } catch (err: any) {
      alert(err.message || 'Failed to place order');
    }
  };

  const handleClosePosition = async (id: string, partialVolume?: number) => {
    try {
      const res = await fetch(`/api/positions/${id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partialVolume })
      });
      if (res.ok) {
        await fetchCoreData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditLimits = async (id: string, sl: number | null, tp: number | null) => {
    try {
      const res = await fetch(`/api/positions/${id}/edit-limits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sl, tp })
      });
      if (res.ok) {
        await fetchCoreData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Funding actions
  const handleDeposit = async (amount: number, method: string) => {
    const res = await fetch('/api/funding/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, method })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message);
    }
    await fetchCoreData();
  };

  const handleWithdraw = async (amount: number, method: string) => {
    const res = await fetch('/api/funding/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, method })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message);
    }
    await fetchCoreData();
  };

  // Copy-trading trigger
  const handleToggleCopy = async (id: string) => {
    try {
      await fetch(`/api/copy-trading/toggle/${id}`, { method: 'POST' });
      await fetchCoreData();
    } catch (e) {
      console.error(e);
    }
  };

  // Alerts systems marking read
  const handleMarkAlertsRead = async () => {
    try {
      await fetch('/api/alerts/mark-all-read', { method: 'POST' });
      await fetchCoreData();
    } catch (e) {
      console.error(e);
    }
  };

  // Admin state modification requests
  const handleBanUser = async () => {
    await fetch('/api/admin/users/ban', { method: 'POST' });
    await fetchCoreData();
  };

  const handleVerifyUser = async () => {
    await fetch('/api/admin/users/verify', { method: 'POST' });
    await fetchCoreData();
  };

  const handleApproveTransaction = async (id: string) => {
    await fetch(`/api/admin/transactions/${id}/approve`, { method: 'POST' });
    await fetchCoreData();
  };

  const handleRejectTransaction = async (id: string) => {
    await fetch(`/api/admin/transactions/${id}/reject`, { method: 'POST' });
    await fetchCoreData();
  };

  // Account Type demo/live toggles
  const handleToggleAccountType = async () => {
    await fetch('/api/auth/toggle-account-type', { method: 'POST' });
    await fetchCoreData();
  };

  const handleResetDemo = async () => {
    await fetch('/api/auth/reset-demo-balance', { method: 'POST' });
    await fetchCoreData();
  };

  const handleToggle2FA = async () => {
    await fetch('/api/auth/toggle2fa', { method: 'POST' });
    await fetchCoreData();
  };

  // Auth submission handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSuccessMsg('');
    setAuthErrorMsg('');

    if (authMode === 'LOGIN') {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authEmail, password: authPassword })
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setShowAuthModal(false);
          await fetchCoreData();
        } else {
          setAuthErrorMsg(data.message || 'Details do not align with records');
        }
      } catch (err) {
        setAuthErrorMsg('Failed login sequence.');
      }
    } else if (authMode === 'REGISTER') {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authEmail,
            fullName: authName,
            phone: authPhone,
            country: authCountry,
            password: authPassword
          })
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setShowAuthModal(false);
          await fetchCoreData();
        } else {
          setAuthErrorMsg(data.message || 'Incomplete registration schema');
        }
      } catch (err) {
        setAuthErrorMsg('Failed validation sequence.');
      }
    } else {
      // Mock forgot credentials recover success
      setAuthSuccessMsg('Recovery ticket created! Check your registered inbox lines.');
    }
  };

  const triggerMockLogin = () => {
    // Quick auto mock setup
    setUser({
      email: "afnanabbaskhan9@gmail.com",
      fullName: "Afnan Abbas Khan",
      phone: "+44 7911 123456",
      country: "United Kingdom",
      isDemo: true,
      balance: 2450.00,
      demoBalance: 10000.00,
      equity: 10000.00,
      margin: 0.00,
      freeMargin: 10000.00,
      floatingPl: 0.00,
      is2FAEnabled: false,
      isVerified: true,
      isBanned: false,
      registeredAt: new Date().toISOString()
    });
  };

  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  return (
    <div className="w-full h-screen bg-[#050505] text-[#e5e7eb] font-sans overflow-hidden flex flex-col relative">
      
      {/* Background Mesh Gradients representing premium visual luxury */}
      <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] bg-blue-900/15 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* RENDER LOGIN GAURD: If user not logged in, render Landing workspace */}
      {!user ? (
        <div className="flex-1 flex flex-col overflow-y-auto relative z-10 select-none">
          
          {/* Top Brand bar */}
          <header className="h-16 px-8 flex justify-between items-center border-b border-white/5 bg-black/30 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                JB
              </div>
              <span className="font-bold tracking-tight text-lg text-white font-display">
                JB TRADING<span className="text-blue-500">PRO</span>
              </span>
            </div>

            <div className="flex gap-4 items-center">
              <button 
                id="landing-signin-btn"
                onClick={() => {
                  setAuthMode('LOGIN');
                  setShowAuthModal(true);
                }}
                className="text-xs px-4 py-2 hover:bg-white/5 rounded-full cursor-pointer text-gray-300 font-bold"
              >
                Login
              </button>
              <button 
                id="landing-register-btn"
                onClick={() => {
                  setAuthMode('REGISTER');
                  setShowAuthModal(true);
                }}
                className="text-xs px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-full text-white font-bold cursor-pointer transition-all shadow-lg shadow-blue-500/25"
              >
                Open Demo Account
              </button>
            </div>
          </header>

          {/* Hero Banner Grid layout */}
          <main className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center flex-1">
            <div id="landing-hero-left" className="space-y-6 text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#06b6d4] bg-cyan-600/10 border border-cyan-500/30 rounded-full px-3 py-1">
                Forex · Crypto · Indices · Commodities
              </span>
              <h1 className="text-4xl lg:text-6xl font-bold text-white font-display tracking-tight leading-none">
                Elite Institutional <br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Trading Terminal</span>
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                Gain competitive advantages utilizing real-time financial news sync logs, dynamic SL/TP Protective drags, Copy-trading integrations, and an AI Trading Assistant powered by Gemini.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  id="landing-cta-demo"
                  onClick={triggerMockLogin}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-2 shadow-xl shadow-blue-500/25"
                >
                  Start Demo Terminal <Play className="w-3.5 h-3.5 fill-white text-white" />
                </button>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 select-none">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>No credit card required | $10,000 virtual credit</span>
                </div>
              </div>
            </div>

            {/* Simulated Live pricing widget (Right side of hero) */}
            <div id="landing-ticks-panel" className="bg-gradient-to-tr from-black/40 via-blue-990/5 to-black/20 rounded-2xl border border-white/10 p-6 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-2 right-2 p-1">
                <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
              </div>
              <h3 className="font-bold text-sm text-white mb-2 font-display">Live Market Watch Assets</h3>
              <p className="text-[10px] text-gray-500 mb-4 uppercase">Simulated Live Liquid Broker Feeds</p>

              <div className="space-y-2">
                {assets.slice(0, 5).map((a) => {
                  const isPositive = a.pctChange >= 0;
                  return (
                    <div key={a.symbol} className="flex justify-between items-center p-3 rounded-lg border border-white/5 bg-black/20 hover:border-white/10">
                      <div>
                        <p className="font-bold text-xs text-white">{a.symbol}</p>
                        <p className="text-[9px] text-gray-400 font-mono">{a.name}</p>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <p className="font-bold text-gray-200">${a.lastPrice.toLocaleString()}</p>
                        <span className={`inline-block text-[9px] font-bold ${isPositive ? 'text-green-400':'text-red-400'}`}>
                          {isPositive ? '+':''}{a.pctChange}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>

          {/* Core Features cards */}
          <section id="landing-features" className="max-w-7xl mx-auto px-6 py-10 w-full">
            <h3 className="text-center font-bold text-xs uppercase tracking-widest text-gray-500 mb-8 font-display">Comprehensive Assets Registry</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[
                { title: 'Trade Forex', desc: 'Major & Exotic spreads', badge: '0.1 pips' },
                { title: 'Trade Crypto', desc: 'Secure high deviation coins', badge: '24/7' },
                { title: 'Trade Indices', desc: 'Trade tech contracts', badge: 'US Tech' },
                { title: 'Trade Commodities', desc: 'Spot Gold, Silver, Oil', badge: 'Physical' },
                { title: 'Trade Stocks', desc: 'Global equity leverage', badge: 'CFDs' },
                { title: 'Secured System', desc: 'Decentralized funds checks', badge: 'SSL Protected' }
              ].map((obj, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 text-left flex flex-col justify-between hover:border-white/15 transition-all">
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase">{obj.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">{obj.desc}</p>
                  </div>
                  <span className="text-[9px] text-blue-400 font-mono font-bold uppercase mt-4 block">
                    {obj.badge}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Risk warning and footer declarations */}
          <footer className="mt-auto border-t border-white/5 py-8 text-center text-xs text-gray-500 max-w-7xl mx-auto px-6 select-none leading-relaxed prose-invert text-left space-y-2">
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1 font-display">Risk Warning Declaration</p>
            <p className="text-[11px] text-gray-500 leading-normal">
              CFDs and Forex are leveraged financial contracts of complex structure. Capital risks exist under high deviation indexes. Client leverage sizes are subject to firm margin limits. Past performance logs of signal providers are not reliable guides of direct live trading metrics.
            </p>
            <p className="text-[10px] text-gray-600 pt-4">
              © 2026 JB Trading Pro Terminal. All rights simulated. Developed in compliance with international brokerage guidelines.
            </p>
          </footer>

        </div>
      ) : (
        // RENDER LIVE TRADER TERMINAL ACTIONS
        <div id="logged-in-container" className="flex-1 flex flex-col overflow-hidden relative z-10">
          
          {/* Main Top Header component */}
          <Header
            user={user}
            alerts={alerts}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onToggleAccountType={handleToggleAccountType}
            onResetDemo={handleResetDemo}
            onToggle2FA={handleToggle2FA}
            onLoginClick={() => setShowAuthModal(true)}
            unreadCount={unreadAlertsCount}
            onMarkAlertsRead={handleMarkAlertsRead}
          />

          {/* Content tabs routing logic switcher */}
          <main className="flex-1 flex overflow-hidden">
            {activeTab === 'terminal' && (
              <Terminal
                assets={assets}
                positions={positions}
                user={user}
                selectedAsset={selectedAsset}
                setSelectedAsset={setSelectedAsset}
                onPlaceOrder={handlePlaceOrder}
                onClosePosition={handleClosePosition}
                onEditLimits={handleEditLimits}
              />
            )}

            {activeTab === 'portfolio' && (
              <Portfolio
                user={user}
                transactions={transactions}
                onDeposit={handleDeposit}
                onWithdraw={handleWithdraw}
              />
            )}

            {activeTab === 'copy' && (
              <CopyTrading
                providers={providers}
                onToggleCopy={handleToggleCopy}
              />
            )}

            {activeTab === 'calendar' && (
              <EconomicCalendar
                events={calendar}
                news={news}
                assets={assets}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPanel
                users={allUsers}
                transactions={transactions}
                onBanUser={handleBanUser}
                onVerifyUser={handleVerifyUser}
                onApproveTransaction={handleApproveTransaction}
                onRejectTransaction={handleRejectTransaction}
              />
            )}
          </main>

          {/* Professional Status Bar Footer */}
          <footer className="h-6 border-t border-white/10 bg-black/60 px-5 flex items-center justify-between text-[10px] text-gray-500 relative z-20">
            <div className="flex gap-4">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div> 
                STP Bridge: Connected
              </span>
              <span>GMT Market Time: {new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
              <span className="text-blue-500">Node latency: 12ms</span>
            </div>
            <div className="flex gap-4 font-semibold text-gray-500 font-mono">
              <span>Primary Sector: London / NY overlap</span>
              <span>JB Trading Pro Core Engine v1.4.2</span>
            </div>
          </footer>

        </div>
      )}

      {/* AUTHENTICATION / REGISTRATION POPUP MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#090d16] border border-white/1s rounded-2xl shadow-2xl p-6 relative overflow-hidden text-left">
            
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-xs text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded cursor-pointer font-bold"
            >
              Esc
            </button>

            <div className="mb-6">
              <h3 className="font-bold text-lg text-white font-display">
                {authMode === 'LOGIN' ? 'Access Trading Desk' : authMode === 'REGISTER' ? 'Register Private Account' : 'Recover Access Keys'}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">
                {authMode === 'LOGIN' ? 'Input registered email target credentials' : authMode === 'REGISTER' ? 'Access practice live liquidity setups' : 'We will send a reset token link'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} id="auth-flow-modal" className="space-y-4">
              
              {authMode === 'REGISTER' && (
                <>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Country</label>
                      <input
                        type="text"
                        value={authCountry}
                        onChange={(e) => setAuthCountry(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Phone</label>
                      <input
                        type="text"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Email Destination address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono"
                  required
                />
              </div>

              {authMode !== 'FORGOT' && (
                <div>
                  <label className="text-[9px] uppercase font-bold text-gray-400 block mb-1">Password Credentials</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white"
                    required
                  />
                </div>
              )}

              {authErrorMsg && (
                <p className="text-[10px] text-red-400 font-bold tracking-wide">{authErrorMsg}</p>
              )}
              {authSuccessMsg && (
                <p className="text-[10px] text-green-400 font-bold tracking-wide">{authSuccessMsg}</p>
              )}

              <button
                id="auth-submit-btn"
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer block text-center shadow-lg shadow-blue-500/20"
              >
                {authMode === 'LOGIN' ? 'Establish Session' : authMode === 'REGISTER' ? 'Register Demo Balance' : 'Send Recovery Ticket'}
              </button>
            </form>

            <div className="mt-4 flex justify-between text-[10px] text-gray-500 font-medium">
              {authMode === 'LOGIN' ? (
                <>
                  <span onClick={() => setAuthMode('REGISTER')} className="hover:text-white cursor-pointer select-none">
                    Register Brand Account
                  </span>
                  <span onClick={() => setAuthMode('FORGOT')} className="hover:text-white cursor-pointer select-none">
                    Forgot Key credentials?
                  </span>
                </>
              ) : (
                <span onClick={() => setAuthMode('LOGIN')} className="hover:text-white cursor-pointer select-none mx-auto">
                  Back to Sign In Lines
                </span>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={triggerMockLogin}
                className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-[10px] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Quick-OAuth Connect with Google Account
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
