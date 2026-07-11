import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
import { BatchOperation } from '../types';

interface BatchHistoryProps {
  batches: BatchOperation[];
  onDownload: (batchId: string) => void;
}

// Centralized configuration map for statuses
const STATUS_CONFIG = {
  completed: {
    text: 'Completed',
    color: 'text-success',
    icon: 'CheckCircle2',
    iconClass: 'text-success',
  },
  processing: {
    text: 'Processing',
    color: 'text-primary',
    icon: 'Loader2',
    iconClass: 'text-primary animate-spin',
  },
  failed: {
    text: 'Failed',
    color: 'text-error',
    icon: 'XCircle',
    iconClass: 'text-error',
  },
} as const;

// Fallback metadata for default/pending state
const DEFAULT_STATUS = {
  text: 'Pending',
  color: 'text-muted-foreground',
  icon: 'Clock',
  iconClass: 'text-muted-foreground',
} as const;

const BatchHistory = ({ batches, onDownload }: BatchHistoryProps) => {
  if (batches.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <Icon name="History" size={20} className="text-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Batch History</h2>
          <p className="text-sm text-muted-foreground">Recent QR code generation batches</p>
        </div>
      </div>

      {/* Batches List */}
      <div className="space-y-3">
        {batches.map((batch) => {
          // Fetch specific layout config based on batch status safely
          const status = STATUS_CONFIG[batch.status as keyof typeof STATUS_CONFIG] || DEFAULT_STATUS;

          return (
            <div
              key={batch.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted transition-colors duration-150"
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                <Icon name={status.icon} size={16} className={status.iconClass} />
              </div>

              {/* Batch Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground">Batch #{batch.id}</p>
                  <span className={`text-xs font-medium ${status.color}`}>
                    {status.text}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="QrCode" size={14} />
                    {batch.totalCodes} codes
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="Calendar" size={14} />
                    {new Date(batch.timestamp).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="Clock" size={14} />
                    {new Date(batch.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Download Action */}
              {batch.status === 'completed' && batch.downloadUrl && (
                <Button
                  onClick={() => onDownload(batch.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-border rounded-md hover:bg-muted text-foreground transition-colors duration-150"
                >
                  <Icon name="Download" size={14} />
                  Download
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BatchHistory;