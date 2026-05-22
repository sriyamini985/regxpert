import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { BatchOperation } from '../types';

interface BatchHistoryProps {
  batches: BatchOperation[];
  onDownload: (batchId: string) => void;
}

const BatchHistory = ({ batches, onDownload }: BatchHistoryProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Icon name="CheckCircle2" size={16} className="text-success" />;
      case 'processing':
        return <Icon name="Loader2" size={16} className="text-primary animate-spin" />;
      case 'failed':
        return <Icon name="XCircle" size={16} className="text-error" />;
      default:
        return <Icon name="Clock" size={16} className="text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'processing':
        return 'text-primary';
      case 'failed':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  if (batches.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <Icon name="History" size={20} className="text-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Batch History</h2>
          <p className="text-sm text-muted-foreground">Recent QR code generation batches</p>
        </div>
      </div>

      <div className="space-y-3">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted transition-colors duration-150"
          >
            <div className="flex-shrink-0">{getStatusIcon(batch.status)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-foreground">Batch #{batch.id}</p>
                <span className={`text-xs font-medium ${getStatusColor(batch.status)}`}>
                  {getStatusText(batch.status)}
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
            {batch.status === 'completed' && batch.downloadUrl && (
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                onClick={() => onDownload(batch.id)}
              >
                Download
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BatchHistory;