import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, Shield, TrendingUp, Clock, Zap, Download, Play, Pause, Eye, Search, Filter, Settings, BarChart3, Brain, Lightbulb, Grid, List, Maximize2, Minimize2 } from 'lucide-react';
import { LoadingSkeleton, TransactionSkeleton, StatCardSkeleton } from './LoadingSkeleton';
import { TransactionSimulator } from './TransactionSimulator';
import { RiskBreakdownModal } from './RiskBreakdownModal';
import { Transaction, AIAnalysis, SecurityAlert } from '../types/transaction';
import { 
  generateMockTransaction, 
  generateAIAnalysis, 
  generateSecurityAlert, 
  addToWalletHistory,
  isWalletBlocked,
  exportTransactionsCSV
} from '../utils/mockData';

interface TransactionMonitorProps {
  onNewAlert: (alert: SecurityAlert) => void;
  onStatsUpdate: (stats: { totalTransactions: number; maliciousBlocked: number; averageRiskScore: number }) => void;
  onChatbotSuggestion: (message: string) => void;
}

type ViewMode = 'compact' | 'expanded';
type ThemeStyle = 'default' | 'cyberpunk' | 'minimalist' | 'terminal';

export function TransactionMonitor({ onNewAlert, onStatsUpdate, onChatbotSuggestion }: TransactionMonitorProps) {
  const [transactions, setTransactions] = useState<Array<Transaction & { analysis: AIAnalysis }>>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Array<Transaction & { analysis: AIAnalysis }>>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<(Transaction & { analysis: AIAnalysis }) | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('expanded');
  const [themeStyle, setThemeStyle] = useState<ThemeStyle>('default');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [classificationFilter, setClassificationFilter] = useState<'all' | 'normal' | 'suspicious' | 'malicious'>('all');
  const [gasFilter, setGasFilter] = useState('');
  const [patternFilter, setPatternFilter] = useState('');
  
  const [stats, setStats] = useState({
    totalTransactions: 0,
    maliciousBlocked: 0,
    averageRiskScore: 0,
    throughput: 0
  });

  const feedRef = useRef<HTMLDivElement>(null);
  const newTransactionRef = useRef<HTMLDivElement>(null);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to new transactions
  useEffect(() => {
    if (autoScroll && newTransactionRef.current) {
      newTransactionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transactions, autoScroll]);

  // Filter transactions based on search and filters
  useEffect(() => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.blockNumber.toString().includes(searchTerm)
      );
    }

    // Risk filter
    if (riskFilter !== 'all') {
      filtered = filtered.filter(tx => {
        const risk = tx.analysis.riskScore;
        switch (riskFilter) {
          case 'low': return risk < 30;
          case 'medium': return risk >= 30 && risk < 70;
          case 'high': return risk >= 70;
          default: return true;
        }
      });
    }

    // Classification filter
    if (classificationFilter !== 'all') {
      filtered = filtered.filter(tx => tx.analysis.classification === classificationFilter);
    }

    // Gas filter
    if (gasFilter) {
      const gasThreshold = parseInt(gasFilter);
      if (!isNaN(gasThreshold)) {
        filtered = filtered.filter(tx => tx.gasUsed > gasThreshold);
      }
    }

    // Pattern filter
    if (patternFilter) {
      filtered = filtered.filter(tx => 
        tx.analysis.detectedPatterns.some(pattern => 
          pattern.toLowerCase().includes(patternFilter.toLowerCase())
        )
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, riskFilter, classificationFilter, gasFilter, patternFilter]);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const newTransaction = generateMockTransaction();
      const analysis = generateAIAnalysis(newTransaction);
      const alert = generateSecurityAlert(newTransaction, analysis);
      
      // Add to wallet history
      addToWalletHistory(newTransaction, analysis);
      
      if (alert) {
        onNewAlert(alert);
        
        // Trigger chatbot suggestions for high-risk transactions
        if (analysis.riskScore > 70) {
          const suggestions = [
            `🚨 High-risk transaction detected! Risk score: ${analysis.riskScore}%. Want me to explain what makes this suspicious?`,
            `⚠️ Potential ${analysis.detectedPatterns[0] || 'malicious activity'} detected. Should I break down the threat?`,
            `🛡️ Our AI blocked a suspicious transaction. Want to see what could have happened if it went through?`
          ];
          const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
          setTimeout(() => onChatbotSuggestion(randomSuggestion), 1000);
        }
      }

      setTransactions(prev => {
        const updated = [{ ...newTransaction, analysis }, ...prev.slice(0, 49)];
        
        // Update stats
        const totalTx = updated.length;
        const malicious = updated.filter(tx => tx.analysis.classification === 'malicious').length;
        const avgRisk = updated.reduce((sum, tx) => sum + tx.analysis.riskScore, 0) / totalTx;
        
        setStats({
          totalTransactions: totalTx,
          maliciousBlocked: malicious,
          averageRiskScore: Math.round(avgRisk),
          throughput: Math.floor(Math.random() * 50) + 20
        });
        
        // Update parent component with stats
        onStatsUpdate({
          totalTransactions: totalTx,
          maliciousBlocked: malicious,
          averageRiskScore: Math.round(avgRisk)
        });
        
        return updated;
      });
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, [isMonitoring, onNewAlert, onStatsUpdate, onChatbotSuggestion]);

  const handleExportCSV = () => {
    const csvContent = exportTransactionsCSV(filteredTransactions);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleTransactionAction = (tx: Transaction & { analysis: AIAnalysis }, action: 'simulate' | 'analyze' | 'explain') => {
    setSelectedTransaction(tx);
    switch (action) {
      case 'simulate':
        setIsSimulatorOpen(true);
        break;
      case 'analyze':
        // Could open a detailed analysis modal
        onChatbotSuggestion(`📊 Analyzing transaction ${tx.hash.substring(0, 10)}... This transaction shows patterns of ${tx.analysis.detectedPatterns[0] || 'unusual behavior'}. Want a detailed breakdown?`);
        break;
      case 'explain':
        onChatbotSuggestion(`🧠 This transaction was flagged because: ${tx.analysis.detectedPatterns.join(', ') || 'unusual gas patterns and high risk score'}. Risk score: ${tx.analysis.riskScore}%. Want me to explain each factor?`);
        break;
    }
  };

  const handleRiskClick = (tx: Transaction & { analysis: AIAnalysis }) => {
    setSelectedTransaction(tx);
    setIsRiskModalOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRiskFilter('all');
    setClassificationFilter('all');
    setGasFilter('');
    setPatternFilter('');
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 30) return 'text-green-600 bg-green-50 dark:bg-green-900 dark:text-green-300';
    if (riskScore < 70) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-300';
    return 'text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-300';
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'normal': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'suspicious': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'malicious': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getThemeClasses = () => {
    switch (themeStyle) {
      case 'cyberpunk':
        return 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-cyan-100';
      case 'minimalist':
        return 'bg-white text-gray-900 border-gray-100';
      case 'terminal':
        return 'bg-black text-green-400 font-mono border-green-800';
      default:
        return 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white';
    }
  };

  // Risk heatmap data
  const riskHeatmapData = transactions.slice(0, 50).map(tx => ({
    risk: tx.analysis.riskScore,
    color: tx.analysis.riskScore < 30 ? 'bg-green-500' : 
           tx.analysis.riskScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
  }));

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Real-time Transaction Monitor</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isMonitoring ? 'Live' : 'Paused'}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 lg:space-x-3">
          {/* Theme Selector */}
          <select
            value={themeStyle}
            onChange={(e) => setThemeStyle(e.target.value as ThemeStyle)}
            className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="default">Default</option>
            <option value="cyberpunk">Cyberpunk</option>
            <option value="minimalist">Minimalist</option>
            <option value="terminal">Terminal</option>
          </select>
          
          {/* View Mode Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'compact' ? 'expanded' : 'compact')}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm"
          >
            {viewMode === 'compact' ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{viewMode === 'compact' ? 'Expand' : 'Compact'}</span>
          </button>
          
          {/* Auto-scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm ${
              autoScroll 
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Auto-scroll</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            disabled={filteredTransactions.length === 0}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">CSV</span>
          </button>
          
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 text-xs sm:text-sm ${
              isMonitoring 
                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800' 
                : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
            }`}
          >
            {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isMonitoring ? 'Pause' : 'Start'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 sm:p-6 rounded-xl border border-blue-200 dark:border-blue-700 transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">Total Transactions</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalTransactions}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-200 dark:bg-blue-700 rounded-full">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 p-4 sm:p-6 rounded-xl border border-red-200 dark:border-red-700 transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">Malicious Blocked</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-900 dark:text-red-100">{stats.maliciousBlocked}</p>
              </div>
              <div className="p-2 sm:p-3 bg-red-200 dark:bg-red-700 rounded-full">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 p-4 sm:p-6 rounded-xl border border-yellow-200 dark:border-yellow-700 transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 font-medium">Avg Risk Score</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.averageRiskScore}%</p>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-200 dark:bg-yellow-700 rounded-full">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 sm:p-6 rounded-xl border border-green-200 dark:border-green-700 transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">Throughput (TPS)</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 dark:text-green-100">{stats.throughput}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-200 dark:bg-green-700 rounded-full">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Heatmap */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Risk Heatmap (Last 50 Transactions)</h3>
        <div className="flex space-x-0.5 sm:space-x-1 overflow-x-auto pb-2">
          {riskHeatmapData.map((item, index) => (
            <div
              key={index}
              className={`w-2 sm:w-3 h-6 sm:h-8 ${item.color} rounded-sm opacity-80 hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0`}
              title={`Transaction ${index + 1}: ${item.risk}% risk`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>Oldest</span>
          <span>Latest</span>
        </div>
      </div>

      {/* Search and Filter Panel */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Search & Filter
          </h3>
          <button
            onClick={clearFilters}
            className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search address, hash, block..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as any)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 sm:px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk (&lt;30%)</option>
            <option value="medium">Medium Risk (30-70%)</option>
            <option value="high">High Risk (&gt;70%)</option>
          </select>
          
          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value as any)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 sm:px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Classifications</option>
            <option value="normal">Normal</option>
            <option value="suspicious">Suspicious</option>
            <option value="malicious">Malicious</option>
          </select>
          
          <input
            type="number"
            placeholder="Min Gas Used"
            value={gasFilter}
            onChange={(e) => setGasFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 sm:px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          
          <input
            type="text"
            placeholder="Pattern (e.g., flash loan)"
            value={patternFilter}
            onChange={(e) => setPatternFilter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-2.5 sm:px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
        
        <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
      </div>

      {/* Transaction Feed */}
      <div className={`rounded-xl border shadow-lg overflow-hidden transition-colors duration-200 ${getThemeClasses()} border-gray-200 dark:border-gray-700`}>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Live Transaction Feed</h3>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="hidden sm:inline">Real-time monitoring</span>
              <span className="sm:hidden">Live</span>
            </div>
          </div>
        </div>
        
        <div ref={feedRef} className="max-h-[400px] sm:max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div>
              {Array.from({ length: 5 }).map((_, index) => (
                <TransactionSkeleton key={index} />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-gray-500 dark:text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No transactions match your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTransactions.map((tx, index) => (
                <div 
                  key={tx.id}
                  ref={index === 0 ? newTransactionRef : null}
                  className={`p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border-l-4 animate-in slide-in-from-left duration-500 ${
                    isWalletBlocked(tx.from) 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900 dark:bg-opacity-20' 
                      : tx.analysis.riskScore > 70 
                        ? 'border-orange-500' 
                        : 'border-transparent'
                  } ${index === 0 ? 'animate-pulse' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xs sm:text-sm font-mono text-gray-600 dark:text-gray-400">
                          {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 8)}
                        </span>
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${getClassificationColor(tx.analysis.classification)}`}>
                          {tx.analysis.classification.toUpperCase()}
                        </span>
                        <button
                          onClick={() => handleRiskClick(tx)}
                          className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded cursor-pointer hover:opacity-80 transition-opacity ${getRiskColor(tx.analysis.riskScore)}`}
                        >
                          Risk: {tx.analysis.riskScore}%
                        </button>
                        {isWalletBlocked(tx.from) && (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-full animate-pulse">
                            BLOCKED WALLET
                          </span>
                        )}
                      </div>
                      
                      {viewMode === 'expanded' && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <div>
                            <span className="font-medium">Value:</span> {tx.value.toFixed(4)} ETH
                          </div>
                          <div>
                            <span className="font-medium">Gas:</span> {tx.gasUsed.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">From:</span> <span className="hidden sm:inline">{tx.from.substring(0, 8)}...</span><span className="sm:hidden">{tx.from.substring(0, 6)}...</span>
                          </div>
                          <div>
                            <span className="font-medium">To:</span> <span className="hidden sm:inline">{tx.to.substring(0, 8)}...</span><span className="sm:hidden">{tx.to.substring(0, 6)}...</span>
                          </div>
                        </div>
                      )}
                      
                      {tx.analysis.detectedPatterns.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {tx.analysis.detectedPatterns.map((pattern, patternIndex) => (
                              <span key={patternIndex} className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded animate-pulse">
                                {pattern}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <div>Block #{tx.blockNumber}</div>
                      <div className="font-mono text-xs">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                      
                      {(tx.analysis.riskScore > 50 || tx.analysis.detectedPatterns.length > 0) && (
                        <div className="mt-1 sm:mt-2 space-y-1">
                          <div className="relative group">
                            <button className="flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-800 transition-all">
                              <Settings className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              <span className="hidden sm:inline">Actions</span>
                            </button>
                            
                            <div className="absolute right-0 top-full mt-1 w-32 sm:w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <button
                                onClick={() => handleTransactionAction(tx, 'simulate')}
                                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-1 sm:space-x-2"
                              >
                                <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span>🧪 Simulate</span>
                              </button>
                              <button
                                onClick={() => handleTransactionAction(tx, 'analyze')}
                                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-1 sm:space-x-2"
                              >
                                <BarChart3 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span>📊 Analyze</span>
                              </button>
                              <button
                                onClick={() => handleTransactionAction(tx, 'explain')}
                                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-1 sm:space-x-2"
                              >
                                <Brain className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span>🧠 Explain</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Transaction Simulator */}
      <TransactionSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        transaction={selectedTransaction}
      />
      
      {/* Risk Breakdown Modal */}
      <RiskBreakdownModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
}