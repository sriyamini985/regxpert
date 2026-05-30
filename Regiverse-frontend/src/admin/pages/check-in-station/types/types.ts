export type Participant = {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "pending" | "attended";
};

export type RecentCheckIn = {
  id: string;
  participantId: string;
  participantName: string;
  timestamp: Date;
  canUndo?: boolean;
};

export type CheckInStats = {
  total: number;
  checkedIn: number;
  pending: number;
  recentRate: number;
};

export type CheckInResult = {
  success: boolean;
  message: string;
  participant?: Participant;
};