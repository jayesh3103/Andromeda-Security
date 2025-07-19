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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 sm:p-6 rounded-xl border border-green-200 dark:border-green-700 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">Low Risk</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 dark:text-green-100">{riskCounts.low}</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-200 dark:bg-green-700 rounded-full">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 p-4 sm:p-6 rounded-xl border border-yellow-200 dark:border-yellow-700 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 font-medium">Medium Risk</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-900 dark:text-yellow-100">{riskCounts.medium}</p>
            </div>
            <div className="p-2 sm:p-3 bg-yellow-200 dark:bg-yellow-700 rounded-full">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-4 sm:p-6 rounded-xl border border-orange-200 dark:border-orange-700 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-medium">High Risk</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900 dark:text-orange-100">{riskCounts.high}</p>
            </div>
            <div className="p-2 sm:p-3 bg-orange-200 dark:bg-orange-700 rounded-full">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 p-4 sm:p-6 rounded-xl border border-red-200 dark:border-red-700 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">Blocked</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-900 dark:text-red-100">{riskCounts.blocked}</p>
            </div>
            <div className="p-2 sm:p-3 bg-red-200 dark:bg-red-700 rounded-full">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search wallet address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Wallet Database ({filteredWallets.length} wallets)
          </h3>
        </div>
        <div className="max-h-80 sm:max-h-96 overflow-y-auto">
          {filteredWallets.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-gray-500 dark:text-gray-400">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No wallets match the current search and filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredWallets.map((wallet) => (
                <div 
                  key={wallet.address} 
                  className={`p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border-l-4 ${
                    isWalletBlocked(wallet.address) 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <span className="text-xs sm:text-sm font-mono text-gray-900 dark:text-white">
                          <span className="hidden sm:inline">{wallet.address.substring(0, 16)}...{wallet.address.substring(wallet.address.length - 8)}</span>
                          <span className="sm:hidden">{wallet.address.substring(0, 8)}...{wallet.address.substring(wallet.address.length - 4)}</span>
                        </span>
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-medium rounded-full border flex items-center space-x-1 ${
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
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
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
                            <span key={index} className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 sm:space-y-3">
                      <div className="w-16 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            wallet.averageRiskScore < 30 ? 'bg-green-600' :
                            wallet.averageRiskScore < 70 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${Math.min(wallet.averageRiskScore, 100)}%` }}
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() => handleViewHistory(wallet.address)}
                          className="flex items-center space-x-1 px-2 sm:px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all transform hover:scale-105"
                        >
                          <History className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>History</span>
                        </button>
                        
                        <button
                          onClick={() => handleBlockToggle(wallet.address)}
                          className={`flex items-center space-x-1 px-2 sm:px-3 py-1 text-xs rounded-lg transition-all transform hover:scale-105 ${
                            isWalletBlocked(wallet.address)
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {isWalletBlocked(wallet.address) ? (
                            <><CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /><span>Unblock</span></>
                          ) : (
                            <><Ban className="w-2.5 h-2.5 sm:w-3 sm:h-3" /><span>Block</span></>
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