import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const location = useLocation();

  const navigationItems = [
    { label: 'Dashboard', path: '/admin-dashboard', icon: 'LayoutDashboard' },
    { label: 'Check-In', path: '/check-in-station', icon: 'ScanLine' },
    { label: 'Participants', path: '/participant-management', icon: 'Users' },
    { label: 'QR Codes', path: '/qr-code-generator', icon: 'QrCode' },
    { label: 'Food Counter', path: '/food-counter', icon: 'Utensils' },
    { label: 'Registration', path: '/event-registration', icon: 'ClipboardList' },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-foreground/20 z-[1150] lg:hidden animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-card border-r border-border z-[1200] lg:hidden animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <img
              src="/assets/images/regiverse-logo-new.png"
              alt="RegXperts"
              className="h-10 w-auto object-contain"
            />
          </div>
          <button
            onClick={onClose}
            className="min-w-touch min-h-touch flex items-center justify-center -mr-2 text-muted-foreground hover:text-foreground transition-colors duration-150"
            aria-label="Close menu"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1" aria-label="Mobile navigation">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-150 min-h-touch ${isActivePath(item.path)
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default MobileMenu;