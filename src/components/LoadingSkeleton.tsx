import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  lines?: number;
}

export function LoadingSkeleton({ 
  className = '', 
  variant = 'rectangular', 
  width = 'w-full', 
  height = 'h-4',
  lines = 1 
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} ${width} ${height}`}
            style={{ width: index === lines - 1 ? '75%' : '100%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${width} ${height} ${className}`} />
  );
}

export function TransactionSkeleton() {
  return (
    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <LoadingSkeleton width="w-32" height="h-4" />
            <LoadingSkeleton width="w-20" height="h-6" variant="text" />
            <LoadingSkeleton width="w-16" height="h-6" variant="text" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
            <LoadingSkeleton width="w-24" height="h-4" />
            <LoadingSkeleton width="w-20" height="h-4" />
            <LoadingSkeleton width="w-28" height="h-4" />
            <LoadingSkeleton width="w-24" height="h-4" />
          </div>
        </div>
        <div className="text-right">
          <LoadingSkeleton width="w-20" height="h-4" className="mb-1" />
          <LoadingSkeleton width="w-24" height="h-4" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <LoadingSkeleton width="w-24" height="h-4" className="mb-2" />
          <LoadingSkeleton width="w-16" height="h-8" />
        </div>
        <LoadingSkeleton width="w-12" height="h-12" variant="circular" />
      </div>
    </div>
  );
}