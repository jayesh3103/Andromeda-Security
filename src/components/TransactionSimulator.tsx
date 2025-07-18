import React, { useState } from 'react';
import { Play, AlertTriangle, X, Zap, DollarSign, Clock, Shield, TrendingDown } from 'lucide-react';
import { Transaction, AIAnalysis } from '../types/transaction';

interface SimulationResult {
  scenario: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  consequences: string[];
  prevention: string[];
}

interface TransactionSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: (Transaction & { analysis: AIAnalysis }) | null;
}

export function TransactionSimulator({ isOpen, onClose, transaction }: TransactionSimulatorProps) {
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen || !transaction) return null;

  const runSimulation = () => {
    setIsSimulating(true);
    
    setTimeout(() => {
      const results = generateSimulationResults(transaction);
      setSimulationResults(results);
      setIsSimulating(false);
    }, 2000);
  };

  const generateSimulationResults = (tx: Transaction & { analysis: AIAnalysis }): SimulationResult[] => {
    const results: SimulationResult[] = [];
    
    // Base scenario based on risk score
    if (tx.analysis.riskScore > 80) {
      results.push({
        scenario: "Critical Security Breach",
        impact: 'critical',
        description: "If this transaction had proceeded, it would have triggered a major security incident.",
        consequences: [
          `Potential loss of ${(tx.value * 10).toFixed(2)} ETH from connected wallets`,
          "Smart contract exploitation affecting multiple users",
          "Reputation damage to the protocol",
          "Possible regulatory scrutiny"
        ],
        prevention: [
          "Real-time AI detection blocked the transaction",
          "Wallet automatically flagged and isolated",
          "Alert sent to security team within 50ms",
          "Network-wide broadcast of malicious address"
        ]
      });
    }

    // Pattern-specific scenarios
    tx.analysis.detectedPatterns.forEach(pattern => {
      switch (pattern.toLowerCase()) {
        case 'flash loan attack':
          results.push({
            scenario: "Flash Loan Exploitation",
            impact: 'high',
            description: "Attacker would have manipulated price oracles using borrowed funds.",
            consequences: [
              "Artificial price manipulation of target tokens",
              "Liquidation of legitimate user positions",
              "Protocol insolvency risk",
              `Estimated damage: ${(tx.value * 5).toFixed(2)} ETH`
            ],
            prevention: [
              "Flash loan pattern detected by LSTM model",
              "Transaction blocked before execution",
              "Oracle manipulation prevented",
              "Lending protocol integrity maintained"
            ]
          });
          break;
          
        case 'rug pull detected':
          results.push({
            scenario: "Rug Pull Scam",
            impact: 'critical',
            description: "Token creator would have drained liquidity pool, making tokens worthless.",
            consequences: [
              "Complete loss of investor funds",
              "Token value drops to zero",
              "Liquidity permanently removed",
              "Hundreds of victims affected"
            ],
            prevention: [
              "Suspicious contract patterns identified",
              "Liquidity lock verification failed",
              "Warning issued to potential investors",
              "Transaction blocked automatically"
            ]
          });
          break;
          
        case 'sandwich attack':
          results.push({
            scenario: "MEV Sandwich Attack",
            impact: 'medium',
            description: "User would have suffered significant slippage from front/back-running.",
            consequences: [
              `Additional ${(tx.value * 0.1).toFixed(4)} ETH in slippage costs`,
              "Unfair price execution for victim",
              "MEV bot profit at user expense",
              "Market manipulation"
            ],
            prevention: [
              "MEV pattern recognition activated",
              "Transaction reordering detected",
              "User protected from exploitation",
              "Fair price execution ensured"
            ]
          });
          break;
          
        default:
          results.push({
            scenario: "General Malicious Activity",
            impact: 'medium',
            description: "Suspicious behavior pattern that could lead to various attacks.",
            consequences: [
              "Potential financial losses",
              "Network security compromise",
              "User trust degradation",
              "Protocol vulnerability exposure"
            ],
            prevention: [
              "AI anomaly detection triggered",
              "Behavioral analysis flagged transaction",
              "Proactive security measures activated",
              "Threat neutralized before impact"
            ]
          });
      }
    });

    // If no specific patterns, generate based on risk score
    if (results.length === 0) {
      const impact = tx.analysis.riskScore > 70 ? 'high' : tx.analysis.riskScore > 40 ? 'medium' : 'low';
      results.push({
        scenario: "Suspicious Transaction Pattern",
        impact,
        description: "Transaction exhibited unusual characteristics that could indicate malicious intent.",
        consequences: [
          "Potential unauthorized access attempts",
          "Unusual gas usage patterns",
          "Suspicious timing or frequency",
          "Risk of follow-up attacks"
        ],
        prevention: [
          "Machine learning models detected anomaly",
          "Risk score exceeded safety threshold",
          "Transaction flagged for review",
          "Preventive measures activated"
        ]
      });
    }

    return results;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'low': return <Shield className="w-5 h-5" />;
      case 'medium': return <Clock className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <TrendingDown className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <Play className="w-6 h-6" />
                <span>Transaction Impact Simulation</span>
              </h2>
              <p className="text-red-100 text-sm mt-1">
                Analyzing what would have happened if this transaction proceeded
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

        {/* Transaction Details */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Transaction Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-gray-600 dark:text-gray-400">Value: {transaction.value.toFixed(4)} ETH</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-gray-600 dark:text-gray-400">Gas: {transaction.gasUsed.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-gray-600 dark:text-gray-400">Risk: {transaction.analysis.riskScore}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600 dark:text-gray-400">Status: {transaction.analysis.classification}</span>
            </div>
          </div>
          
          {transaction.analysis.detectedPatterns.length > 0 && (
            <div className="mt-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Detected Patterns:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {transaction.analysis.detectedPatterns.map((pattern, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Simulation Controls */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          {simulationResults.length === 0 ? (
            <div className="text-center">
              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 mx-auto ${
                  isSimulating
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                <Play className={`w-5 h-5 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>{isSimulating ? 'Running Simulation...' : 'Simulate Impact'}</span>
              </button>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Click to see what would have happened if this transaction wasn't blocked
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Simulation Results</h3>
              <button
                onClick={() => setSimulationResults([])}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Run New Simulation
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {simulationResults.length > 0 && (
          <div className="flex-1 overflow-y-auto max-h-96 p-6">
            <div className="space-y-6">
              {simulationResults.map((result, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full border ${getImpactColor(result.impact)}`}>
                        {getImpactIcon(result.impact)}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{result.scenario}</h4>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getImpactColor(result.impact)}`}>
                          {result.impact.toUpperCase()} IMPACT
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{result.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-red-700 dark:text-red-400 mb-2 flex items-center">
                        <TrendingDown className="w-4 h-4 mr-1" />
                        Potential Consequences
                      </h5>
                      <ul className="space-y-1">
                        {result.consequences.map((consequence, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            {consequence}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center">
                        <Shield className="w-4 h-4 mr-1" />
                        How We Prevented It
                      </h5>
                      <ul className="space-y-1">
                        {result.prevention.map((prevention, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {prevention}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close Simulation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}