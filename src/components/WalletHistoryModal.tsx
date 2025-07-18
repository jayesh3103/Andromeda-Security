import React from 'react';
import { X, Clock, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction, AIAnalysis } from '../types/transaction';

interface WalletHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  transactions: Array<Transaction & { analysis: AIAnalysis }>;
}

export function WalletHistoryModal({ isOpen, onClose, walletAddress, transactions }: WalletHistoryModalProps) {
  if (!isOpen) return null;

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 30) return 'text-green-600 bg-green-50';
    if (riskScore < 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'suspicious': return 'bg-yellow-100 text-yellow-800';
      case 'malicious': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const avgRiskScore = transactions.length > 0 
    ? transactions.reduce((sum, tx) => sum + tx.analysis.riskScore, 0) / transactions.length 
    : 0;

  const maliciousCount = transactions.filter(tx => tx.analysis.classification === 'malicious').length;
  const suspiciousCount = transactions.filter(tx => tx.analysis.classification === 'suspicious').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Wallet Transaction History</h2>
              <p className="text-indigo-100 font-mono text-sm mt-1">
                {walletAddress.substring(0, 20)}...{walletAddress.substring(walletAddress.length - 10)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Transactions</p>
                  <p className="text-2xl font-bold text-blue-900">{transactions.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Average Risk</p>
                  <p className="text-2xl font-bold text-green-900">{avgRiskScore.toFixed(1)}%</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                  <span className="text-green-700 font-bold text-sm">{avgRiskScore.toFixed(0)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Suspicious</p>
                  <p className="text-2xl font-bold text-yellow-900">{suspiciousCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Malicious</p>
                  <p className="text-2xl font-bold text-red-900">{maliciousCount}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No transaction history available for this wallet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-mono text-gray-600">
                          {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 8)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getClassificationColor(tx.analysis.classification)}`}>
                          {tx.analysis.classification.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getRiskColor(tx.analysis.riskScore)}`}>
                          Risk: {tx.analysis.riskScore}%
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Value:</span> {tx.value.toFixed(4)} ETH
                        </div>
                        <div>
                          <span className="font-medium">Gas:</span> {tx.gasUsed.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">To:</span> {tx.to.substring(0, 8)}...
                        </div>
                      </div>
                      
                      {tx.analysis.detectedPatterns.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {tx.analysis.detectedPatterns.map((pattern, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                                {pattern}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right text-sm text-gray-500">
                      <div>Block #{tx.blockNumber}</div>
                      <div>{new Date(tx.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}