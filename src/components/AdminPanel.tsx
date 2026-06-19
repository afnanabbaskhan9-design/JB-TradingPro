import React, { useState } from 'react';
import { 
  Sliders, 
  Users, 
  CheckCircle, 
  XOctagon, 
  ShieldAlert, 
  ShieldCheck, 
  DollarSign, 
  RefreshCw, 
  ArrowDownLeft, 
  ArrowUpRight,
  UserCheck,
  UserX,
  AlertTriangle
} from 'lucide-react';
import { UserAccount, TransactionHistory } from '../types';

interface AdminPanelProps {
  users: UserAccount[];
  transactions: TransactionHistory[];
  onBanUser: () => Promise<void>;
  onVerifyUser: () => Promise<void>;
  onApproveTransaction: (id: string) => Promise<void>;
  onRejectTransaction: (id: string) => Promise<void>;
}

export default function AdminPanel({
  users,
  transactions,
  onBanUser,
  onVerifyUser,
  onApproveTransaction,
  onRejectTransaction
}: AdminPanelProps) {
  const [successNotif, setSuccessNotif] = useState('');
  const [activeSegment, setActiveSegment] = useState<'TRANSACTIONS' | 'ACCOUNTS' | 'EXPOSURE'>('TRANSACTIONS');

  const pendingTransactions = transactions.filter((t) => t.status === 'PENDING');
  const pastTransactions = transactions.filter((t) => t.status !== 'PENDING');

  const handleApprove = async (id: string) => {
    try {
      await onApproveTransaction(id);
      setSuccessNotif(`Successfully approved transaction [${id}] and synchronized firm ledger.`);
      setTimeout(() => setSuccessNotif(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await onRejectTransaction(id);
      setSuccessNotif(`Successfully rejected transaction [${id}].`);
      setTimeout(() => setSuccessNotif(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="admin-pane" className="flex-1 p-6 overflow-y-auto bg-[#05070c] space-y-6">
      
      {/* Overview stats bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-red-600/10 text-red-500 hover:bg-red-500/20 px-3 py-1 rounded-full border border-red-500/25 font-bold uppercase tracking-wider">
            Enterprise Admin Access
          </span>
          <h2 className="text-xl font-bold text-white mt-2 font-display">Institution Administration Controller</h2>
          <p className="text-xs text-gray-400">Review pending deposit tickets, manage user bans, and audit firm risk liquidity exposure.</p>
        </div>

        {/* Administration switcher tabs */}
        <div className="flex gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 h-fit text-xs">
          <button
            onClick={() => setActiveSegment('TRANSACTIONS')}
            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
              activeSegment === 'TRANSACTIONS' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Deposits / Withdrawals ({pendingTransactions.length})
          </button>
          <button
            onClick={() => setActiveSegment('ACCOUNTS')}
            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
              activeSegment === 'ACCOUNTS' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Client Accounts Info
          </button>
          <button
            onClick={() => setActiveSegment('EXPOSURE')}
            className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
              activeSegment === 'EXPOSURE' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Exposure Monitoring
          </button>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION TOAST */}
      {successNotif && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl flex items-center gap-3 animate-pulse">
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{successNotif}</span>
        </div>
      )}

      {/* SEGMENT CONTENTS */}
      {activeSegment === 'TRANSACTIONS' && (
        <div className="space-y-6">
          {/* Section: Pending Queue */}
          <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
            <div className="px-5 py-4 border-b border-white/5 bg-black/10 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
                  Verification Queue Map ({pendingTransactions.length} Pending)
                </h3>
                <p className="text-[10px] text-gray-500">Capital movements awaiting direct bank slip confirmations.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#090d16] text-gray-500 text-[10px] font-bold tracking-wider uppercase">
                  <tr>
                    <th className="px-6 py-2.5">ID No</th>
                    <th className="px-4 py-2.5">Account Label</th>
                    <th className="px-4 py-2.5">Method Type</th>
                    <th className="px-4 py-2.5">Sum Amount</th>
                    <th className="px-4 py-2.5">Date Submitted</th>
                    <th className="px-6 py-2.5 text-right">Authorize Panel Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {pendingTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-xs text-gray-500">
                        Pending ledger clears are currently at absolute zero. Good work!
                      </td>
                    </tr>
                  ) : (
                    pendingTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5">
                        <td className="px-6 py-3 font-mono font-bold text-gray-400">{tx.id}</td>
                        <td className="px-4 py-3 text-white font-semibold">{tx.account}</td>
                        <td className="px-4 py-3 text-gray-400">{tx.method}</td>
                        <td className="px-4 py-3 font-mono text-white font-bold">${tx.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(tx.time).toLocaleTimeString()}</td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              id={`approve-btn-${tx.id}`}
                              onClick={() => handleApprove(tx.id)}
                              className="px-2.5 py-1 bg-green-600 hover:bg-green-500 text-white font-bold text-[10px] rounded cursor-pointer"
                            >
                              Approve Ticket
                            </button>
                            <button
                              id={`reject-btn-${tx.id}`}
                              onClick={() => handleReject(tx.id)}
                              className="px-2.5 py-1 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white font-bold text-[10px] rounded cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Historical logs check */}
          <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden opacity-85">
            <div className="px-5 py-3 border-b border-white/5 bg-black/10">
              <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wide">Processed Ledgers History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090d16] text-gray-500 text-[10px] font-bold tracking-wider uppercase">
                  <tr>
                    <th className="px-6 py-2">ID No</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Account</th>
                    <th className="px-4 py-2">Method</th>
                    <th className="px-6 py-2 text-right">Settlement Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px] text-gray-400">
                  {pastTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-2 font-mono">{tx.id}</td>
                      <td className="px-4 py-2 font-mono font-bold text-gray-300">${tx.amount.toLocaleString()}</td>
                      <td className="px-4 py-2">{tx.account}</td>
                      <td className="px-4 py-2 text-gray-500">{tx.method}</td>
                      <td className="px-6 py-2 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                          tx.status === 'APPROVED' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSegment === 'ACCOUNTS' && (
        <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="px-5 py-4 border-b border-white/5 bg-black/10">
            <h3 className="font-bold text-sm text-white font-display">Client Ledger Index</h3>
            <p className="text-[10px] text-gray-500">Edit, approve, or temporarily ban client terminal entries.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#090d16] text-gray-500 text-[10px] font-bold tracking-wider uppercase">
                <tr>
                  <th className="px-6 py-2.5">Trader Name & Country</th>
                  <th className="px-4 py-2.5">Email / Contacts</th>
                  <th className="px-4 py-2.5">Audit Status</th>
                  <th className="px-4 py-2.5">Balance Sum Limit</th>
                  <th className="px-4 py-2.5 text-center">2FA Stat</th>
                  <th className="px-6 py-2.5 text-right">Administrative Action Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px]">
                {users.map((item) => (
                  <tr key={item.email} className="hover:bg-white/5">
                    <td className="px-6 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{item.fullName}</span>
                        <span className="text-[9px] text-gray-500 font-mono">{item.country}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">{item.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        item.isVerified ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {item.isVerified ? 'VERIFIED' : 'PENDING SECURE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-200">
                      Live Balance: <span className="text-emerald-400 font-bold">${item.balance.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                        item.is2FAEnabled ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-500'
                      }`}>
                        {item.is2FAEnabled ? '2FA ON' : 'DISABLED'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          id="btn-admin-toggle-verify"
                          onClick={() => onVerifyUser()}
                          className="px-2.5 py-1 rounded bg-blue-600/15 hover:bg-blue-600 text-blue-400 hover:text-white font-bold text-[10px] border border-blue-500/30 cursor-pointer flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" />
                          Toggle Verified
                        </button>
                        <button
                          id="btn-admin-toggle-ban"
                          onClick={() => onBanUser()}
                          className={`px-2.5 py-1 rounded font-bold text-[10px] cursor-pointer flex items-center gap-1 ${
                            item.isBanned
                              ? 'bg-green-600 text-white'
                              : 'bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/35'
                          }`}
                        >
                          {item.isBanned ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {item.isBanned ? 'Unban Client' : 'Ban Client'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSegment === 'EXPOSURE' && (
        <div className="space-y-6">
          <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/15 text-yellow-400 flex gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold uppercase tracking-wider">Active Portfolio Risk Warning</h4>
              <p className="text-gray-400 leading-relaxed">
                Aggressive open leverage from clients can cause short-term liquidity bottlenecks if volatility triggers major support level breaks. Maintain reserve ratios.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/30 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-4 font-display">Liquidity Exposure ratios</h3>
              <div className="space-y-3 font-mono text-[11px]">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-500">Total Firm reserves:</span>
                  <span className="text-gray-350">$1,540,200.00 USD</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-500">Asset exposure FX:</span>
                  <span className="text-blue-400">EUR/USD BUY (420 Lots)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-gray-500">Decentralized reserves:</span>
                  <span className="text-gray-350">14.82 BTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Broker Bridge ping:</span>
                  <span className="text-green-400">2.4 ms (LMAX Prime)</span>
                </div>
              </div>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-4 font-display">Administrative Checklist</h3>
              <ul className="text-xs space-y-2 text-gray-400">
                <li className="flex items-center gap-2 text-green-400 font-medium">
                  <CheckCircle className="w-4 h-4" /> STP Auto routing setup OK
                </li>
                <li className="flex items-center gap-2 text-green-400 font-medium">
                  <CheckCircle className="w-4 h-4" /> WebSocket price ticks online (under 10ms)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 opacity-50 text-gray-600" /> Pending risk audits checked
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
