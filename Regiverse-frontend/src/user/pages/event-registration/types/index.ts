export interface EventDetails {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  capacity: number;
  registered: number;
  category: string;
  organizer: string;
  image: string;
  alt: string;
}

export interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  dietaryPreferences: string;
  specialRequirements: string;
}

export interface RegistrationResponse {
  registrationId: string;
  qrCode: string;
  participantName: string;
  participantEmail: string;
  eventTitle: string;
  eventDate: string;
}

export interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
}

export interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrationData: RegistrationResponse | null;
}

export interface EventInfoCardProps {
  event: EventDetails;
  isExpanded: boolean;
  onToggle: () => void;
}

export interface RegistrationFormProps {
  onSubmit: (data: RegistrationFormData) => void;
  isSubmitting: boolean;
  errors: FormErrors;
}

export interface ProgressBarProps {
  current: number;
  total: number;
  label: string;
}