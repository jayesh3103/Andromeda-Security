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
      <header id="header" className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 border-b border-indigo-700 dark:border-indigo-600 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Andromeda Security</h1>
                <p className="text-sm text-indigo-100">AI-Powered Blockchain Protection</p>
              </div>
            </div>
            
            <div id="controls" className="flex items-center space-x-4">
              <button
                onClick={handleStartTour}
                className="flex items-center space-x-2 px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Start onboarding tour"
              >
                <HelpCircle className="w-4 h-4 text-white" />
                <span className="text-sm text-white">Tour</span>
              </button>
              
              <button
                onClick={() => setIsChatbotOpen(!isChatbotOpen)}
                className="flex items-center space-x-2 px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Security Assistant"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span className="text-sm text-white">AI Help</span>
              </button>
              
              <ThemeToggle />
              
              <div className="flex items-center space-x-2 text-sm text-indigo-100">
                <Zap className="w-4 h-4 text-green-400" />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>System Online</span>
              </div>
              
              {activeAlertCount > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-red-500 bg-opacity-20 text-red-100 rounded-full text-sm animate-pulse">
                  <Bell className="w-4 h-4" />
                  <span>{activeAlertCount} Active Alert{activeAlertCount !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  id={`${tab.id}-tab`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full animate-pulse">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 transition-colors duration-200">
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