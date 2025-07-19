import React, { useState, useEffect } from 'react';
import { Brain, BarChart3, Target, Zap, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  throughput: number;
  latency: number;
}

interface ModelPerformance {
  supervised: number;
  anomaly: number;
  lstm: number;
  ensemble: number;
}

export function AIModelDashboard() {
  const [metrics, setMetrics] = useState<ModelMetrics>({
    accuracy: 94.2,
    precision: 91.8,
    recall: 89.5,
    f1Score: 90.6,
    falsePositiveRate: 2.1,
    throughput: 1250,
    latency: 45
  });

  const [performance, setPerformance] = useState<ModelPerformance>({
    supervised: 92.3,
    anomaly: 87.1,
    lstm: 89.7,
    ensemble: 94.2
  });

  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time metric updates
      setMetrics(prev => ({
        ...prev,
        accuracy: prev.accuracy + (Math.random() - 0.5) * 0.5,
        throughput: Math.floor(Math.random() * 200) + 1150,
        latency: Math.floor(Math.random() * 20) + 35
      }));

      setPerformance(prev => ({
        supervised: prev.supervised + (Math.random() - 0.5) * 1,
        anomaly: prev.anomaly + (Math.random() - 0.5) * 1,
        lstm: prev.lstm + (Math.random() - 0.5) * 1,
        ensemble: prev.ensemble + (Math.random() - 0.5) * 0.3
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRetrain = () => {
    setIsTraining(true);
    setTimeout(() => {
      setIsTraining(false);
      setMetrics(prev => ({
        ...prev,
        accuracy: Math.min(prev.accuracy + Math.random() * 2, 98),
        precision: Math.min(prev.precision + Math.random() * 1.5, 97),
        recall: Math.min(prev.recall + Math.random() * 1.5, 96)
      }));
    }, 8000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Model Performance</h2>
        </div>
        <button
          onClick={handleRetrain}
          disabled={isTraining}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
            isTraining
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isTraining ? 'animate-spin' : ''}`} />
          <span>{isTraining ? 'Retraining...' : 'Retrain Models'}</span>
        </button>
      </div>

      {/* Model Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 sm:p-6 rounded-xl border border-blue-200 dark:border-blue-700 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">Supervised Model</h3>
            <div className="p-1.5 sm:p-2 bg-blue-200 dark:bg-blue-700 rounded-full">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 dark:text-blue-100">{performance.supervised.toFixed(1)}%</div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${performance.supervised}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-4 sm:p-6 rounded-xl border border-orange-200 dark:border-orange-700 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-orange-600 dark:text-orange-400">Anomaly Detection</h3>
            <div className="p-1.5 sm:p-2 bg-orange-200 dark:bg-orange-700 rounded-full">
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900 dark:text-orange-100">{performance.anomaly.toFixed(1)}%</div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
            <div 
              className="bg-orange-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${performance.anomaly}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 sm:p-6 rounded-xl border border-green-200 dark:border-green-700 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">LSTM Sequential</h3>
            <div className="p-1.5 sm:p-2 bg-green-200 dark:bg-green-700 rounded-full">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 dark:text-green-100">{performance.lstm.toFixed(1)}%</div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${performance.lstm}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-4 sm:p-6 rounded-xl border border-purple-200 dark:border-purple-700 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">Ensemble Model</h3>
            <div className="p-1.5 sm:p-2 bg-purple-200 dark:bg-purple-700 rounded-full">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900 dark:text-purple-100">{performance.ensemble.toFixed(1)}%</div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${performance.ensemble}%` }}
            />
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Classification Metrics
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.accuracy}%` }}
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white w-10 sm:w-12">{metrics.accuracy.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Precision</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.precision}%` }}
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white w-10 sm:w-12">{metrics.precision.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Recall</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.recall}%` }}
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white w-10 sm:w-12">{metrics.recall.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">F1 Score</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.f1Score}%` }}
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white w-10 sm:w-12">{metrics.f1Score.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">False Positive Rate</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 sm:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.falsePositiveRate * 10}%` }}
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white w-10 sm:w-12">{metrics.falsePositiveRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
            Performance Metrics
          </h3>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Throughput</span>
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400">{metrics.throughput.toLocaleString()}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Transactions per second</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Latency</span>
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400">{metrics.latency}ms</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Average response time</p>
            </div>
            
            <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-xs sm:text-sm">
                <div className={`w-3 h-3 rounded-full ${isTraining ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-gray-600 dark:text-gray-400">
                  Model Status: {isTraining ? 'Training in progress...' : 'Active and monitoring'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Training Progress */}
      {isTraining && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 sm:p-6 shadow-sm animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-yellow-600" />
            <div className="flex-1">
              <h4 className="text-xs sm:text-sm font-medium text-yellow-800 dark:text-yellow-300">Model Retraining in Progress</h4>
              <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-400">Updating models with latest transaction data...</p>
            </div>
          </div>
          <div className="mt-3 w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}
    </div>
  );
}