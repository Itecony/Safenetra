import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, History, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Define the actual routes these buttons should go to
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/dashboard' },
    { icon: <AlertTriangle size={20} />, label: 'Live Incidents', path: '/incidents' },
    { icon: <History size={20} />, label: 'Archive', path: '/archive' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    // 1. Clear the token and user data
    localStorage.removeItem('token'); 
    localStorage.removeItem('user'); 
    // 2. Redirect to login
    navigate('/login');
    // 3. Force refresh to clear any cached states
    window.location.reload();
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-2">
        <img src="/SafeN.png" alt="Logo" className="w-8 h-8 object-contain"/>
        <h1 className="text-blue-500 font-black text-2xl tracking-tighter italic">SAFEN</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item, idx) => {
          // Check if the current browser URL matches the button path
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={idx}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <div className={`${isActive ? 'text-white' : 'text-blue-500 group-hover:scale-110 transition-transform'}`}>
                {item.icon}
              </div>
              <span className="font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;