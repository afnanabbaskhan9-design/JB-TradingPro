import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Bell, 
  User, 
  RefreshCw, 
  Layers, 
  Sparkles,
  ShieldAlert,
  Sliders,
  DollarSign
} from 'lucide-react';
import { UserAccount, AlertNotification } from '../types';

interface HeaderProps {
  user: UserAccount | null;
  alerts: AlertNotification[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleAccountType: () => void;
  onResetDemo: () => void;
  onToggle2FA: () => void;
  onLoginClick: () => void;
  unreadCount: number;
  onMarkAlertsRead: () => void;
}

export default function Header({
  user,
  alerts,
  activeTab,
  setActiveTab,
  onToggleAccountType,
  onResetDemo,
  onToggle2FA,
  onLoginClick,
  unreadCount,
  onMarkAlertsRead
}: HeaderProps) {
  const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = React.useState(false);

  const navItems = [
    { id: 'terminal', name: 'Trading Terminal', icon: Globe },
    { id: 'portfolio', name: 'Portfolio & Funding', icon: Layers },
    { id: 'copy', name: 'Copy Trading', icon: UsersIcon },
    { id: 'calendar', name: 'Calendar & Tools', icon: CalendarIcon },
    { id: 'admin', name: 'Admin Terminal', icon: Sliders, adminOnly: true }
  ];

  function UsersIcon(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    );
  }

  function CalendarIcon(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
    );
  }

  return (
    <nav className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md z-40 relative">
      {/* Brand Logo */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('terminal')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="font-bold text-white text-lg tracking-tight font-display">JB</span>
          </div>
          <span className="font-bold tracking-tight text-lg text-white font-display">
            JB TRADING<span className="text-blue-500">PRO</span>
          </span>
        </div>

        {/* Global tab Switchers */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          {navItems.map((item) => {
            if (item.adminOnly && (!user || user.email?.toLowerCase() !== 'afnanabbaskhan9@gmail.com')) return null; // Only afnanabbaskhan9@gmail.com has admin panel slot access
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer text-xs ${
                  isActive 
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* User details and toggles */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* Live/Demo Swap button */}
            <button 
              id="header-toggle-demo"
              onClick={onToggleAccountType}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                user.isDemo 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/35 hover:bg-amber-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/35 hover:bg-emerald-500/20'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${user.isDemo ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
              {user.isDemo ? 'Demo Mode' : 'Live Mode'}
            </button>

            {/* Balances summary widget */}
            <div className="hidden lg:flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-4 py-1">
              <div className="flex flex-col items-end">
                <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold leading-none">Net Equity</span>
                <span className="text-xs font-mono font-bold text-blue-400 mt-0.5">
                  ${user.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="w-px h-5 bg-white/10"></div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold leading-none">Floating P/L</span>
                <span className={`text-xs font-mono font-bold flex items-center gap-0.5 mt-0.5 ${
                  user.floatingPl >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {user.floatingPl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {user.floatingPl >= 0 ? '+' : ''}${user.floatingPl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Notification alert Bell */}
            <div className="relative">
              <button 
                id="noti-bell-btn"
                onClick={() => {
                  setShowNotificationDropdown(!showNotificationDropdown);
                  setShowProfileDropdown(false);
                  if (!showNotificationDropdown) onMarkAlertsRead();
                }}
                className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white cursor-pointer relative transition-colors"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-bounce"></span>
                )}
              </button>

              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2.5 w-80 glass-panel-heavy rounded-xl p-1 shadow-2xl z-50 border border-white/10 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-white/10 flex justify-between items-center bg-black/30">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Market Alerts</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-red-500/25 text-red-400 px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {alerts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-500">
                      No active alerts logged this session.
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {alerts.map((al) => (
                        <div key={al.id} className={`p-3 text-xs ${al.read ? 'opacity-70' : 'bg-blue-600/5'}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              al.type === 'MARGIN_CALL' ? 'bg-red-500/20 text-red-400' :
                              al.type === 'SL_HIT' || al.type === 'TP_HIT' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {al.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {new Date(al.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-gray-300 leading-normal">{al.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile context settings Menu */}
            <div className="relative">
              <button 
                id="profile-dropdown-btn"
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotificationDropdown(false);
                }}
                className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                <span className="text-xs font-bold text-blue-400 font-display">
                  {user.fullName.split(' ').map(n=>n[0]).join('').toUpperCase()}
                </span>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2.5 w-64 glass-panel-heavy rounded-xl p-1 shadow-2xl z-50 border border-white/10 text-left">
                  <div className="p-4 border-b border-white/10 bg-black/40 rounded-t-xl">
                    <p className="font-bold text-white text-xs">{user.fullName}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{user.email}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{user.phone}</p>
                  </div>
                  
                  <div className="p-1 space-y-1">
                    {user.isDemo && (
                      <button 
                        onClick={() => {
                          onResetDemo();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/10 rounded-lg text-left cursor-pointer font-medium"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reset Demo Balance ($10k)
                      </button>
                    )}

                    <button 
                      onClick={() => {
                        onToggle2FA();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-300 hover:bg-white/5 rounded-lg text-left cursor-pointer font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                        Two-Factor Auth (2FA)
                      </span>
                      <span className={`text-[10px] font-bold uppercase rounded-full px-2 py-0.5 text-right ${
                        user.is2FAEnabled ? 'bg-green-500/25 text-green-400' : 'bg-white/10 text-gray-500'
                      }`}>
                        {user.is2FAEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </button>

                    <div className="p-2 border-t border-white/5 text-[10px] text-gray-500 flex flex-col gap-1">
                      <span className="flex items-center justify-between">
                        <span>Identity verification:</span>
                        <span className="text-green-400 font-bold uppercase">Verified</span>
                      </span>
                      <span className="flex items-center justify-between">
                        <span>Terminal Device:</span>
                        <span className="text-blue-400 font-mono text-[9px]">macOS - Chrome Browser</span>
                      </span>
                    </div>

                    <div className="border-t border-white/10 p-1">
                      <button 
                        onClick={() => {
                          // Clear standard mock login states and restart
                          window.location.reload();
                        }}
                        className="w-full text-center py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <button 
            id="header-sign-in"
            onClick={onLoginClick}
            className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            Sign In / Register
          </button>
        )}
      </div>
    </nav>
  );
}
