import React, { useState } from 'react';
import { AlertTriangle, Shield, Eye, CheckCircle, XCircle, Clock, Download, Filter } from 'lucide-react';
import { SecurityAlert } from '../types/transaction';
import { exportAlertsCSV } from '../utils/mockData';

interface SecurityAlertsProps {
  alerts: SecurityAlert[];
  onUpdateAlert: (alertId: string, status: SecurityAlert['status']) => void;
}

export function SecurityAlerts({ alerts, onUpdateAlert }: SecurityAlertsProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'investigating' | 'resolved'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

  const handleExportCSV = () => {
    const csvContent = exportAlertsCSV(filteredAlerts);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `security_alerts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const filteredAlerts = alerts.filter(alert => {
    const statusMatch = filter === 'all' || alert.status === filter;
    const severityMatch = selectedSeverity === 'all' || alert.severity === selectedSeverity;
    return statusMatch && severityMatch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="w-4 h-4" />;
      case 'investigating': return <Eye className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'false_positive': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const alertCounts = {
    active: alerts.filter(a => a.status === 'active').length,
    investigating: alerts.filter(a => a.status === 'investigating').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    total: alerts.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
            <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security Alerts</h2>
          <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full animate-pulse">
            {alertCounts.active} Active
          </span>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredAlerts.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Alerts</p>
              <p className="text-3xl font-bold text-gray-900">{alertCounts.total}</p>
            </div>
            <div className="p-3 bg-gray-200 rounded-full">
              <AlertTriangle className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Active</p>
              <p className="text-3xl font-bold text-red-900">{alertCounts.active}</p>
            </div>
            <div className="p-3 bg-red-200 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Investigating</p>
              <p className="text-3xl font-bold text-yellow-900">{alertCounts.investigating}</p>
            </div>
            <div className="p-3 bg-yellow-200 rounded-full">
              <Eye className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Resolved</p>
              <p className="text-3xl font-bold text-green-900">{alertCounts.resolved}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Alerts</h3>
        </div>
        <div className="flex flex-wrap gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Alert Feed ({filteredAlerts.length} alerts)
          </h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No alerts match the current filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getStatusColor(alert.status)}`}>
                          {getStatusIcon(alert.status)}
                          <span>{alert.status.replace('_', ' ').toUpperCase()}</span>
                        </span>
                        <span className="text-xs text-gray-500">
                          {alert.alertType.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{alert.message}</p>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div>
                          <span className="font-medium">Wallet:</span> {alert.walletAddress.substring(0, 16)}...
                        </div>
                        <div>
                          <span className="font-medium">Transaction:</span> {alert.transactionId.substring(0, 20)}...
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                      
                      {alert.status === 'active' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onUpdateAlert(alert.id, 'investigating')}
                            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all transform hover:scale-105"
                          >
                            Investigate
                          </button>
                          <button
                            onClick={() => onUpdateAlert(alert.id, 'false_positive')}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all transform hover:scale-105"
                          >
                            False Positive
                          </button>
                        </div>
                      )}
                      
                      {alert.status === 'investigating' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onUpdateAlert(alert.id, 'resolved')}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all transform hover:scale-105"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => onUpdateAlert(alert.id, 'false_positive')}
                            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all transform hover:scale-105"
                          >
                            False Positive
                          </button>
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
    </div>
  );
}