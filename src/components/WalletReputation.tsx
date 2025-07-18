import React, { useState } from 'react';
import { Wallet, Search, Filter, AlertTriangle, Shield, TrendingDown, TrendingUp, History, Ban, CheckCircle } from 'lucide-react';
import { WalletReputation as WalletReputationType } from '../types/transaction';
import { mockWalletReputations, blockWallet, unblockWallet, isWalletBlocked, getWalletHistory } from '../utils/mockData';
import { WalletHistoryModal } from './WalletHistoryModal';

export function WalletReputation() {
  const [wallets] = useState<WalletReputationType[]>(mockWalletReputations);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'blocked'>('all');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = wallet.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || wallet.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const handleBlockToggle = (address: string) => {
    if (isWalletBlocked(address)) {
      unblockWallet(address);
    } else {
      blockWallet(address);
    }
    // Force re-render by updating the component state
    setSearchTerm(prev => prev);
  };

  const handleViewHistory = (address: string) => {
    setSelectedWallet(address);
    setIsHistoryModalOpen(true);
  };
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return <Shield className="w-4 h-4 text-green-600" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'high': return <TrendingUp className="w-4 h-4 text-orange-600" />;
      case 'blocked': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const riskCounts = {
    low: wallets.filter(w => !isWalletBlocked(w.address) && w.riskLevel === 'low').length,
    medium: wallets.filter(w => !isWalletBlocked(w.address) && w.riskLevel === 'medium').length,
    high: wallets.filter(w => !isWalletBlocked(w.address) && w.riskLevel === 'high').length,
    blocked: wallets.filter(w => isWalletBlocked(w.address)).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
          <Wallet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Wallet Reputation System</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Low Risk</p>
              <p className="text-3xl font-bold text-green-900">{riskCounts.low}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Medium Risk</p>
              <p className="text-3xl font-bold text-yellow-900">{riskCounts.medium}</p>
            </div>
            <div className="p-3 bg-yellow-200 rounded-full">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">High Risk</p>
              <p className="text-3xl font-bold text-orange-900">{riskCounts.high}</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-full">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Blocked</p>
              <p className="text-3xl font-bold text-red-900">{riskCounts.blocked}</p>
            </div>
            <div className="p-3 bg-red-200 rounded-full">
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search wallet address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Wallet List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Wallet Database ({filteredWallets.length} wallets)
          </h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredWallets.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No wallets match the current search and filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredWallets.map((wallet) => (
                <div 
                  key={wallet.address} 
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border-l-4 ${
                    isWalletBlocked(wallet.address) 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {wallet.address.substring(0, 16)}...{wallet.address.substring(wallet.address.length - 8)}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center space-x-1 ${
                          isWalletBlocked(wallet.address) 
                            ? 'bg-red-100 text-red-800 border-red-200' 
                            : getRiskColor(wallet.riskLevel)
                        }`}>
                          {getRiskIcon(wallet.riskLevel)}
                          <span>
                            {isWalletBlocked(wallet.address) ? 'BLOCKED' : wallet.riskLevel.toUpperCase()}
                          </span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <div>
                          <span className="font-medium">Transactions:</span> {wallet.transactionCount.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Avg Risk:</span> {wallet.averageRiskScore.toFixed(1)}%
                        </div>
                        <div>
                          <span className="font-medium">Flagged:</span> {wallet.flaggedTransactions}
                        </div>
                        <div>
                          <span className="font-medium">Last Active:</span> {new Date(wallet.lastActivity).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {wallet.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {wallet.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end space-y-3">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            wallet.averageRiskScore < 30 ? 'bg-green-600' :
                            wallet.averageRiskScore < 70 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${Math.min(wallet.averageRiskScore, 100)}%` }}
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewHistory(wallet.address)}
                          className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all transform hover:scale-105"
                        >
                          <History className="w-3 h-3" />
                          <span>History</span>
                        </button>
                        
                        <button
                          onClick={() => handleBlockToggle(wallet.address)}
                          className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-lg transition-all transform hover:scale-105 ${
                            isWalletBlocked(wallet.address)
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {isWalletBlocked(wallet.address) ? (
                            <><CheckCircle className="w-3 h-3" /><span>Unblock</span></>
                          ) : (
                            <><Ban className="w-3 h-3" /><span>Block</span></>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Wallet History Modal */}
      <WalletHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        walletAddress={selectedWallet || ''}
        transactions={selectedWallet ? getWalletHistory(selectedWallet) : []}
      />
    </div>
  );
}