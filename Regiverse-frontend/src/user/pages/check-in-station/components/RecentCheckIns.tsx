import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';
import type { RecentCheckIn } from '../types';

interface RecentCheckInsProps {
  checkIns: RecentCheckIn[];
  onUndo: (checkInId: string, participantId: string) => void;
}

const RecentCheckIns = ({ checkIns, onUndo }: RecentCheckInsProps) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Icon name="History" size={20} className="text-success" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent Check-Ins</h2>
            <p className="text-sm text-muted-foreground">Last {checkIns.length} check-ins</p>
          </div>
        </div>
      </div>

      {checkIns.length === 0 ? (
        <div className="bg-muted rounded-lg p-8 text-center">
          <Icon name="Clock" size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No recent check-ins</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {checkIns.map((checkIn) => (
            <div
              key={checkIn.id}
              className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors duration-150"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="CheckCircle2" size={20} className="text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{checkIn.participantName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatTime(checkIn.timestamp)}</span>
                    <span>•</span>
                    <span>{getTimeAgo(checkIn.timestamp)}</span>
                  </div>
                </div>
              </div>
              {checkIn.canUndo && (
                <Button
                  onClick={() => onUndo(checkIn.id, checkIn.participantId)}
                  iconName="Undo2"
                  className="flex-shrink-0"
                >
                  Undo
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentCheckIns;