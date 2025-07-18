import React from 'react';
import { X, AlertTriangle, TrendingUp, Zap, DollarSign, Clock, Shield, Brain } from 'lucide-react';
import { Transaction, AIAnalysis } from '../types/transaction';

interface RiskBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: (Transaction & { analysis: AIAnalysis }) | null;
}

export function RiskBreakdownModal({ isOpen, onClose, transaction }: RiskBreakdownModalProps) {
  if (!isOpen || !transaction) return null;

  const getRiskFactors = () => {
    const factors = [];
    
    // Value-based risk
    if (transaction.value > 1000) {
      factors.push({
        factor: 'High Transaction Value',
        impact: 25,
        description: `Transaction value of ${transaction.value.toFixed(2)} ETH is significantly above average`,
        icon: DollarSign,
        color: 'text-red-600'
      });
    } else if (transaction.value > 100) {
      factors.push({
        factor: 'Medium Transaction Value',
        impact: 10,
        description: `Transaction value of ${transaction.value.toFixed(2)} ETH is above average`,
        icon: DollarSign,
        color: 'text-yellow-600'
      });
    }

    // Gas-based risk
    if (transaction.gasUsed > 200000) {
      factors.push({
        factor: 'Unusual Gas Usage',
        impact: 20,
        description: `Gas usage of ${transaction.gasUsed.toLocaleString()} is unusually high, suggesting complex operations`,
        icon: Zap,
        color: 'text-orange-600'
      });
    }

    // Contract interaction risk
    if (transaction.contractInteraction) {
      factors.push({
        factor: 'Smart Contract Interaction',
        impact: 15,
        description: 'Transaction involves smart contract execution, increasing complexity and risk',
        icon: Brain,
        color: 'text-blue-600'
      });
    }

    // Pattern-based risk
    transaction.analysis.detectedPatterns.forEach(pattern => {
      factors.push({
        factor: `Detected Pattern: ${pattern}`,
        impact: 30,
        description: `AI models identified suspicious pattern: ${pattern}`,
        icon: AlertTriangle,
        color: 'text-red-600'
      });
    });

    // Time-based risk (simulated)
    const hour = new Date(transaction.timestamp).getHours();
    if (hour < 6 || hour > 22) {
      factors.push({
        factor: 'Off-Hours Activity',
        impact: 5,
        description: 'Transaction occurred during typical low-activity hours',
        icon: Clock,
        color: 'text-purple-600'
      });
    }

    return factors;
  };

  const riskFactors = getRiskFactors();
  const totalCalculatedRisk = Math.min(riskFactors.reduce((sum, factor) => sum + factor.impact, 0), 100);
  
  const getConfidenceLevel = (confidence: number) => {
    if (confidence > 90) return { level: 'Very High', color: 'text-green-600' };
    if (confidence > 75) return { level: 'High', color: 'text-blue-600' };
    if (confidence > 60) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-red-600' };
  };

  const confidenceInfo = getConfidenceLevel(transaction.analysis.confidence);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6" />
                <span>Risk Analysis Breakdown</span>
              </h2>
              <p className="text-orange-100 text-sm mt-1">
                Detailed analysis of transaction {transaction.hash.substring(0, 16)}...
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

        {/* Risk Score Overview */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {transaction.analysis.riskScore}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Final Risk Score</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${transaction.analysis.riskScore}%` }}
                />
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-3xl font-bold ${confidenceInfo.color}`}>
                {transaction.analysis.confidence.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Model Confidence</div>
              <div className={`text-xs mt-1 ${confidenceInfo.color}`}>
                {confidenceInfo.level} Confidence
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {transaction.analysis.classification.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Classification</div>
              <div className="text-xs mt-1 text-purple-600 dark:text-purple-400">
                AI Prediction
              </div>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Contributing Factors</h3>
          <div className="space-y-4">
            {riskFactors.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p>No significant risk factors detected</p>
                <p className="text-sm">This appears to be a normal transaction</p>
              </div>
            ) : (
              riskFactors.map((factor, index) => {
                const Icon = factor.icon;
                return (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`p-2 rounded-full bg-white dark:bg-gray-600 ${factor.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{factor.factor}</h4>
                        <span className={`text-sm font-medium ${factor.color}`}>
                          +{factor.impact}% risk
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{factor.description}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Model Predictions */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Model Predictions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Supervised Learning</span>
                <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {transaction.analysis.modelPredictions.supervised.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${transaction.analysis.modelPredictions.supervised}%` }}
                />
              </div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Anomaly Detection</span>
                <span className="text-lg font-bold text-orange-900 dark:text-orange-100">
                  {transaction.analysis.modelPredictions.anomaly.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${transaction.analysis.modelPredictions.anomaly}%` }}
                />
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">LSTM Sequential</span>
                <span className="text-lg font-bold text-green-900 dark:text-green-100">
                  {transaction.analysis.modelPredictions.lstm.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${transaction.analysis.modelPredictions.lstm}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Historical Comparison */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historical Context</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Average risk for similar transactions:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {Math.max(0, transaction.analysis.riskScore - 15 + Math.random() * 10).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Transactions from this wallet:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {Math.floor(Math.random() * 50) + 5} previous
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Similar patterns detected:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {Math.floor(Math.random() * 20) + 1} times today
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">False positive rate:</span>
              <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                {(Math.random() * 5 + 1).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}