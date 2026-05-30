import { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { GenerationProgress } from '../types';

interface ProgressTrackerProps {
  progress: GenerationProgress;
}

const ProgressTracker = ({ progress }: ProgressTrackerProps) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(progress.percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress.percentage]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'generating':
        return <Icon name="Loader2" size={20} className="text-primary animate-spin" />;
      case 'completed':
        return <Icon name="CheckCircle2" size={20} className="text-success" />;
      case 'error':
        return <Icon name="XCircle" size={20} className="text-error" />;
      default:
        return <Icon name="Clock" size={20} className="text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'generating':
        return 'Generating QR Codes...';
      case 'completed':
        return 'Generation Complete';
      case 'error':
        return 'Generation Failed';
      default:
        return 'Ready to Generate';
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'generating':
        return 'text-primary';
      case 'completed':
        return 'text-success';
      case 'error':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  if (progress.status === 'idle') {
    return null;
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className={`font-semibold ${getStatusColor()}`}>{getStatusText()}</h3>
            <p className="text-sm text-muted-foreground">
              {progress.completed} of {progress.total} codes generated
            </p>
          </div>
        </div>
        {progress.status === 'generating' && (
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{Math.round(progress.percentage)}%</p>
            <p className="text-xs text-muted-foreground">
              ~{formatTime(progress.estimatedTimeRemaining)} remaining
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ease-out ${
              progress.status === 'completed'
                ? 'bg-success'
                : progress.status === 'error' ?'bg-error' :'bg-primary'
            }`}
            style={{ width: `${animatedPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            <Icon name="CheckCircle2" size={14} className="inline mr-1 text-success" />
            {progress.completed} completed
          </span>
          {progress.failed > 0 && (
            <span>
              <Icon name="XCircle" size={14} className="inline mr-1 text-error" />
              {progress.failed} failed
            </span>
          )}
          <span>
            <Icon name="Clock" size={14} className="inline mr-1" />
            {progress.total - progress.completed - progress.failed} pending
          </span>
        </div>
      </div>

      {progress.status === 'error' && (
        <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-md">
          <Icon name="AlertTriangle" size={16} className="text-error mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-error">Generation Error</p>
            <p className="text-xs text-error/80 mt-1">
              Some QR codes failed to generate. Please check participant data and try again.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;