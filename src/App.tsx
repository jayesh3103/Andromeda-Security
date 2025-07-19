import React, { useState } from 'react';
import { Shield, Activity, Brain, Wallet, Bell, Zap, HelpCircle, BarChart3, MessageCircle } from 'lucide-react';
import { TransactionMonitor } from './components/TransactionMonitor';
import { AIModelDashboard } from './components/AIModelDashboard';
import { SecurityAlerts } from './components/SecurityAlerts';
import { WalletReputation } from './components/WalletReputation';
import { SecurityChatbot } from './components/SecurityChatbot';
import { OnboardingTour } from './components/OnboardingTour';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';
import { SecurityAlert } from './types/transaction';

type TabType = 'monitor' | 'ai' | 'alerts' | 'wallets';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('monitor');
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [maliciousBlocked, setMaliciousBlocked] = useState(0);
  const [averageRiskScore, setAverageRiskScore] = useState(0);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotSuggestion, setChatbotSuggestion] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(() => {
    return !localStorage.getItem('tour-completed');
  });

  const handleNewAlert = (alert: SecurityAlert) => {
    setAlerts(prev => [alert, ...prev]);
  };

  const handleStatsUpdate = (stats: { totalTransactions: number; maliciousBlocked: number; averageRiskScore: number }) => {
    setTotalTransactions(stats.totalTransactions);
    setMaliciousBlocked(stats.maliciousBlocked);
    setAverageRiskScore(stats.averageRiskScore);
  };

  const handleChatbotSuggestion = (message: string) => {
    setChatbotSuggestion(message);
    setIsChatbotOpen(true);
  };

  const handleUpdateAlert = (alertId: string, status: SecurityAlert['status']) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status } : alert
    ));
  };

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('tour-completed', 'true');
  };

  const handleStartTour = () => {
    setShowTour(true);
  };

  const activeAlertCount = alerts.filter(alert => alert.status === 'active').length;

  const tabs = [
    { id: 'monitor' as TabType, label: 'Transaction Monitor', icon: Activity },
    { id: 'ai' as TabType, label: 'AI Models', icon: Brain },
    { id: 'alerts' as TabType, label: 'Security Alerts', icon: Bell, badge: activeAlertCount },
    { id: 'wallets' as TabType, label: 'Wallet Reputation', icon: Wallet }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header id="header" className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 border-b border-indigo-700 dark:border-indigo-600 sticky top-0 z-10 shadow-lg transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 min-h-[3.5rem] sm:min-h-[4rem] transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 sm:p-2 bg-white bg-opacity-20 rounded-lg">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="hidden sm:block min-w-0 flex-shrink-0">
                <h1 className="text-lg sm:text-xl font-bold text-white">Andromeda Security</h1>
                <p className="text-xs sm:text-sm text-indigo-100 hidden md:block">AI-Powered Blockchain Protection</p>
              </div>
              <div className="sm:hidden min-w-0 flex-shrink-0">
                <h1 className="text-base font-bold text-white">Andromeda</h1>
              </div>
            </div>
            
            <div id="controls" className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
              <button
                onClick={handleStartTour}
                className="hidden lg:flex items-center space-x-2 px-2 sm:px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Start onboarding tour"
              >
                <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <span className="text-xs sm:text-sm text-white">Tour</span>
              </button>
              
              <button
                onClick={() => setIsChatbotOpen(!isChatbotOpen)}
                className="flex items-center space-x-1 px-2 py-1 sm:px-3 sm:py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Security Assistant"
              >
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <span className="text-xs sm:text-sm text-white hidden sm:inline">AI Help</span>
              </button>
              
              <ThemeToggle />
              
              <div className="hidden xl:flex items-center space-x-2 text-xs text-indigo-100">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>System Online</span>
              </div>
              
              {activeAlertCount > 0 && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-red-500 bg-opacity-20 text-red-100 rounded-full text-xs animate-pulse">
                  <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden md:inline">{activeAlertCount} Alert{activeAlertCount !== 1 ? 's' : ''}</span>
                  <span className="md:hidden">{activeAlertCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200 sticky top-14 sm:top-16 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-2 lg:space-x-4 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  id={`${tab.id}-tab`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 py-3 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">
                    {tab.id === 'monitor' ? 'Monitor' : 
                     tab.id === 'ai' ? 'AI' : 
                     tab.id === 'alerts' ? 'Alerts' : 'Wallets'}
                  </span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-medium px-1.5 py-0.5 rounded-full animate-pulse ml-1">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 animate-in fade-in duration-500 transition-colors duration-200 min-h-screen">
        {activeTab === 'monitor' && (
          <TransactionMonitor 
            onNewAlert={handleNewAlert} 
            onStatsUpdate={handleStatsUpdate}
            onChatbotSuggestion={handleChatbotSuggestion}
          />
        )}
        {activeTab === 'ai' && <AIModelDashboard />}
        {activeTab === 'alerts' && <SecurityAlerts alerts={alerts} onUpdateAlert={handleUpdateAlert} />}
        {activeTab === 'wallets' && <WalletReputation />}
      </main>
      
      {/* Onboarding Tour */}
      <OnboardingTour isOpen={showTour} onClose={handleTourComplete} />
      
      {/* Security Chatbot */}
      <SecurityChatbot 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)}
        alerts={alerts}
        totalTransactions={totalTransactions}
        maliciousBlocked={maliciousBlocked}
        averageRiskScore={averageRiskScore}
        initialMessage={chatbotSuggestion}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;