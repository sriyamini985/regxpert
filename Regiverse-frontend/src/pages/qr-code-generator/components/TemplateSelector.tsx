import Icon from '../../../components/AppIcon';
import { QRCodeTemplate } from '../types';

interface TemplateSelectorProps {
  templates: QRCodeTemplate[];
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
}

const TemplateSelector = ({ templates, selectedTemplate, onTemplateChange }: TemplateSelectorProps) => {
  const getLayoutIcon = (layout: string) => {
    switch (layout) {
      case 'standard':
        return 'Square';
      case 'badge':
        return 'IdCard';
      case 'ticket':
        return 'Ticket';
      default:
        return 'Square';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon name="Layout" size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Template Selection</h2>
          <p className="text-sm text-muted-foreground">Choose a design template for your QR codes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateChange(template.id)}
            className={`group relative p-4 rounded-lg border-2 transition-all duration-150 text-left ${
              selectedTemplate === template.id
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted'
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedTemplate === template.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}
              >
                <Icon name={getLayoutIcon(template.layout)} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {template.includePhoto && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-background text-xs font-medium text-foreground">
                  <Icon name="Image" size={12} />
                  Photo
                </span>
              )}
              {template.includeLogo && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-background text-xs font-medium text-foreground">
                  <Icon name="Sparkles" size={12} />
                  Logo
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-background text-xs font-medium text-foreground capitalize">
                <Icon name="Layout" size={12} />
                {template.layout}
              </span>
            </div>

            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Icon name="Check" size={14} className="text-primary-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;