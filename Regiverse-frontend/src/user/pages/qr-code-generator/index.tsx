import { useState, useEffect } from 'react';
import Breadcrumb from '../../components/ui/Breadcrumb';
import LoadingBar from '../../components/ui/LoadingBar';
import Icon from '../../components/AppIcon';

import GenerationOptions from './components/GenerationOptions';
import ProgressTracker from './components/ProgressTracker';
import QRCodePreview from './components/QRCodePreview';
import ParticipantSelector from './components/ParticipantSelector';
import TemplateSelector from './components/TemplateSelector';
import BatchHistory from './components/BatchHistory';
import {
  Participant,
  QRCodeTemplate,
  GenerationOptions as GenerationOptionsType,
  GenerationProgress,
  GeneratedQRCode,
  BatchOperation,
} from './types';
import { subscribeToParticipants } from '../../services/participantService';

const mockTemplates: QRCodeTemplate[] = [
  {
    id: 'template-1',
    name: 'Standard QR Code',
    description: 'Simple QR code with participant information below',
    layout: 'standard',
    includePhoto: false,
    includeLogo: true,
  },
  {
    id: 'template-2',
    name: 'Event Badge',
    description: 'Professional badge layout with photo and QR code',
    layout: 'badge',
    includePhoto: true,
    includeLogo: true,
  },
  {
    id: 'template-3',
    name: 'Entry Ticket',
    description: 'Ticket-style design with QR code and event details',
    layout: 'ticket',
    includePhoto: false,
    includeLogo: true,
  },
];

// Batch history - will be populated from API
const mockBatches: BatchOperation[] = [];

