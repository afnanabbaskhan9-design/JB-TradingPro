import React, { useState } from 'react';
import { 
  DollarSign, 
  Layers, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Hourglass, 
  XOctagon, 
  Lock
} from 'lucide-react';
import { UserAccount, TransactionHistory } from '../types';

interface PortfolioProps {
  user: UserAccount;
  transactions: TransactionHistory[];
  onDeposit: (amount: number, method: string) => Promise<void>;
  onWithdraw: (amount: number, method: string) => Promise<void>;
}

export default function Portfolio({
  user,
  transactions,
  onDeposit,
  onWithdraw
}: PortfolioProps) {
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('Credit Card (Visa)');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('Crypto Wallet');
  
  // local feedback dialogs
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    const amt = Number(depositAmount);
    if (!amt || amt <= 0) {
      setErrorMsg('Please specify a positive funding allocation');
      return;
    }

    try {
      await onDeposit(amt, depositMethod);
      setSuccessMsg(`Deposit submitted successfully: $${amt.toLocaleString()} has been queued for verification.`);
      setDepositAmount('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Deposit failed');
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      setErrorMsg('Please specify an active amount');
      return;
    }

    const available = user.isDemo ? user.demoBalance : user.balance;
    if (available < amt) {
      setErrorMsg('Insufficient account funds to request allocation');
      return;
    }

    try {
      await onWithdraw(amt, withdrawMethod);
      setSuccessMsg(`Withdrawal requested successfully: $${amt.toLocaleString()} has been sent to review board.`);
      setWithdrawAmount('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Withdrawal failed');
    }
  };

  return (
    <div id="portfolio-pane" className="flex-1 p-6 overflow-y-auto bg-[#05070c] space-y-6">
      
      {/* 1. Header Overview Cards */}
      <div>
        <h2 className="text-xl font-bold text-white mb-1 font-display">Account Portfolio Overview</h2>
        <p className="text-xs text-gray-400">Manage deposits, withdrawal audits, and equity ratios in real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-950/20 to-black/35 p-4 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
          <div className="absolute top-2 right-2 p-1 text-blue-400">
            <DollarSign className="w-5 h-5 opacity-65" />
          </div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
            {user.isDemo ? 'Virtual Practice Balance' : 'Live Liquid Cash'}
          </p>
          <p className="text-2xl font-mono font-bold text-white mt-1.5">
            ${(user.isDemo ? user.demoBalance : user.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-gray-500 mt-2">
            Base currency: <span className="text-blue-400 font-mono">USD</span>
          </p>
        </div>

        {/* Equity Card */}
        <div className="bg-gradient-to-br from-[#090d16] to-black/35 p-4 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
            Total Account Equity (Margin + Free)
          </p>
          <p className="text-2xl font-mono font-bold text-blue-400 mt-1.5">
            ${user.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Direct institutional valuation
          </p>
        </div>

        {/* Margin Used */}
        <div className="bg-gradient-to-br from-[#090d16] to-black/35 p-4 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
            Blocked Margin Locked
          </p>
          <p className="text-2xl font-mono font-bold text-amber-500 mt-1.5">
            ${user.margin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-gray-500 mt-2">
            Effective Account Leverage: <span className="font-bold text-gray-300 font-mono">1:200 FX</span>
          </p>
        </div>

        {/* Free Margin remaining */}
        <div className="bg-gradient-to-br from-[#090d16] to-black/35 p-4 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
            Free Margin Available
          </p>
          <p className="text-2xl font-mono font-bold text-emerald-400 mt-1.5">
            ${user.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-gray-500 mt-2">
            Margin Level: <span className="font-bold text-emerald-400 font-mono">
              {user.margin > 0 ? `${Math.round((user.equity / user.margin) * 100)}%` : '∞ Safe'}
            </span>
          </p>
        </div>
      </div>

      {/* 2. Interactive Fundings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Deposit module */}
        <div className="bg-gradient-to-b from-black/40 to-black/10 rounded-2xl border border-white/10 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-emerald-500/15 rounded-lg text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white font-display">Deposit Trading Capital</h3>
          </div>

          <form onSubmit={handleDepositSubmit} id="deposit-form" className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5">Funding Method</label>
              <select
                value={depositMethod}
                onChange={(e) => setDepositMethod(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="Credit Card (Visa)" className="bg-[#090d16]">Credit Card (Visa/Mastercard)</option>
                <option value="Crypto Wallet (USDT)" className="bg-[#090d16]">Crypto Wallet (USDT-ERC20)</option>
                <option value="Crypto Wallet (BTC)" className="bg-[#090d16]">Crypto Wallet (Bitcoin BTC)</option>
                <option value="Bank Wire Transfer" className="bg-[#090d16]">International Bank Wire Transfer</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5">Deposit Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-gray-500">$</span>
                <input
                  type="number"
                  min="10"
                  max="1000000"
                  placeholder="Minimum value: $10"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full text-xs bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {depositMethod.includes('Crypto') && (
              <div className="p-3 bg-blue-600/5 rounded-lg border border-blue-500/20">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 font-display">Secure Wallet Direct Address</p>
                <code className="text-[10px] font-mono text-gray-300 break-all select-all block bg-black/40 p-1.5 rounded">
                  {depositMethod.includes('BTC') ? '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' : '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'}
                </code>
                <p className="text-[9px] text-gray-500 mt-1.5">
                  Confirm deposit by processing transaction inside your decentralized wallet first. Pending requests are authorized by the administration board.
                </p>
              </div>
            )}

            <button
              id="deposit-submit-btn"
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-colors cursor-pointer shadow-lg shadow-emerald-990/20"
            >
              Request Capital Deposit
            </button>
          </form>
        </div>

        {/* Withdrawal module */}
        <div className="bg-gradient-to-b from-black/40 to-black/10 rounded-2xl border border-white/10 p-5 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-red-500/15 rounded-lg text-red-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white font-display">Capital Withdrawal</h3>
          </div>

          <form onSubmit={handleWithdrawSubmit} id="withdraw-form" className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5">Settlement Method</label>
              <select
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="Bank Transfer" className="bg-[#090d16]">Direct Local Bank Account</option>
                <option value="Crypto Wallet" className="bg-[#090d16]">Crypto Wallet (USDT - TRC20)</option>
                <option value="Credit Card Return" className="bg-[#090d16]">Refund original credit card</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5">Withdraw Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="Enter request amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full text-xs bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2.5 text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/15">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1 font-display">Risk Disclaimer</span>
              <p className="text-[9px] text-gray-400 leading-normal">
                Withdrawals from active margin-backed accounts might cause margin calls if active trade configurations suffer major downturns. Close existing positions to safekeep trades.
              </p>
            </div>

            <button
              id="withdraw-submit-btn"
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-colors cursor-pointer shadow-lg shadow-red-990/20"
            >
              Submit Withdrawal Request
            </button>
          </form>
        </div>

      </div>

      {/* FEEDBACK STATUS DIALOGS */}
      {(successMsg || errorMsg) && (
        <div id="portfolio-dialogs" className="p-4 rounded-xl border flex items-start gap-3 bg-black/40 backdrop-blur-sm shadow-xl transform transition-all duration-300">
          <div className="p-1">
            {successMsg ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <XOctagon className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div className="flex-1 text-xs">
            <h4 className={`font-bold uppercase tracking-wider ${successMsg ? 'text-emerald-400' : 'text-red-400'}`}>
              {successMsg ? 'Transaction Requested' : 'Allocation Rejected'}
            </h4>
            <p className="text-gray-300 mt-1 leading-normal">
              {successMsg || errorMsg}
            </p>
          </div>
        </div>
      )}

      {/* 3. Transaction Histories */}
      <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-black/10">
          <div>
            <h3 className="font-bold text-sm text-white font-display">Transaction Log History</h3>
            <p className="text-[10px] text-gray-500">History of capital movements, deposits, & pending transfers.</p>
          </div>
          <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded text-gray-400">
            {transactions.length} Total Logs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#090d16] text-gray-500 text-[10px] tracking-wide uppercase">
              <tr>
                <th className="px-6 py-2.5">Transaction ID</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Method</th>
                <th className="px-4 py-2.5">Account Target</th>
                <th className="px-4 py-2.5">Submission Date</th>
                <th className="px-6 py-2.5 text-right">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px]">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-gray-500 font-bold">
                    No transactions captured on this ledger yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isDeposit = tx.type === 'DEPOSIT';
                  return (
                    <tr key={tx.id} className="hover:bg-white/5">
                      <td className="px-6 py-2.5 font-mono text-gray-400">{tx.id}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          isDeposit ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {isDeposit ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-white">
                        ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2.5 text-gray-400">{tx.method}</td>
                      <td className="px-4 py-2.5 text-gray-400">{tx.account}</td>
                      <td className="px-4 py-2.5 text-gray-500">
                        {new Date(tx.time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-2.5 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          tx.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {tx.status === 'PENDING' && <Hourglass className="w-2.5 h-2.5 animate-spin" />}
                          {tx.status === 'APPROVED' && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {tx.status === 'REJECTED' && <XOctagon className="w-2.5 h-2.5" />}
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
