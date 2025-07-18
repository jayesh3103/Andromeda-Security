export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: number;
  gasUsed: number;
  gasPrice: number;
  timestamp: number;
  blockNumber: number;
  contractInteraction: boolean;
  tokenTransfer: boolean;
}

export interface AIAnalysis {
  riskScore: number;
  classification: 'normal' | 'suspicious' | 'malicious';
  confidence: number;
  detectedPatterns: string[];
  modelPredictions: {
    supervised: number;
    anomaly: number;
    lstm: number;
  };
}

export interface SecurityAlert {
  id: string;
  transactionId: string;
  walletAddress: string;
  alertType: 'high_risk' | 'suspicious_pattern' | 'blocked_wallet';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
}

export interface WalletReputation {
  address: string;
  riskLevel: 'low' | 'medium' | 'high' | 'blocked';
  transactionCount: number;
  averageRiskScore: number;
  flaggedTransactions: number;
  lastActivity: number;
  tags: string[];
}