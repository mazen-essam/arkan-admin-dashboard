
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className
}) => {
  return (
    <div className={cn(
      "bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200",
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={cn(
              "text-sm mt-2 flex items-center",
              changeType === 'positive' && "text-green-600",
              changeType === 'negative' && "text-red-600",
              changeType === 'neutral' && "text-gray-500"
            )}>
              {change}
            </p>
          )}
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <Icon size={24} className="text-blue-600" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
