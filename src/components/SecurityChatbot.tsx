import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, X, HelpCircle, AlertTriangle, Shield, Mic, MicOff, Volume2, Globe } from 'lucide-react';
import { SecurityAlert } from '../types/transaction';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
  hasQuickReplies?: boolean;
  quickReplies?: string[];
}

interface Language {
  code: string;
  name: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' }
];

// Translation dictionaries for common responses
const TRANSLATIONS: Record<string, Record<string, string>> = {
  welcome: {
    en: "🛡️ Welcome to Andromeda Security AI!\n\nI'm your intelligent security assistant. I can help with:\n\n• 📊 Real-time security stats\n• 🚨 Threat explanations\n• 📚 DeFi security education\n• 🔍 Transaction analysis\n\nWhat would you like to know? 🤖",
    hi: "🛡️ एंड्रोमेडा सिक्योरिटी AI में आपका स्वागत है!\n\nमैं आपका बुद्धिमान सुरक्षा सहायक हूं। मैं इसमें मदद कर सकता हूं:\n\n• 📊 रियल-टाइम सुरक्षा आंकड़े\n• 🚨 खतरों की व्याख्या\n• 📚 DeFi सुरक्षा शिक्षा\n• 🔍 लेनदेन विश्लेषण\n\nआप क्या जानना चाहेंगे? 🤖",
    es: "🛡️ ¡Bienvenido a Andromeda Security AI!\n\nSoy tu asistente inteligente de seguridad. Puedo ayudar con:\n\n• 📊 Estadísticas de seguridad en tiempo real\n• 🚨 Explicaciones de amenazas\n• 📚 Educación de seguridad DeFi\n• 🔍 Análisis de transacciones\n\n¿Qué te gustaría saber? 🤖",
    ta: "🛡️ ஆண்ட்ரோமெடா செக்யூரிட்டி AI-க்கு வரவேற்கிறோம்!\n\nநான் உங்கள் அறிவார்ந்த பாதுகாப்பு உதவியாளர். நான் இதில் உதவ முடியும்:\n\n• 📊 நேரடி பாதுகாப்பு புள்ளிவிவரங்கள்\n• 🚨 அச்சுறுத்தல் விளக்கங்கள்\n• 📚 DeFi பாதுகாப்பு கல்வி\n• 🔍 பரிவர்த்தனை பகுப்பாய்வு\n\nநீங்கள் என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்? 🤖",
    gu: "🛡️ એન્ડ્રોમેડા સિક્યુરિટી AI માં આપનું સ્વાગત છે!\n\nહું તમારો બુદ્ધિશાળી સુરક્ષા સહાયક છું. હું આમાં મદદ કરી શકું છું:\n\n• 📊 રીઅલ-ટાઇમ સુરક્ષા આંકડા\n• 🚨 ધમકીઓની સમજૂતી\n• 📚 DeFi સુરક્ષા શિક્ષણ\n• 🔍 વ્યવહાર વિશ્લેષણ\n\nતમે શું જાણવા માંગો છો? 🤖",
    fr: "🛡️ Bienvenue dans Andromeda Security AI !\n\nJe suis votre assistant intelligent de sécurité. Je peux aider avec :\n\n• 📊 Statistiques de sécurité en temps réel\n• 🚨 Explications des menaces\n• 📚 Éducation à la sécurité DeFi\n• 🔍 Analyse des transactions\n\nQue souhaitez-vous savoir ? 🤖"
  },
  quickReplies: {
    en: ["Show me today's stats", "Why was a wallet flagged?", "Teach me about threats", "Security tip! 🎯"],
    hi: ["आज के आंकड़े दिखाएं", "वॉलेट क्यों फ्लैग किया गया?", "खतरों के बारे में सिखाएं", "सुरक्षा टिप! 🎯"],
    es: ["Mostrar estadísticas de hoy", "¿Por qué se marcó una billetera?", "Enséñame sobre amenazas", "¡Consejo de seguridad! 🎯"],
    ta: ["இன்றைய புள்ளிவிவரங்களைக் காட்டு", "வாலட் ஏன் கொடியிடப்பட்டது?", "அச்சுறுத்தல்களைப் பற்றி கற்றுக்கொடு", "பாதுகாப்பு குறிப்பு! 🎯"],
    gu: ["આજના આંકડા બતાવો", "વૉલેટ કેમ ફ્લેગ થયું?", "ધમકીઓ વિશે શીખવો", "સુરક્ષા ટિપ! 🎯"],
    fr: ["Afficher les stats d'aujourd'hui", "Pourquoi un portefeuille a-t-il été signalé ?", "Apprenez-moi les menaces", "Conseil sécurité ! 🎯"]
  },
  notUnderstood: {
    en: "🤔 I'm not sure about that specific question, but I can help with:\n\n• 📊 Security Statistics - Current threat levels\n• 🚨 Threat Analysis - Why wallets get flagged\n• 📚 DeFi Education - Learn about attacks\n• 💡 Security Tips - Daily safety advice\n\nWhat interests you most?",
    hi: "🤔 मुझे उस विशिष्ट प्रश्न के बारे में यकीन नहीं है, लेकिन मैं इसमें मदद कर सकता हूं:\n\n• 📊 सुरक्षा आंकड़े - वर्तमान खतरे का स्तर\n• 🚨 खतरा विश्लेषण - वॉलेट क्यों फ्लैग होते हैं\n• 📚 DeFi शिक्षा - हमलों के बारे में जानें\n• 💡 सुरक्षा सुझाव - दैनिक सुरक्षा सलाह\n\nआपको सबसे ज्यादा क्या दिलचस्पी है?",
    es: "🤔 No estoy seguro sobre esa pregunta específica, pero puedo ayudar con:\n\n• 📊 Estadísticas de Seguridad - Niveles de amenaza actuales\n• 🚨 Análisis de Amenazas - Por qué se marcan las billeteras\n• 📚 Educación DeFi - Aprende sobre ataques\n• 💡 Consejos de Seguridad - Consejos diarios de seguridad\n\n¿Qué te interesa más?",
    ta: "🤔 அந்த குறிப்பிட்ட கேள்வியைப் பற்றி எனக்குத் தெரியவில்லை, ஆனால் நான் இதில் உதவ முடியும்:\n\n• 📊 பாதுகாப்பு புள்ளிவிவரங்கள் - தற்போதைய அச்சுறுத்தல் நிலைகள்\n• 🚨 அச்சுறுத்தல் பகுப்பாய்வு - வாலட்கள் ஏன் கொடியிடப்படுகின்றன\n• 📚 DeFi கல்வி - தாக்குதல்களைப் பற்றி அறிக\n• 💡 பாதுகாப்பு குறிப்புகள் - தினசரி பாதுகாப்பு ஆலோசனை\n\nஉங்களுக்கு எது மிகவும் சுவாரஸ்யமானது?",
    gu: "🤔 મને તે ચોક્કસ પ્રશ્ન વિશે ખાતરી નથી, પરંતુ હું આમાં મદદ કરી શકું છું:\n\n• 📊 સુરક્ષા આંકડા - વર્તમાન ધમકીનું સ્તર\n• 🚨 ધમકી વિશ્લેષણ - વૉલેટ કેમ ફ્લેગ થાય છે\n• 📚 DeFi શિક્ષણ - હુમલાઓ વિશે શીખો\n• 💡 સુરક્ષા ટિપ્સ - દૈનિક સુરક્ષા સલાહ\n\nતમને સૌથી વધુ શું રસ છે?",
    fr: "🤔 Je ne suis pas sûr de cette question spécifique, mais je peux aider avec :\n\n• 📊 Statistiques de Sécurité - Niveaux de menace actuels\n• 🚨 Analyse des Menaces - Pourquoi les portefeuilles sont signalés\n• 📚 Éducation DeFi - Apprendre les attaques\n• 💡 Conseils de Sécurité - Conseils quotidiens de sécurité\n\nQu'est-ce qui vous intéresse le plus ?"
  }
};

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SecurityAlert[];
  totalTransactions: number;
  maliciousBlocked: number;
  averageRiskScore: number;
  initialMessage?: string | null;
}

