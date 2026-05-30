export interface Participant {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  checkInStatus: "attended" | "pending" | "absent";
}

export interface FilterOptions {
  searchQuery: string;
  statusFilter: "all" | "attended" | "pending" | "absent";
  companyFilter: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface ParticipantStats {
  total: number;
  attended: number;
  pending: number;
  absent: number;
}