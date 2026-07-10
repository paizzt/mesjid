import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  subtext: string;
  icon: LucideIcon;
  colorClass: string;
  formatValue?: (value: number) => string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  colorClass,
  formatValue = (val) => val.toLocaleString('id-ID'),
}) => {
  return (
    <div className={`${colorClass} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm opacity-90 mb-1">{title}</p>
          <p className="text-3xl font-bold mb-1">{formatValue(value)}</p>
          <p className="text-xs opacity-75">{subtext}</p>
        </div>
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
