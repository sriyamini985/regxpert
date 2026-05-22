import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const Breadcrumb = () => {
  const location = useLocation();

  const routeLabels: Record<string, string> = {
    '/admin-dashboard': 'Dashboard',
    '/check-in-station': 'Check-In Station',
    '/participant-management': 'Participant Management',
    '/qr-code-generator': 'QR Code Generator',
    '/event-registration': 'Event Registration',
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (location.pathname !== '/admin-dashboard') {
      breadcrumbs.push({ label: 'Dashboard', path: '/admin-dashboard' });
    }

    const currentPath = `/${pathSegments.join('/')}`;
    const currentLabel = routeLabels[currentPath];

    if (currentLabel && currentPath !== '/admin-dashboard') {
      breadcrumbs.push({ label: currentLabel, path: currentPath });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div key={crumb.path} className="flex items-center gap-2">
            {index > 0 && (
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            )}
            {isLast ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className="text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;