import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    nav('/login');
  };

  const initials = user ? (user.first_name?.[0] || '') + (user.last_name?.[0] || '') : 'U';
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { to: '/dashboard', icon: '🏠', label: 'Overview', exact: true },
    { to: '/dashboard/income', icon: '💵', label: 'Income' },
    { to: '/dashboard/expenses', icon: '💸', label: 'Expenses' },
    { to: '/dashboard/budget', icon: '🎯', label: 'Budget' },
  ];
  const aiItems = [
    { to: '/dashboard/insights', icon: '🤖', label: 'AI Insights' },
    { to: '/dashboard/reports', icon: '📋', label: 'Reports' },
  ];
  const adminItems = isAdmin ? [
    { to: '/dashboard/admin', icon: '⚙️', label: 'Admin Panel' },
  ] : [];

  const isActive = (to, exact) => {
    if (exact) return loc.pathname === to;
    return loc.pathname.startsWith(to) && to !== '/dashboard';
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="dash-layout">
      {/* Overlay for mobile */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={closeSidebar} />

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">💰</div>
          <div>
            <div>AI Finance</div>
            <div style={{fontSize:'0.6rem',color:'var(--muted)',fontWeight:400}}>Personal Dashboard</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-group-label">Main</div>
          {navItems.map(item => (
            <Link key={item.to} to={item.to} className={`nav-item ${isActive(item.to, item.exact) ? 'active' : ''}`} onClick={closeSidebar}>
              <span className="nav-icon">{item.icon}</span> {item.label}
            </Link>
          ))}
          <div className="nav-group-label" style={{marginTop:'8px'}}>Intelligence</div>
          {aiItems.map(item => (
            <Link key={item.to} to={item.to} className={`nav-item ${isActive(item.to) ? 'active' : ''}`} onClick={closeSidebar}>
              <span className="nav-icon">{item.icon}</span> {item.label}
            </Link>
          ))}
          {isAdmin && (
            <>
              <div className="nav-group-label" style={{marginTop:'8px'}}>Admin</div>
              {adminItems.map(item => (
                <Link key={item.to} to={item.to} className={`nav-item ${isActive(item.to) ? 'active' : ''}`} onClick={closeSidebar}>
                  <span className="nav-icon">{item.icon}</span> {item.label}
                </Link>
              ))}
            </>
          )}
          <div className="nav-group-label" style={{marginTop:'8px'}}>Account</div>
          <Link to="/dashboard/profile" className={`nav-item ${isActive('/dashboard/profile') ? 'active' : ''}`} onClick={closeSidebar}>
            <span className="nav-icon">👤</span> Profile
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="user-badge">
            <div className="user-avatar" style={{background:'linear-gradient(135deg,var(--accent),var(--accent2))'}}>{initials.toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.first_name} {user?.last_name}</div>
              <div className="user-role">{isAdmin ? 'Administrator' : 'User'}</div>
            </div>
          </div>
          <button className="nav-item" onClick={handleLogout} style={{color:'var(--red)'}}>
            <span className="nav-icon">🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="dash-main">
        {/* Mobile top bar */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}} className="mobile-only">
          <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div style={{fontSize:'0.85rem',fontWeight:600,fontFamily:'var(--font-head)'}}>AI Personal Finance</div>
          <div className="user-avatar" style={{background:'linear-gradient(135deg,var(--accent),var(--accent2))'}}>{initials.toUpperCase()}</div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