interface Intent {
  patterns: string[];
  responses: string[];
  requiresData?: boolean;
  category: 'security' | 'stats' | 'education' | 'threat' | 'general';
}

const intents: Intent[] = [
  {
    patterns: ['how many', 'total transactions', 'transaction count', 'stats today', 'today\'s stats', 'todays stats', 'show stats'],
    responses: [
      '📊 Today\'s Security Statistics:\n\n🔍 Transactions Monitored: {totalTransactions}\n🛡️ Threats Blocked: {maliciousBlocked}\n📈 Average Risk Score: {averageRiskScore}%\n⚡ System Efficiency: 99.2%\n\n{maliciousBlocked} potential attacks prevented today! Our AI is working hard to keep the blockchain safe. 🚀\n\nWant to see the latest threat patterns?',
      '📈 Real-Time Security Dashboard:\n\n✅ Safe Transactions: {safeTransactions}\n❌ Blocked Threats: {maliciousBlocked}\n⚠️ Risk Level: {riskLevel}\n🎯 Detection Accuracy: 94.2%\n\nYour security system is performing excellently! The AI has successfully identified and blocked {maliciousBlocked} suspicious transactions today. 🛡️'
    ],
    requiresData: true,
    category: 'stats'
  },
  {
    patterns: ['latest', 'recent', 'high risk wallet', 'dangerous wallet', 'latest threats', 'recent threats', 'explain threats'],
    responses: [
      '🚨 Latest Threat Intelligence:\n\n⚠️ Active Alerts: {activeAlerts}\n🎯 Top Threats Detected:\n\n• 💥 Flash Loan Attacks - 23% of threats\n• 🎭 Rug Pull Attempts - 18% of threats\n• 🥪 Sandwich Attacks - 15% of threats\n• ⛽ Gas Manipulation - 12% of threats\n\nLatest High-Risk Wallet: Shows patterns of automated bot behavior with unusual gas usage. Want me to explain what this means? 🤖',
      '🛡️ Threat Landscape Update:\n\n📊 Risk Distribution:\n• 🟢 Low Risk: 78% of transactions\n• 🟡 Medium Risk: 15% of transactions\n• 🔴 High Risk: 7% of transactions\n\nEmerging Patterns:\n• Increased MEV bot activity during high volatility\n• New phishing token contracts detected\n• Cross-chain bridge exploitation attempts\n\nStay vigilant! 👀'
    ],
    requiresData: true,
    category: 'threat'
  },
  {
    patterns: ['why flagged', 'why blocked', 'transaction flagged', 'wallet flagged'],
    responses: [
      '🛡️ Why Wallets Get Flagged:\n\nOur AI detects suspicious patterns like:\n\n• Flash loan attacks - Borrowing large amounts to manipulate prices\n• Rug pulls - Draining liquidity from tokens\n• Sandwich attacks - Front/back-running transactions\n• High-frequency patterns - Automated bot behavior\n• Gas anomalies - Unusual gas usage suggesting exploits\n\nEach transaction gets a risk score 0-100%. Anything above 70% gets flagged! 📊'
    ],
    category: 'security'
  },
  {
    patterns: ['what to do', 'received tokens', 'got tokens', 'suspicious tokens'],
    responses: [
      '⚠️ If you received tokens from a flagged wallet:\n\n🚫 DO NOT:\n• Interact with the tokens\n• Approve any contracts\n• Try to sell immediately\n\n✅ DO:\n• Check token legitimacy on verification sites\n• Wait for community feedback\n• Consider the tokens potentially worthless\n• Report if you believe it\'s a scam\n\nStay safe out there! 🛡️'
    ],
    category: 'security'
  },
  {
    patterns: ['rug pull', 'what is rug pull', 'learn defi', 'learndefi', 'teach me', 'defi basics'],
    responses: [
      '📚 DeFi Security Fundamentals:\n\n🎭 Rug Pulls: Token creators drain liquidity suddenly\n⚡ Flash Loans: Borrow massive amounts without collateral\n🥪 Sandwich Attacks: Profit from your transaction slippage\n🤖 MEV Bots: Extract value from transaction ordering\n\nKey Safety Rules:\n• ✅ Verify token contracts\n• ✅ Check liquidity locks\n• ✅ Research team credentials\n• ✅ Use trusted platforms\n\nWant to dive deeper into any specific threat? 🔍',
      '🧠 DeFi Learning Path:\n\nBeginner Level:\n• What is DeFi and how it works\n• Understanding smart contracts\n• Wallet security basics\n\nIntermediate Level:\n• Liquidity pools and AMMs\n• Yield farming strategies\n• Risk assessment techniques\n\nAdvanced Level:\n• MEV and arbitrage\n• Cross-chain protocols\n• Advanced security analysis\n\nWhich level interests you most? 🎯'
    ],
    category: 'education'
  },
  {
    patterns: ['flash loan', 'what is flash loan'],
    responses: [
      '⚡ Flash Loans Explained:\n\nBorrow massive amounts without collateral, but must repay in same transaction!\n\nLegitimate uses: 📚\n• Arbitrage opportunities\n• Debt refinancing\n• Liquidations\n\nMalicious uses: 💀\n• Price manipulation\n• Oracle attacks\n• Protocol exploitation\n\nOur AI detects when flash loans are used maliciously! 🤖'
    ],
    category: 'education'
  },
  {
    patterns: ['sandwich attack', 'mev', 'front running'],
    responses: [
      '🥪 Sandwich Attacks:\n\nAttackers "sandwich" your transaction between theirs to profit from slippage!\n\nHow it works:\n1. Bot sees your pending transaction 👀\n2. Places buy order with higher gas (front-runs) ⬆️\n3. Your transaction executes at worse price 📉\n4. Bot sells for profit (back-runs) ⬇️\n\nProtection: Use private mempools or MEV protection! 🛡️'
    ],
    category: 'education'
  },
  {
    patterns: ['how it works', 'ai detection', 'machine learning'],
    responses: [
      '🧠 Our AI Detection System:\n\nMulti-Model Approach:\n• Supervised Learning - Trained on known attack patterns\n• Anomaly Detection - Catches novel threats\n• LSTM Networks - Analyzes transaction sequences\n• Ensemble Model - Combines all predictions\n\nFeatures analyzed: 📊\n• Transaction patterns\n• Gas usage anomalies\n• Network behavior\n• Historical reputation\n\nSpeed: < 50ms analysis time! ⚡'
    ],
    category: 'security'
  },
  {
    patterns: ['false positive', 'mistake', 'wrong'],
    responses: [
      '🔍 False Positive Handling:\n\nIf you believe a wallet was incorrectly flagged:\n\n✅ Steps to take:\n• Review the specific patterns detected\n• Provide evidence of legitimate use\n• Submit whitelist request via admin panel\n• Our team will manually review\n\n📈 Continuous Learning:\nOur AI learns from feedback to reduce false positives over time!\n\nWant me to help you submit a review request? 🤝'
    ],
    category: 'security'
  }
];

