import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { RegistrationFormProps, RegistrationFormData } from '../types';

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit, isSubmitting, errors }) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    dietaryPreferences: 'none',
    specialRequirements: ''
  });

  const [isDuplicateWarning, setIsDuplicateWarning] = useState(false);

  const dietaryOptions = [
    { value: 'none', label: 'No Restrictions' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten-free', label: 'Gluten Free' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Kosher' },
    { value: 'other', label: 'Other (Specify in Special Requirements)' }
  ];

  const handleInputChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'email' && value.includes('duplicate@example.com')) {
      setIsDuplicateWarning(true);
    } else if (field === 'email') {
      setIsDuplicateWarning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Register for Event</h2>
        <p className="text-muted-foreground">
          Fill in your details to receive your QR code for seamless check-in
        </p>
      </div>

      {isDuplicateWarning && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning rounded-lg flex items-start gap-3">
          <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
          <div>
            <p className="font-medium text-warning">Duplicate Email Detected</p>
            <p className="text-sm text-muted-foreground mt-1">
              This email is already registered. Please use a different email or contact support.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            error={errors.firstName}
            required
          />

          <Input
            label="Last Name"
            type="text"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            error={errors.lastName}
            required
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="your.email@example.com"
          description="We'll send your QR code to this email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          error={errors.phone}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company"
            type="text"
            placeholder="Your company name"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            error={errors.company}
            required
          />

          <Input
            label="Job Title"
            type="text"
            placeholder="Your role"
            value={formData.jobTitle}
            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            error={errors.jobTitle}
            required
          />
        </div>

        <Select
          label="Dietary Preferences"
          options={dietaryOptions}
          value={formData.dietaryPreferences}
          onChange={(value) => handleInputChange('dietaryPreferences', value as string)}
          placeholder="Select dietary preference"
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Special Requirements
          </label>
          <textarea
            className="w-full px-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-150 resize-none"
            rows={4}
            placeholder="Any accessibility needs or special requirements..."
            value={formData.specialRequirements}
            onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
          />
        </div>

        <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
          <Icon name="Lock" size={20} className="text-primary mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Secure Processing</p>
            <p>Your information is encrypted and processed securely. We comply with GDPR and data protection regulations.</p>
          </div>
        </div>

        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isSubmitting}
          iconName="UserPlus"
          iconPosition="left"
        >
          {isSubmitting ? 'Processing Registration...' : 'Complete Registration'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
    </div>
  );
};

export default RegistrationForm;