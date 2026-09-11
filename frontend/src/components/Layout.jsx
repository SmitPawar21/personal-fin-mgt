import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Receipt, PiggyBank, Wallet, Target, Landmark, Menu, X } from 'lucide-react';

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Expenses', path: '/expenses', icon: <Receipt className="w-5 h-5" /> },
    { name: 'Savings & Income', path: '/savings', icon: <PiggyBank className="w-5 h-5" /> },
    { name: 'Budgets', path: '/budgets', icon: <Wallet className="w-5 h-5" /> },
    { name: 'Goals', path: '/goals', icon: <Target className="w-5 h-5" /> },
    { name: 'Investments', path: '/investments', icon: <Landmark className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-foreground">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-secondary text-secondary-foreground border-b border-border z-50 sticky top-0">
        <h1 className="text-xl font-bold text-secondary-foreground">Finance App</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-secondary-foreground/80 hover:bg-primary/50 rounded-none transition-colors cursor-pointer">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${mobileMenuOpen ? 'flex' : 'hidden'} 
        md:flex flex-col w-full md:w-64 bg-secondary text-secondary-foreground border-r border-border
        fixed md:relative z-40 h-[calc(100vh-73px)] md:h-screen top-[73px] md:top-0
      `}>
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-bold text-secondary-foreground">Finance App</h1>
        </div>
        <nav className="flex-1 px-4 py-4 md:py-0 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-none transition-colors cursor-pointer ${
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground border-l-4 border-primary-foreground'
                  : 'text-secondary-foreground/80 hover:bg-primary/50 hover:text-secondary-foreground border-l-4 border-transparent'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.username}</span>
              <span className="text-xs text-muted-foreground">{user?.role}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-primary/50 rounded-none transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