const securityTips = [
  {
    question: "💡 Security Tip of the Day:",
    tips: [
      "🔐 Never share your private keys! Not even with 'support' teams. Legitimate services never ask for private keys.",
      "🎭 Rug Pull Red Flags: Anonymous teams, no locked liquidity, unrealistic APY promises (>1000%), and rapid price pumps.",
      "⚡ Flash Loan Safety: These attacks happen in milliseconds. Always use protocols with flash loan protection mechanisms.",
      "🥪 Avoid Sandwich Attacks: Use private mempools or set low slippage tolerance on DEX trades.",
      "🔍 Contract Verification: Always verify token contracts on Etherscan before interacting. Look for verified source code.",
      "💰 Diversify Risk: Never put all funds in one protocol. Spread across multiple audited platforms.",
      "🚨 Phishing Protection: Bookmark official sites. Scammers create fake versions with similar URLs.",
      "⛽ Gas Price Awareness: Unusually high gas requirements might indicate malicious contract interactions."
    ],
    options: ["Tell me more", "Another tip", "How to stay safe"],
    responses: {
      "Tell me more": "🔍 Deep Dive: This tip is based on real attack patterns we've observed. Our AI has prevented thousands of similar attacks by recognizing these patterns early.",
      "Another tip": "🎲 Random Security Fact: Did you know that 67% of DeFi exploits happen within the first 48 hours of a protocol launch? Always wait and watch! ⏰",
      "How to stay safe": "🛡️ Safety Checklist:\n\n✅ Use hardware wallets\n✅ Enable transaction confirmations\n✅ Verify all contract addresses\n✅ Keep software updated\n✅ Never rush into new protocols\n\nStay paranoid, stay safe! 🔐"
    }
  },
  {
    question: "🤔 Did You Know?",
    facts: [
      "🧠 Our AI analyzes over 50 transaction parameters in under 50 milliseconds to detect threats!",
      "⚡ Flash loan attacks can drain millions in a single transaction, but our system catches them before execution.",
      "🎭 The average rug pull steals $2.3M, but 89% show detectable patterns before the exit scam.",
      "🥪 Sandwich attacks cost users $280M annually, but can be prevented with proper slippage settings.",
      "🤖 MEV bots extract $600M+ yearly from regular users through transaction reordering.",
      "🔍 Only 12% of malicious contracts are detected by traditional scanners vs 94% by AI systems.",
      "⛽ Gas price manipulation is used in 34% of DeFi exploits to hide malicious activity."
    ],
    options: ["That's amazing!", "How does it work?", "More facts"],
    responses: {
      "That's amazing!": "🚀 The Power of AI Security: Our ensemble model combines supervised learning, anomaly detection, and LSTM networks to achieve 94.2% accuracy in threat detection!",
      "How does it work?": "🧠 AI Magic: We analyze transaction patterns, gas usage, wallet history, contract interactions, and timing to build a comprehensive risk profile in real-time!",
      "More facts": "📊 Bonus Fact: The blockchain processes 1.2M transactions daily, and our AI protects users from an average of 847 potential threats every 24 hours! 🛡️"
    }
  }
];

