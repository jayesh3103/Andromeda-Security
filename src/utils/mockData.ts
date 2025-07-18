import { Transaction, AIAnalysis, SecurityAlert, WalletReputation } from '../types/transaction';

// Blocked wallets state
export const blockedWallets = new Set<string>();

// Historical transactions for wallet analysis
export const walletHistory = new Map<string, Array<Transaction & { analysis: AIAnalysis }>>();

const WALLET_ADDRESSES = [
  '0x742d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C',
  '0x8ba1f109551bD432803012645Hac136c22C08',
  '0x1234567890123456789012345678901234567890',
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  '0x9876543210987654321098765432109876543210',
  '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  '0xcafebabecafebabecafebabecafebabecafebabe',
  '0x1111111111111111111111111111111111111111'
];

const ATTACK_PATTERNS = [
  'Flash loan attack',
  'Rug pull detected',
  'Sandwich attack',
  'MEV exploitation',
  'Unusual gas pattern',
  'High frequency trading',
  'Pump and dump',
  'Sybil attack pattern'
];

export function blockWallet(address: string) {
  blockedWallets.add(address);
}

export function unblockWallet(address: string) {
  blockedWallets.delete(address);
}

export function isWalletBlocked(address: string): boolean {
  return blockedWallets.has(address);
}

export function addToWalletHistory(transaction: Transaction, analysis: AIAnalysis) {
  const key = transaction.from;
  if (!walletHistory.has(key)) {
    walletHistory.set(key, []);
  }
  const history = walletHistory.get(key)!;
  history.unshift({ ...transaction, analysis });
  // Keep only last 100 transactions per wallet
  if (history.length > 100) {
    history.splice(100);
  }
}

export function getWalletHistory(address: string): Array<Transaction & { analysis: AIAnalysis }> {
  return walletHistory.get(address) || [];
}

export function generateMockTransaction(): Transaction {
  let fromAddress = WALLET_ADDRESSES[Math.floor(Math.random() * WALLET_ADDRESSES.length)];
  
  // If wallet is blocked, increase chance of generating transaction from it to show blocking effect
  if (Math.random() < 0.3) {
    const blockedAddresses = Array.from(blockedWallets);
    if (blockedAddresses.length > 0) {
      fromAddress = blockedAddresses[Math.floor(Math.random() * blockedAddresses.length)];
    }
  }
  
  const isHighRisk = Math.random() < 0.15;
  const isMediumRisk = Math.random() < 0.25; // 25% chance of medium-risk transaction
  
  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    hash: `0x${Math.random().toString(16).substr(2, 64)}`,
    from: fromAddress,
    to: WALLET_ADDRESSES[Math.floor(Math.random() * WALLET_ADDRESSES.length)],
    value: isHighRisk ? Math.random() * 10000 + 5000 : Math.random() * 1000 + 10,
    gasUsed: isHighRisk ? Math.random() * 500000 + 200000 : Math.random() * 100000 + 21000,
    gasPrice: Math.random() * 50 + 10,
    timestamp: Date.now(),
    blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    contractInteraction: Math.random() < 0.4,
    tokenTransfer: Math.random() < 0.3
  };
}

export function generateAIAnalysis(transaction: Transaction): AIAnalysis {
  const isHighValue = transaction.value > 1000;
  const isHighGas = transaction.gasUsed > 150000;
  const hasContract = transaction.contractInteraction;
  
  let baseRisk = Math.random() * 30;
  if (isHighValue) baseRisk += 20;
  if (isHighGas) baseRisk += 15;
  if (hasContract) baseRisk += 10;
  
  const riskScore = Math.min(Math.max(baseRisk + (Math.random() - 0.5) * 20, 0), 100);
  
  let classification: 'normal' | 'suspicious' | 'malicious';
  if (riskScore < 30) classification = 'normal';
  else if (riskScore < 70) classification = 'suspicious';
  else classification = 'malicious';
  
  const patterns = [];
  if (riskScore > 50) {
    const numPatterns = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numPatterns; i++) {
      patterns.push(ATTACK_PATTERNS[Math.floor(Math.random() * ATTACK_PATTERNS.length)]);
    }
  }
  
  return {
    riskScore: Math.round(riskScore),
    classification,
    confidence: Math.random() * 30 + 70,
    detectedPatterns: [...new Set(patterns)],
    modelPredictions: {
      supervised: Math.random() * 100,
      anomaly: Math.random() * 100,
      lstm: Math.random() * 100
    }
  };
}

export function generateSecurityAlert(transaction: Transaction, analysis: AIAnalysis): SecurityAlert | null {
  if (analysis.riskScore < 50) return null;
  
  const alertTypes = ['high_risk', 'suspicious_pattern', 'blocked_wallet'] as const;
  const severities = ['medium', 'high', 'critical'] as const;
  
  return {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    transactionId: transaction.id,
    walletAddress: transaction.from,
    alertType: alertTypes[Math.floor(Math.random() * alertTypes.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    message: `${analysis.classification.toUpperCase()}: ${analysis.detectedPatterns[0] || 'Suspicious activity detected'}`,
    timestamp: Date.now(),
    status: 'active'
  };
}

export const mockWalletReputations: WalletReputation[] = WALLET_ADDRESSES.map(address => ({
  address,
  riskLevel: blockedWallets.has(address) ? 'blocked' : 
            Math.random() < 0.1 ? 'high' : 
            Math.random() < 0.2 ? 'medium' : 'low',
  transactionCount: Math.floor(Math.random() * 1000) + 10,
  averageRiskScore: Math.random() * 100,
  flaggedTransactions: Math.floor(Math.random() * 20),
  lastActivity: Date.now() - Math.random() * 86400000 * 7,
  tags: Math.random() < 0.3 ? ['DeFi', 'High Volume'] : Math.random() < 0.2 ? ['Flagged', 'Under Review'] : []
}));

export function exportTransactionsCSV(transactions: Array<Transaction & { analysis: AIAnalysis }>): string {
  const headers = [
    'Transaction ID',
    'Hash',
    'From',
    'To',
    'Value (ETH)',
    'Gas Used',
    'Gas Price',
    'Block Number',
    'Timestamp',
    'Risk Score',
    'Classification',
    'Confidence',
    'Detected Patterns',
    'Contract Interaction',
    'Token Transfer'
  ];
  
  const csvContent = [
    headers.join(','),
    ...transactions.map(tx => [
      tx.id,
      tx.hash,
      tx.from,
      tx.to,
      tx.value.toFixed(6),
      tx.gasUsed,
      tx.gasPrice.toFixed(2),
      tx.blockNumber,
      new Date(tx.timestamp).toISOString(),
      tx.analysis.riskScore,
      tx.analysis.classification,
      tx.analysis.confidence.toFixed(2),
      `"${tx.analysis.detectedPatterns.join('; ')}"`,
      tx.contractInteraction,
      tx.tokenTransfer
    ].join(','))
  ].join('\n');
  
  return csvContent;
}

export function exportAlertsCSV(alerts: SecurityAlert[]): string {
  const headers = [
    'Alert ID',
    'Transaction ID',
    'Wallet Address',
    'Alert Type',
    'Severity',
    'Message',
    'Status',
    'Timestamp'
  ];
  
  const csvContent = [
    headers.join(','),
    ...alerts.map(alert => [
      alert.id,
      alert.transactionId,
      alert.walletAddress,
      alert.alertType,
      alert.severity,
      `"${alert.message}"`,
      alert.status,
      new Date(alert.timestamp).toISOString()
    ].join(','))
  ].join('\n');
  
  return csvContent;
}