const QRCodeGenerator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('template-1');
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedQRCode[]>([]);
  const [progress, setProgress] = useState<GenerationProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    percentage: 0,
    status: 'idle',
    estimatedTimeRemaining: 0,
  });

  // Subscribe to participants from Firebase
  useEffect(() => {
    document.title = 'QR Code Generator - RegXpert';

    const unsubscribe = subscribeToParticipants((firebaseParticipants) => {
      const mappedParticipants: Participant[] = firebaseParticipants.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        company: p.company || '',
        status: p.status,
        registrationDate: p.registrationDate instanceof Date
          ? p.registrationDate.toISOString()
          : new Date().toISOString(),
        qrCode: p.qrCode,
      }));
      setParticipants(mappedParticipants);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGenerate = (options: GenerationOptionsType) => {
    if (selectedParticipants.length === 0) {
      alert('Please select at least one participant to generate QR codes.');
      return;
    }

    // Get the selected template to determine layout type
    const template = mockTemplates.find((t) => t.id === selectedTemplate);
    const templateLayout = template?.layout || 'standard';

    setIsLoading(true);
    setProgress({
      total: selectedParticipants.length,
      completed: 0,
      failed: 0,
      percentage: 0,
      status: 'generating',
      estimatedTimeRemaining: selectedParticipants.length * 2,
    });

    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextCompleted = Math.min(prev.completed + 1, prev.total);
        const nextPercentage = Math.round((nextCompleted / prev.total) * 100);
        const nextEta = Math.max(0, (prev.total - nextCompleted) * 2);

        if (nextCompleted === prev.total) {
          clearInterval(interval);
          setIsLoading(false);

          const codes: GeneratedQRCode[] = selectedParticipants.map((participantId) => {
            const participant = participants.find((p) => p.id === participantId);

            // Create QR data based on template layout
            let qrData = '';
            switch (templateLayout) {
              case 'badge':
                // Event Badge: Include full participant info with photo flag
                qrData = encodeURIComponent(JSON.stringify({
                  type: 'badge',
                  id: participantId,
                  name: participant?.name,
                  email: participant?.email,
                  company: participant?.company,
                  includePhoto: template?.includePhoto,
                  includeLogo: template?.includeLogo,
                }));
                break;
              case 'ticket':
                // Entry Ticket: Include ticket-specific data
                qrData = encodeURIComponent(JSON.stringify({
                  type: 'ticket',
                  id: participantId,
                  name: participant?.name,
                  company: participant?.company,
                  ticketId: `TKT-${participantId}`,
                  includeLogo: template?.includeLogo,
                }));
                break;
              case 'standard':
              default:
                // Standard QR Code: Simple participant ID only
                qrData = participantId;
                break;
            }

            return {
              participantId,
              participantName: participant?.name || 'Unknown',
              qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=${options.size}x${options.size}&data=${qrData}`,
              timestamp: new Date().toISOString(),
              format: options.format,
              templateLayout,
            };
          });

          setGeneratedCodes(codes);

          return {
            ...prev,
            completed: nextCompleted,
            percentage: nextPercentage,
            status: 'completed',
            estimatedTimeRemaining: 0,
          };
        }

        return {
          ...prev,
          completed: nextCompleted,
          percentage: nextPercentage,
          estimatedTimeRemaining: nextEta,
        };
      });
    }, 500);
  };

  const handleDownloadSingle = (code: GeneratedQRCode) => {
    const link = document.createElement('a');
    link.href = code.qrCodeUrl;
    link.download = `qr-code-${code.participantId}.png`;
    link.click();
  };

  const handleDownloadAll = () => {
    if (generatedCodes.length === 0) return;

    const csvContent = [
      ['Participant ID', 'Participant Name', 'QR Code URL', 'Format', 'Generated At'],
      ...generatedCodes.map((code) => [
        code.participantId,
        code.participantName,
        code.qrCodeUrl,
        code.format,
        new Date(code.timestamp).toISOString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-codes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadBatch = (batchId: string) => {
    const batch = mockBatches.find((b) => b.id === batchId);
    if (!batch?.downloadUrl) {
      return;
    }

    const link = document.createElement('a');
    link.href = batch.downloadUrl;
    link.download = `qr-batch-${batchId}.zip`;
    link.click();
  };

  return (
    <div className="page-bg">

      <LoadingBar isLoading={isLoading} />

      <main className="page-header w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Breadcrumb />
            <div className="mt-2">
              <h1 className="text-fluid-3xl font-bold text-gray-900 tracking-tight">QR Code Generator</h1>
              <p className="text-gray-500 mt-1">
                Generate and download QR codes for event check-ins
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="section-card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>
                <GenerationOptions
                  selectedTemplateId={selectedTemplate}
                  templates={mockTemplates}
                  onGenerate={handleGenerate}
                  isGenerating={progress.status === 'generating'}
                />
              </div>

              <div className="section-card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Participants</h2>
                <ParticipantSelector
                  participants={participants}
                  selectedParticipants={selectedParticipants}
                  onSelectionChange={setSelectedParticipants}
                />
              </div>
            </div>

            <div>
              <div className="section-card p-6 flex flex-col items-center justify-center min-h-[400px]">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 w-full">Preview</h2>

                <div
                  id="qr-code-container"
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex items-center justify-center min-h-[200px]"
                >
                  {/* Live Preview */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                          selectedTemplate === 'badge' ? JSON.stringify({
                            type: 'badge',
                            id: 'preview-123',
                            name: 'John Doe',
                            company: 'Tech Corp',
                            includePhoto: mockTemplates.find(t => t.id === selectedTemplate)?.includePhoto
                          }) :
                            selectedTemplate === 'ticket' ? JSON.stringify({
                              type: 'ticket',
                              id: 'preview-123',
                              name: 'John Doe',
                              ticketId: 'TKT-PREVIEW'
                            }) : 'preview-123'
                        )}`}
                        alt="QR Code Preview"
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-600">
                      {mockTemplates.find(t => t.id === selectedTemplate)?.name} Preview
                    </p>
                  </div>
                </div>
              </div>

              {progress.status !== 'idle' && (
                <ProgressTracker progress={progress} />
              )}

              {generatedCodes.length > 0 && (
                <QRCodePreview
                  codes={generatedCodes}
                  onDownloadSingle={handleDownloadSingle}
                  onDownloadAll={handleDownloadAll}
                />
              )}
            </div>

            <div className="space-y-6">


              <BatchHistory batches={mockBatches} onDownload={handleDownloadBatch} />
            </div>
          </div>
        </div>
      </main >
    </div >
  );
};

export default QRCodeGenerator;