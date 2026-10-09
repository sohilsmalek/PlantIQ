import React from 'react';

interface BadgeProps {
  variant?: 'critical' | 'warning' | 'healthy' | 'info' | 'neutral' | 'purple';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
  size = 'sm'
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  let colorClasses = 'bg-gray-100 text-gray-700 border-gray-200';
  switch (variant) {
    case 'critical':
      colorClasses = 'bg-red-50 text-[#E5484D] border-red-200 font-medium';
      break;
    case 'warning':
      colorClasses = 'bg-amber-50 text-[#D97706] border-amber-200 font-medium';
      break;
    case 'healthy':
      colorClasses = 'bg-emerald-50 text-[#20A36B] border-emerald-200 font-medium';
      break;
    case 'info':
      colorClasses = 'bg-blue-50 text-[#1677F2] border-blue-200 font-medium';
      break;
    case 'purple':
      colorClasses = 'bg-purple-50 text-purple-700 border-purple-200 font-medium';
      break;
    default:
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border font-mono tracking-tight transition-colors ${sizeClasses} ${colorClasses} ${className}`}
    >
      {children}
    </span>
  );
};
