export interface Participant {
  id: string;
  name: string;
  email: string;
  company: string;
  registrationDate: string;
  status: 'attended' | 'absent' | 'pending';
  qrCode?: string | null;
}

export interface QRCodeTemplate {
  id: string;
  name: string;
  description: string;
  layout: 'standard' | 'badge' | 'ticket';
  includePhoto: boolean;
  includeLogo: boolean;
}

export interface GenerationOptions {
  format: 'png' | 'pdf' | 'zip';
  size: number;
  includeParticipantInfo: boolean;
  templateId: string;
  batchSize: number;
}

export interface GenerationProgress {
  total: number;
  completed: number;
  failed: number;
  percentage: number;
  status: 'idle' | 'generating' | 'completed' | 'error';
  estimatedTimeRemaining: number;
}

export interface GeneratedQRCode {
  participantId: string;
  participantName: string;
  qrCodeUrl: string;
  timestamp: string;
  format: string;
  templateLayout?: 'standard' | 'badge' | 'ticket';
}

export interface BatchOperation {
  id: string;
  timestamp: string;
  totalCodes: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
}
