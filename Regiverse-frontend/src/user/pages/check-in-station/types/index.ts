export interface Participant {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'attended' | 'absent' | 'pending';
  checkInTime: Date | null;
  registrationDate: Date;
  avatar: string;
  alt: string;
  qrCode: string;
  foodAccessStatus?: 'pending' | 'collected';
}

export interface CheckInResult {
  success: boolean;
  message: string;
  participant?: {
    id: string;
    name: string;
    email: string;
    company: string;
  };
}

export interface ScannerState {
  isScanning: boolean;
  hasPermission: boolean;
  error: string | null;
}

export interface CheckInStats {
  total: number;
  checkedIn: number;
  pending: number;
  recentRate: number;
}

export interface RecentCheckIn {
  id: string;
  participantId: string;
  participantName: string;
  timestamp: Date;
  canUndo: boolean;
}