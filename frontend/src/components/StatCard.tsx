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
    <div className={`${colorClass} rounded-2xl shadow-sm p-6 text-white transition-all duration-300 hover:shadow-md hover:-translate-y-1`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-90 mb-2">{title}</p>
          <p className="text-3xl font-bold tracking-tight mb-2">{formatValue(value)}</p>
          <p className="text-xs font-medium opacity-80">{subtext}</p>
        </div>
        <div className="p-3 bg-white/10 rounded-xl">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
