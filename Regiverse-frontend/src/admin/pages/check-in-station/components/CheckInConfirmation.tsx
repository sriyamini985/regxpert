import Icon from 'components/AppIcon';
import Image from '../../../../components/AppImage';
import Button from '../../../../components/ui/Button';
import type { CheckInResult } from '../types';

interface CheckInConfirmationProps {
  result: CheckInResult | null;
  onClose: () => void;
}

const CheckInConfirmation = ({ result, onClose }: CheckInConfirmationProps) => {
  if (!result) return null;

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card rounded-lg border border-border shadow-lg max-w-md w-full animate-in slide-in-from-bottom-4 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            {result.success ? (
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                <Icon name="CheckCircle2" size={40} className="text-success" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
                <Icon name="XCircle" size={40} className="text-error" />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-center text-foreground mb-2">
            {result.success ? 'Check-In Successful!' : 'Check-In Failed'}
          </h2>

          <p className="text-center text-muted-foreground mb-6">{result.message}</p>

          {result.success && result.participant && (
            <div className="bg-muted rounded-lg p-4 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <span className="text-2xl font-semibold text-primary">
                    {result.participant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{result.participant.name}</h3>
                  <p className="text-sm text-muted-foreground">{result.participant.company}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Participant ID</span>
                  <span className="font-medium text-foreground">{result.participant.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Check-In Time</span>
                  <span className="font-medium text-foreground">{formatTime(new Date())}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                    <Icon name="CheckCircle2" size={12} />
                    Checked In
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button variant="default" onClick={onClose} fullWidth iconName="Check">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckInConfirmation;

