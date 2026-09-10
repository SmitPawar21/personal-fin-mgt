import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Receipt, PiggyBank, Wallet, Target, Landmark } from 'lucide-react';

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Expenses', path: '/expenses', icon: <Receipt className="w-5 h-5" /> },
    { name: 'Savings & Income', path: '/savings', icon: <PiggyBank className="w-5 h-5" /> },
    { name: 'Budgets', path: '/budgets', icon: <Wallet className="w-5 h-5" /> },
    { name: 'Goals', path: '/goals', icon: <Target className="w-5 h-5" /> },
    { name: 'Investments', path: '/investments', icon: <Landmark className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">Finance App</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.username}</span>
              <span className="text-xs text-muted-foreground">{user?.role}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
