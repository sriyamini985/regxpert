import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';

const Header = () => {
  const { userRole, logout } = useAuth();

  return (
    <header className="bg-card border-b border-border p-4 flex justify-between items-center">
      <img src="/assets/images/regiverse-logo-new.png" alt="RegXperts" className="h-10 md:h-14 w-auto object-contain" />
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground">Role: {userRole}</span>
        <Button onClick={logout} variant="outline">Logout</Button>
      </div>
    </header>
  );
};

export default Header;
