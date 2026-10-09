import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  subTextColor?: string;
  icon: LucideIcon;
  variant?: 'critical' | 'warning' | 'healthy' | 'info' | 'primary';
  badgeText?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subValue,
  subTextColor = 'text-[#718198]',
  icon: Icon,
  variant = 'primary',
  badgeText,
  onClick
}) => {
  let accentColor = 'bg-[#1677F2]';
  let iconBg = 'bg-blue-50 text-[#1677F2]';
  let borderHighlight = 'border-slate-200';

  if (variant === 'critical') {
    accentColor = 'bg-[#E5484D]';
    iconBg = 'bg-red-50 text-[#E5484D]';
    borderHighlight = 'hover:border-red-300';
  } else if (variant === 'warning') {
    accentColor = 'bg-[#E9A23B]';
    iconBg = 'bg-amber-50 text-[#D97706]';
    borderHighlight = 'hover:border-amber-300';
  } else if (variant === 'healthy') {
    accentColor = 'bg-[#20A36B]';
    iconBg = 'bg-emerald-50 text-[#20A36B]';
    borderHighlight = 'hover:border-emerald-300';
  } else if (variant === 'info') {
    accentColor = 'bg-[#20A4D8]';
    iconBg = 'bg-cyan-50 text-[#20A4D8]';
    borderHighlight = 'hover:border-cyan-300';
  }

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-lg border border-slate-200/80 bg-white p-4 shadow-xs transition-all duration-150 ${borderHighlight} ${
        onClick ? 'cursor-pointer hover:shadow-sm' : ''
      }`}
    >
      {/* Accent top stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor}`} />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide uppercase text-[#718198]">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-[#172B4D]">{value}</span>
            {badgeText && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                {badgeText}
              </span>
            )}
          </div>
          {subValue && (
            <p className={`text-xs font-medium leading-relaxed ${subTextColor}`}>
              {subValue}
            </p>
          )}
        </div>

        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
