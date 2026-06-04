import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Image from '../../../../components/AppImage';
import Icon from 'components/AppIcon';
import Button from '../../../../components/ui/Button';
import { GeneratedQRCode } from '../types';

interface QRCodePreviewProps {
  codes: GeneratedQRCode[];
  onDownloadSingle: (code: GeneratedQRCode) => void;
  onDownloadAll: () => void;
}

const QRCodePreview = ({ codes, onDownloadSingle, onDownloadAll }: QRCodePreviewProps) => {
  const [selectedCode, setSelectedCode] = useState<GeneratedQRCode | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle browser back button to close modal
  useEffect(() => {
    if (selectedCode && location.hash !== '#qr-preview') {
      setSelectedCode(null);
    }
  }, [location.hash, selectedCode]);

  const handleSelectCode = (code: GeneratedQRCode) => {
    setSelectedCode(code);
    navigate('#qr-preview');
  };

  const handleCloseModal = () => {
    navigate(-1);
  };

  if (codes.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Icon name="QrCode" size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No QR Codes Generated</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Configure your generation options and click "Generate QR Codes" to create codes for your participants.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Icon name="CheckCircle2" size={20} className="text-success" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Generated QR Codes</h2>
              <p className="text-sm text-muted-foreground">{codes.length} codes ready for download</p>
            </div>
          </div>
          <Button
            variant="default"
            iconName="Download"
            iconPosition="left"
            onClick={onDownloadAll}
          >
            Download All
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {codes.map((code) => (
            <div
              key={code.participantId}
              className="group relative bg-background rounded-lg border border-border p-4 hover:border-primary transition-all duration-150 cursor-pointer"
              onClick={() => handleSelectCode(code)}
            >
              <div className="aspect-square bg-white rounded-md mb-3 overflow-hidden flex items-center justify-center p-2">
                <Image
                  src={code.qrCodeUrl}
                  alt={`QR code for participant ${code.participantName} containing registration information`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground text-sm truncate">{code.participantName}</p>
                <p className="text-xs text-muted-foreground">ID: {code.participantId}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadSingle(code);
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-md bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                aria-label={`Download QR code for ${code.participantName}`}
              >
                <Icon name="Download" size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedCode && (
        <>
          <div
            className="fixed inset-0 bg-foreground/50 z-[1100] animate-in fade-in duration-200"
            onClick={handleCloseModal}
          />
          <div className="fixed inset-0 z-[1150] flex items-center justify-center p-4">
            <div className="bg-card rounded-lg border border-border shadow-lg max-w-md w-full animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">QR Code Details</h3>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center transition-colors duration-150"
                  aria-label="Close modal"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="aspect-square max-w-[200px] mx-auto bg-white rounded-lg border border-border p-4 flex items-center justify-center">
                  <Image
                    src={selectedCode.qrCodeUrl}
                    alt={`QR code for participant ${selectedCode.participantName} containing registration information`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Participant Name</p>
                    <p className="font-medium text-foreground">{selectedCode.participantName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Participant ID</p>
                    <p className="font-medium text-foreground">{selectedCode.participantId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Generated</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedCode.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Format</p>
                    <p className="font-medium text-foreground uppercase">{selectedCode.format}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 p-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  variant="default"
                  iconName="Download"
                  iconPosition="left"
                  onClick={() => {
                    onDownloadSingle(selectedCode);
                    handleCloseModal();
                  }}
                  className="flex-1"
                >
                  Download
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QRCodePreview;