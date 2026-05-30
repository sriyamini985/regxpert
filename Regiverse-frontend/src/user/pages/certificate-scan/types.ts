export interface Participant {
  id: string;
  name: string;
  regId: string;
  email: string;
  category: string;
  certificate?: {
    issued: boolean;
    time?: string;
    session?: string;
  };
}