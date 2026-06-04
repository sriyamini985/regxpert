import React, { useRef, useState } from 'react';
import Icon from 'components/AppIcon';
import Button from '../../../../components/ui/Button';
import { QRCodeModalProps } from '../types';
import { sendQRCodeEmail, isEmailConfigured } from '../../../../services/emailService';

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, registrationData }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  if (!isOpen || !registrationData) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = registrationData.qrCode;
    link.download = `qr-code-${registrationData.registrationId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEmailQR = async () => {
    // Check if email is configured
    if (!isEmailConfigured()) {
      setEmailStatus({
        type: 'error',
        message: 'Email service not configured. Please set up EmailJS credentials.',
      });
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus({ type: null, message: '' });

    try {
      const result = await sendQRCodeEmail({
        recipientEmail: registrationData.participantEmail,
        recipientName: registrationData.participantName,
        eventTitle: registrationData.eventTitle,
        registrationId: registrationData.registrationId,
        qrCodeDataUrl: registrationData.qrCode,
      });

      if (result.success) {
        setEmailStatus({ type: 'success', message: result.message });
      } else {
        setEmailStatus({ type: 'error', message: result.message });
      }
    } catch (error) {
      setEmailStatus({ type: 'error', message: 'Failed to send email. Please try again.' });
    }

    setIsSendingEmail(false);
  };

  const handleAddToCalendar = () => {
    // Create .ics file content
    const eventDate = new Date(registrationData.eventDate);
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatICSDate(eventDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${registrationData.eventTitle}
DESCRIPTION:Registration ID: ${registrationData.registrationId}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${registrationData.eventTitle.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-foreground/50 z-[2000] animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Icon name="CheckCircle" size={24} className="text-success" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Registration Successful!</h2>
                <p className="text-sm text-muted-foreground">ID: {registrationData.registrationId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="min-w-touch min-h-touch flex items-center justify-center -mr-2 text-muted-foreground hover:text-foreground transition-colors duration-150"
              aria-label="Close modal"
            >
              <Icon name="X" size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-foreground">
                Welcome, <span className="font-semibold">{registrationData.participantName}</span>!
              </p>
              <p className="text-sm text-muted-foreground">
                You're registered for {registrationData.eventTitle}
              </p>
            </div>

            <div className="flex justify-center" ref={qrCodeRef}>
              <div className="p-6 bg-white rounded-lg border-2 border-border">
                <img
                  src={registrationData.qrCode}
                  alt={`QR code for ${registrationData.participantName} registration to ${registrationData.eventTitle}`}
                  className="w-64 h-64"
                />
              </div>
            </div>

            {/* Email Status Message */}
            {emailStatus.type && (
              <div
                className={`p-3 rounded-lg flex items-center gap-2 ${emailStatus.type === 'success'
                    ? 'bg-success/10 border border-success text-success'
                    : 'bg-error/10 border border-error text-error'
                  }`}
              >
                <Icon
                  name={emailStatus.type === 'success' ? 'CheckCircle' : 'AlertCircle'}
                  size={18}
                />
                <p className="text-sm">{emailStatus.message}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                variant="default"
                size="lg"
                fullWidth
                iconName="Download"
                iconPosition="left"
                onClick={handleDownload}
              >
                Download QR Code
              </Button>

              <Button
                variant="outline"
                size="lg"
                fullWidth
                iconName="Mail"
                iconPosition="left"
                onClick={handleEmailQR}
                disabled={isSendingEmail}
              >
                {isSendingEmail ? 'Sending...' : 'Email QR Code'}
              </Button>

              <Button
                variant="outline"
                size="lg"
                fullWidth
                iconName="Calendar"
                iconPosition="left"
                onClick={handleAddToCalendar}
              >
                Add to Calendar
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-primary mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Next Steps:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Save or print your QR code</li>
                    <li>Bring it to the event for quick check-in</li>
                    <li>Check your email for confirmation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-success/10 border border-success rounded-lg">
              <Icon name="Shield" size={18} className="text-success" />
              <p className="text-sm text-success">
                Your registration is confirmed and secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QRCodeModal;