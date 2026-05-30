import { useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import type { CheckInStats } from '../types';

interface CheckInStatsProps {
  stats: CheckInStats;
}

const CheckInStatsComponent = ({ stats }: CheckInStatsProps) => {
  const checkInPercentage = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.checkedIn / stats.total) * 100);
  }, [stats.checkedIn, stats.total]);

  const statsCards = [
    {
      label: 'Total Registered',
      value: stats.total,
      icon: 'Users',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Checked In',
      value: stats.checkedIn,
      icon: 'CheckCircle2',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      label: 'Recent Rate',
      value: stats.recentRate,
      icon: 'TrendingUp',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Check-In Statistics</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
          <Icon name="TrendingUp" size={16} className="text-success" />
          <span className="text-sm font-medium text-foreground">{checkInPercentage}% Complete</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((card) => (
          <div key={card.label} className="section-card-elevated p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                <Icon name={card.icon} size={18} className={card.color} />
              </div>
              <span className={`text-xl sm:text-2xl font-bold ${card.color}`}>{card.value}</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4 mt-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Check-In Progress</span>
            <span className="text-sm text-muted-foreground">
              {stats.checkedIn} / {stats.total}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-success transition-all duration-500"
              style={{ width: `${checkInPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInStatsComponent;