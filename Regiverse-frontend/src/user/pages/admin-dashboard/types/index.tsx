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

export interface EventStats {
  totalParticipants: number;
  checkedIn: number;
  pending: number;
  capacity: number;
  checkInRate: number;
  foodServed: number;
}

export interface RecentActivity {
  id: string;
  type: 'check-in' | 'registration';
  participantName: string;
  timestamp: Date;
  avatar: string;
  alt: string;
}

export interface Event {
  id: string;
  name: string;
  date: Date;
  location: string;
  capacity: number;
}

export interface DashboardFilters {
  searchQuery: string;
  statusFilter: 'all' | 'attended' | 'absent' | 'pending';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}