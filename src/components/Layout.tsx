import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FileSearch, 
  Filter, 
  LogOut,
  Menu
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItems = () => (
    <>
      <Link
        to="/"
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          location.pathname === '/' 
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
      >
        <Home size={20} />
        Dashboard
      </Link>
      <Link
        to="/file-sensing"
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          location.pathname === '/file-sensing'
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
      >
        <FileSearch size={20} />
        File Sensing Jobs
      </Link>
      <Link
        to="/filtering"
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          location.pathname === '/filtering'
            ? 'bg-primary text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
      >
        <Filter size={20} />
        Character Filtering Jobs
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-card border-r">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h1 className="text-xl font-semibold">Job Manager</h1>
            <p className="text-sm text-muted-foreground mt-1">{user?.name}</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <NavItems />
          </nav>
          
          <div className="p-4 border-t">
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
              <LogOut size={20} className="mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Job Manager</h1>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <h1 className="text-xl font-semibold">Job Manager</h1>
                    <p className="text-sm text-muted-foreground mt-1">{user?.name}</p>
                  </div>
                  
                  <nav className="flex-1 p-4 space-y-2">
                    <NavItems />
                  </nav>
                  
                  <div className="p-4 border-t">
                    <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
                      <LogOut size={20} className="mr-3" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;