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
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-sidebar border-b border-border z-50 sticky top-0">
        <h1 className="text-lg font-bold text-sidebar-foreground">Finance App</h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-active/40 rounded transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${mobileMenuOpen ? 'flex' : 'hidden'} 
        md:flex flex-col w-full md:w-60 bg-sidebar border-r border-border
        fixed md:sticky z-40 top-[53px] md:top-0 h-[calc(100vh-53px)] md:h-screen overflow-y-auto
      `}>
        <div className="px-5 py-5 hidden md:block border-b border-border/50">
          <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">Finance App</h1>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors cursor-pointer text-sm ${
                location.pathname === item.path
                  ? 'bg-sidebar-active text-white font-semibold'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-active/30 hover:text-sidebar-foreground'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-border/50 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-sidebar-foreground truncate">{user?.username}</span>
              <span className="text-xs text-sidebar-foreground/50">{user?.role}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-active/30 rounded transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
