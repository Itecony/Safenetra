import React, { useEffect, useState } from 'react';
import { Bell, User, Loader2 } from 'lucide-react';
import api from '../lib/axios';

const Header = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/user/me');
        if (data.success) {
          setUser(data.data);
          // Sync localStorage just in case
          localStorage.setItem('user', JSON.stringify(data.data));
        }
      } catch (err) {
        console.error("Could not fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-mono text-slate-400 uppercase tracking-widest">System Live</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 pl-6 border-l border-slate-700">
          {!user ? <Loader2 className="animate-spin text-slate-500" size={16}/> : (
            <>
              <div className="text-right">
                <p className="text-sm font-bold text-white leading-none">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-[10px] text-blue-400 uppercase font-black mt-1.5 tracking-wider">
                  {user.role}
                </p>
              </div>
              <div className="w-10 h-10 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center">
                <User className="text-blue-500" size={20} />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;