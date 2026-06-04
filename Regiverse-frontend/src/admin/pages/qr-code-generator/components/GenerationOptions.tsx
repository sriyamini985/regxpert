import { useState, useEffect } from 'react';
import Select from '../../../../components/ui/Select';

import { Checkbox } from '../../../../components/ui/Checkbox';
import Button from '../../../../components/ui/Button';
import Icon from 'components/AppIcon';
import { GenerationOptions as GenerationOptionsType, QRCodeTemplate } from '../types';

interface GenerationOptionsProps {
  templates: QRCodeTemplate[];
  selectedTemplateId: string;
  onGenerate: (options: GenerationOptionsType) => void;
  isGenerating: boolean;
}

const GenerationOptions = ({ templates, selectedTemplateId, onGenerate, isGenerating }: GenerationOptionsProps) => {
  const [options, setOptions] = useState<GenerationOptionsType>({
    format: 'png',
    size: 300,
    includeParticipantInfo: true,
    templateId: selectedTemplateId || templates[0]?.id || '',
    batchSize: 50
  });

  // Sync templateId with parent's selectedTemplateId when it changes
  useEffect(() => {
    if (selectedTemplateId && selectedTemplateId !== options.templateId) {
      setOptions(prev => ({ ...prev, templateId: selectedTemplateId }));
    }
  }, [selectedTemplateId]);

  const formatOptions = [
    { value: 'png', label: 'PNG Image', description: 'Individual image files' },
    { value: 'pdf', label: 'PDF Document', description: 'Print-ready document' },
    { value: 'zip', label: 'ZIP Archive', description: 'Compressed collection' }
  ];

  const sizeOptions = [
    { value: 200, label: 'Small (200x200)' },
    { value: 300, label: 'Medium (300x300)' },
    { value: 500, label: 'Large (500x500)' },
    { value: 1000, label: 'Extra Large (1000x1000)' }
  ];

  const batchSizeOptions = [
    { value: 25, label: '25 codes per batch' },
    { value: 50, label: '50 codes per batch' },
    { value: 100, label: '100 codes per batch' },
    { value: 250, label: '250 codes per batch' }
  ];

  const templateOptions = templates.map(template => ({
    value: template.id,
    label: template.name,
    description: template.description
  }));

  const handleGenerate = () => {
    onGenerate(options);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon name="Settings" size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Generation Options</h2>
          <p className="text-sm text-muted-foreground">Configure QR code generation settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Output Format"
          description="Choose the export format for QR codes"
          options={formatOptions}
          value={options.format}
          onChange={(value) => setOptions({ ...options, format: value as 'png' | 'pdf' | 'zip' })}
          required
        />

        <Select
          label="QR Code Size"
          description="Select the dimensions for generated codes"
          options={sizeOptions}
          value={options.size}
          onChange={(value) => setOptions({ ...options, size: Number(value) })}
          required
        />

        <Select
          label="Template"
          description="Choose a design template"
          options={templateOptions}
          value={options.templateId}
          onChange={(value) => setOptions({ ...options, templateId: value as string })}
          required
        />

        <Select
          label="Batch Size"
          description="Number of codes to generate per batch"
          options={batchSizeOptions}
          value={options.batchSize}
          onChange={(value) => setOptions({ ...options, batchSize: Number(value) })}
          required
        />
      </div>

      <div className="pt-4 border-t border-border">
        <Checkbox
          label="Include Participant Information"
          description="Add participant name and details to QR code"
          checked={options.includeParticipantInfo}
          onChange={(e) => setOptions({ ...options, includeParticipantInfo: e.target.checked })}
        />
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button
          variant="default"
          size="lg"
          iconName="QrCode"
          iconPosition="left"
          onClick={handleGenerate}
          loading={isGenerating}
          disabled={isGenerating}
          className="flex-1 sm:flex-none"
        >
          Generate QR Codes
        </Button>
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="Info" size={16} />
          <span>Generation may take a few moments</span>
        </div>
      </div>
    </div>
  );
};

export default GenerationOptions;