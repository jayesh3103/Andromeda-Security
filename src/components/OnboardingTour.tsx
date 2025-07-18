import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Play } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Andromeda Security',
    content: 'This AI-powered dashboard monitors blockchain transactions in real-time to detect malicious activity. Let\'s take a quick tour!',
    target: 'header',
    position: 'bottom'
  },
  {
    id: 'monitor',
    title: 'Transaction Monitor',
    content: 'Watch live transactions as they\'re analyzed by our AI models. Each transaction gets a risk score and classification.',
    target: 'monitor-tab',
    position: 'bottom'
  },
  {
    id: 'ai-models',
    title: 'AI Model Performance',
    content: 'Monitor the performance of our ensemble AI models including supervised learning, anomaly detection, and LSTM networks.',
    target: 'ai-tab',
    position: 'bottom'
  },
  {
    id: 'alerts',
    title: 'Security Alerts',
    content: 'View and manage security alerts generated by the AI system. You can investigate, resolve, or mark alerts as false positives.',
    target: 'alerts-tab',
    position: 'bottom'
  },
  {
    id: 'wallets',
    title: 'Wallet Reputation',
    content: 'Manage wallet reputation scores, block suspicious addresses, and view detailed transaction history for any wallet.',
    target: 'wallets-tab',
    position: 'bottom'
  },
  {
    id: 'controls',
    title: 'Admin Controls & AI Assistant',
    content: 'Use the pause/play button to control monitoring, export data as CSV, get help from the AI assistant, and toggle between dark/light themes.',
    target: 'controls',
    position: 'left'
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingTour({ isOpen, onClose }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen && tourSteps[currentStep]) {
      const element = document.getElementById(tourSteps[currentStep].target);
      setTargetElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('tour-highlight');
      }
    }

    return () => {
      if (targetElement) {
        targetElement.classList.remove('tour-highlight');
      }
    };
  }, [currentStep, isOpen, targetElement]);

  if (!isOpen) return null;

  const currentTourStep = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const getTooltipPosition = () => {
    if (!targetElement) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const rect = targetElement.getBoundingClientRect();
    const position = currentTourStep.position;

    switch (position) {
      case 'top':
        return {
          top: rect.top - 10,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          top: rect.bottom + 10,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - 10,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + 10,
          transform: 'translate(0, -50%)'
        };
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Tooltip */}
      <div
        className="fixed z-50 max-w-sm"
        style={getTooltipPosition()}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentTourStep.title}
              </h3>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {currentTourStep.content}
          </p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>Step {currentStep + 1} of {tourSteps.length}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-2">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Skip Tour
              </button>
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <span>{isLastStep ? 'Finish' : 'Next'}</span>
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Arrow pointer */}
        <div
          className={`absolute w-3 h-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transform rotate-45 ${
            currentTourStep.position === 'top' ? 'bottom-[-6px] left-1/2 -translate-x-1/2' :
            currentTourStep.position === 'bottom' ? 'top-[-6px] left-1/2 -translate-x-1/2' :
            currentTourStep.position === 'left' ? 'right-[-6px] top-1/2 -translate-y-1/2' :
            'left-[-6px] top-1/2 -translate-y-1/2'
          }`}
        />
      </div>
    </>
  );
}