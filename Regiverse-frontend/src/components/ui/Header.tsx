import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

interface HeaderProps {
  onMenuToggle?: () => void;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

const Header = ({ onMenuToggle, userName = 'User', userRole = 'Administrator', onLogout }: HeaderProps) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { label: 'Dashboard', path: '/admin-dashboard', icon: 'LayoutDashboard' },
    { label: 'Check-In', path: '/check-in-station', icon: 'ScanLine' },
    { label: 'Participants', path: '/participant-management', icon: 'Users' },
    { label: 'QR Codes', path: '/qr-code-generator', icon: 'QrCode' },
    { label: 'Registration', path: '/event-registration', icon: 'ClipboardList' },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    onLogout?.();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-card border-b border-border">
      <div className="flex items-center h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden min-w-touch min-h-touch flex items-center justify-center -ml-2 text-foreground hover:text-primary transition-colors duration-150"
            aria-label="Toggle menu"
          >
            <Icon name="Menu" size={24} />
          </button>

          <Link to="/admin-dashboard" className="flex items-center gap-2 group">
            <img
              src="/assets/images/regiverse-logo-new.png"
              alt="RegXperts"
              className="h-10 md:h-14 w-auto transition-transform duration-200 group-hover:scale-105 object-contain"
            />
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-1 ml-8 flex-1" aria-label="Primary navigation">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 min-h-touch ${isActivePath(item.path)
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors duration-150 min-h-touch"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
            >
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-foreground">{userName}</span>
                <span className="text-xs text-muted-foreground">{userRole}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                {userName.charAt(0).toUpperCase()}
              </div>
              <Icon
                name="ChevronDown"
                size={16}
                className={`text-muted-foreground transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-[1050]"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-[1100] animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-border">
                    <p className="text-sm font-medium text-popover-foreground">{userName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{userRole}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-150 min-h-touch"
                    >
                      <Icon name="LogOut" size={18} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;