export function SecurityChatbot({ isOpen, onClose, alerts, totalTransactions, maliciousBlocked, averageRiskScore, initialMessage }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "🛡️ Welcome to Andromeda Security AI!\n\nI'm your intelligent security assistant. I can help with:\n\n• 📊 Real-time security stats\n• 🚨 Threat explanations\n• 📚 DeFi security education\n• 🔍 Transaction analysis\n\nWhat would you like to know? 🤖",
      timestamp: Date.now(),
      hasQuickReplies: true,
      quickReplies: ["Show me today's stats", "Why was a wallet flagged?", "Teach me about threats", "Security quiz! 🎯"]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentMode, setCurrentMode] = useState<'assistant' | 'threat' | 'education'>('assistant');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message in selected language
  const getWelcomeMessage = (langCode: string): Message => ({
    id: '1',
    type: 'bot',
    content: TRANSLATIONS.welcome[langCode] || TRANSLATIONS.welcome.en,
    timestamp: Date.now(),
    hasQuickReplies: true,
    quickReplies: TRANSLATIONS.quickReplies[langCode] || TRANSLATIONS.quickReplies.en
  });

  // Update welcome message when language changes
  useEffect(() => {
    setMessages([getWelcomeMessage(selectedLanguage)]);
  }, [selectedLanguage]);

  // Simple translation function (in production, use Google Translate API or similar)
  const translateText = async (text: string, targetLang: string): Promise<string> => {
    if (targetLang === 'en') return text;
    
    // Simple keyword-based translation for demo
    const translations: Record<string, Record<string, string>> = {
      hi: {
        'show stats': 'आंकड़े दिखाएं',
        'latest threats': 'नवीनतम खतरे',
        'security tip': 'सुरक्षा टिप',
        'teach me': 'मुझे सिखाएं',
        'help': 'मदद',
        'today': 'आज',
        'wallet': 'वॉलेट',
        'transaction': 'लेनदेन',
        'risk': 'जोखिम',
        'threat': 'खतरा'
      },
      es: {
        'show stats': 'mostrar estadísticas',
        'latest threats': 'últimas amenazas',
        'security tip': 'consejo de seguridad',
        'teach me': 'enséñame',
        'help': 'ayuda',
        'today': 'hoy',
        'wallet': 'billetera',
        'transaction': 'transacción',
        'risk': 'riesgo',
        'threat': 'amenaza'
      },
      ta: {
        'show stats': 'புள்ளிவிவரங்களைக் காட்டு',
        'latest threats': 'சமீபத்திய அச்சுறுத்தல்கள்',
        'security tip': 'பாதுகாப்பு குறிப்பு',
        'teach me': 'எனக்குக் கற்றுக்கொடு',
        'help': 'உதவி',
        'today': 'இன்று',
        'wallet': 'வாலட்',
        'transaction': 'பரிவர்த்தனை',
        'risk': 'ஆபத்து',
        'threat': 'அச்சுறுத்தல்'
      },
      gu: {
        'show stats': 'આંકડા બતાવો',
        'latest threats': 'નવીનતમ ધમકીઓ',
        'security tip': 'સુરક્ષા ટિપ',
        'teach me': 'મને શીખવો',
        'help': 'મદદ',
        'today': 'આજે',
        'wallet': 'વૉલેટ',
        'transaction': 'વ્યવહાર',
        'risk': 'જોખમ',
        'threat': 'ધમકી'
      },
      fr: {
        'show stats': 'afficher les statistiques',
        'latest threats': 'dernières menaces',
        'security tip': 'conseil de sécurité',
        'teach me': 'apprenez-moi',
        'help': 'aide',
        'today': 'aujourd\'hui',
        'wallet': 'portefeuille',
        'transaction': 'transaction',
        'risk': 'risque',
        'threat': 'menace'
      }
    };

    const langTranslations = translations[targetLang];
    if (!langTranslations) return text;

    let translatedText = text.toLowerCase();
    Object.entries(langTranslations).forEach(([english, translated]) => {
      translatedText = translatedText.replace(new RegExp(english, 'gi'), translated);
    });

    return translatedText;
  };

  const detectLanguage = (text: string): string => {
    // Simple language detection based on character patterns
    if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'; // Gujarati
    if (/[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/.test(text)) return 'fr'; // French
    if (/[¿¡ñáéíóúü]/.test(text)) return 'es'; // Spanish
    return 'en'; // Default to English
  };

  // Handle initial message from parent component
  useEffect(() => {
    if (initialMessage && isOpen) {
      const botMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: initialMessage,
        timestamp: Date.now(),
        hasQuickReplies: true,
        quickReplies: ["Tell me more", "Show me the details", "What should I do?"]
      };
      setMessages(prev => [...prev, botMessage]);
    }
  }, [initialMessage, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeIntent = (userInput: string): Intent | null => {
    const input = userInput.toLowerCase();
    
    for (const intent of intents) {
      for (const pattern of intent.patterns) {
        if (input.includes(pattern.toLowerCase())) {
          return intent;
        }
      }
    }
    return null;
  };

  const generateContextualResponse = (response: string): string => {
    const activeAlerts = alerts.filter(a => a.status === 'active').length;
    const riskPercentage = totalTransactions > 0 ? ((maliciousBlocked / totalTransactions) * 100).toFixed(1) : '0';
    const safeTransactions = totalTransactions - maliciousBlocked;
    const riskLevel = averageRiskScore < 30 ? 'Low 🟢' : averageRiskScore < 70 ? 'Medium 🟡' : 'High 🔴';
    
    return response
      .replace('{totalTransactions}', totalTransactions.toString())
      .replace('{maliciousBlocked}', maliciousBlocked.toString())
      .replace('{averageRiskScore}', averageRiskScore.toString())
      .replace('{activeAlerts}', activeAlerts.toString())
      .replace('{riskPercentage}', riskPercentage)
      .replace('{safeTransactions}', safeTransactions.toString())
      .replace('{riskLevel}', riskLevel);
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue;
    if (!text.trim()) return;

    // Detect language if not English
    const detectedLang = detectLanguage(text);
    if (detectedLang !== 'en' && selectedLanguage === 'en') {
      setSelectedLanguage(detectedLang);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setIsTranslating(selectedLanguage !== 'en');

    // Simulate AI thinking time
    setTimeout(async () => {
      let response = '';
      let hasQuickReplies = false;
      let quickReplies: string[] = [];

      // Check for gamification triggers
      if (text.toLowerCase().includes('tip') || text.toLowerCase().includes('security tip')) {
        const tipData = securityTips[0];
        const randomTip = tipData.tips[Math.floor(Math.random() * tipData.tips.length)];
        response = `${tipData.question}\n\n${randomTip}`;
        hasQuickReplies = true;
        quickReplies = tipData.options;
      } else if (text.toLowerCase().includes('did you know') || text.toLowerCase().includes('fact')) {
        const factData = securityTips[1];
        const randomFact = factData.facts[Math.floor(Math.random() * factData.facts.length)];
        response = `${factData.question}\n\n${randomFact}`;
        hasQuickReplies = true;
        quickReplies = factData.options;
      } else {
        // Check for quick reply responses
        const tipData = securityTips[0];
        const factData = securityTips[1];
        
        if (tipData.options.includes(text)) {
          response = tipData.responses[text as keyof typeof tipData.responses];
        } else if (factData.options.includes(text)) {
          response = factData.responses[text as keyof typeof factData.responses];
        } else {
          // Analyze intent
          const intent = analyzeIntent(text);
          
          if (intent) {
            const randomResponse = intent.responses[Math.floor(Math.random() * intent.responses.length)];
            response = intent.requiresData ? generateContextualResponse(randomResponse) : randomResponse;
            
            // Add contextual quick replies based on category
            if (intent.category === 'stats') {
              hasQuickReplies = true;
              quickReplies = ["Show recent alerts", "Latest threats", "Security tip"];
            } else if (intent.category === 'education') {
              hasQuickReplies = true;
              quickReplies = ["Learn more threats", "Security tips", "Did you know?"];
            } else if (intent.category === 'threat') {
              hasQuickReplies = true;
              quickReplies = ["How to protect?", "More details", "Security tip"];
            }
          } else {
            // Default response with suggestions
            response = TRANSLATIONS.notUnderstood[selectedLanguage] || TRANSLATIONS.notUnderstood.en;
            hasQuickReplies = true;
            quickReplies = TRANSLATIONS.quickReplies[selectedLanguage] || TRANSLATIONS.quickReplies.en;
          }
        }
      }

      // Translate response if needed
      if (selectedLanguage !== 'en') {
        response = await translateText(response, selectedLanguage);
        if (hasQuickReplies) {
          quickReplies = await Promise.all(
            quickReplies.map(reply => translateText(reply, selectedLanguage))
          );
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: Date.now(),
        hasQuickReplies,
        quickReplies
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      setIsTranslating(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const cleanText = text.replace(/[🔍📊🚨🛡️⚡🎯🤖💰📈💸😱🚩📚💀👀⬆️📉⬇️🥪🧠✅🔮🎉\*\#]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      // Set language for speech synthesis
      const speechLang = selectedLanguage === 'hi' ? 'hi-IN' :
                        selectedLanguage === 'es' ? 'es-ES' :
                        selectedLanguage === 'ta' ? 'ta-IN' :
                        selectedLanguage === 'gu' ? 'gu-IN' :
                        selectedLanguage === 'fr' ? 'fr-FR' : 'en-US';
      utterance.lang = speechLang;
      
      speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white bg-opacity-20 rounded-full">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Andromeda AI Assistant</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-xs text-indigo-100">
                {currentMode === 'threat' ? 'Threat Analysis Mode' : 
                 currentMode === 'education' ? 'Learning Mode' : 'Security Assistant'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <div className="relative group">
            <button className="flex items-center space-x-1 p-2 hover:bg-white hover:bg-opacity-20 rounded transition-colors">
              <Globe className="w-4 h-4" />
              <span className="text-xs">{SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.flag}</span>
            </button>
            
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 max-h-60 overflow-y-auto">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 ${
                    selectedLanguage === lang.code ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex space-x-1">
          {[
            { id: 'assistant', label: '🤖 Help', icon: Bot },
            { id: 'threat', label: '🛡️ Threats', icon: Shield },
            { id: 'education', label: '📚 Learn', icon: HelpCircle }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setCurrentMode(mode.id as any)}
              className={`flex-1 px-2 py-1 text-xs rounded transition-all ${
                currentMode === mode.id
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div className={`p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                  <div className="text-sm whitespace-pre-line">{message.content}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className={`text-xs ${message.type === 'user' ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                    {message.type === 'bot' && (
                      <button
                        onClick={() => speakMessage(message.content)}
                        className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Replies */}
            {message.hasQuickReplies && message.quickReplies && (
              <div className="mt-2 flex flex-wrap gap-2 justify-start">
                {message.quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(reply)}
                    className="px-3 py-1 text-xs bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-all transform hover:scale-105"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  {isTranslating && (
                    <Globe className="w-3 h-3 text-indigo-600 animate-spin" />
                  )}
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-1">
          {[
            TRANSLATIONS.quickReplies[selectedLanguage]?.[0] || "📊 Today's stats",
            TRANSLATIONS.quickReplies[selectedLanguage]?.[2] || "📚 Learn DeFi",
            TRANSLATIONS.quickReplies[selectedLanguage]?.[3] || "💡 Security tip",
            "🌍 Language"
          ].map((action, index) => (
            <button
              key={index}
              onClick={() => {
                if (action === "🌍 Language") {
                  // Cycle through languages
                  const currentIndex = SUPPORTED_LANGUAGES.findIndex(l => l.code === selectedLanguage);
                  const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
                  setSelectedLanguage(SUPPORTED_LANGUAGES[nextIndex].code);
                } else {
                  handleSendMessage(action);
                }
              }}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              selectedLanguage === 'hi' ? "सुरक्षा, खतरों या DeFi के बारे में पूछें..." :
              selectedLanguage === 'es' ? "Pregunta sobre seguridad, amenazas o DeFi..." :
              selectedLanguage === 'ta' ? "பாதுகாப்பு, அச்சுறுத்தல்கள் அல்லது DeFi பற்றி கேளுங்கள்..." :
              selectedLanguage === 'gu' ? "સુરક્ષા, ધમકીઓ અથવા DeFi વિશે પૂછો..." :
              selectedLanguage === 'fr' ? "Demandez sur la sécurité, les menaces ou DeFi..." :
              "Ask about security, threats, or DeFi..."
            }
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          <button
            onClick={handleVoiceInput}
            disabled={isListening}
            className={`px-3 py-2 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-100 text-red-600 animate-pulse' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isTyping}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}