import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, User, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../lib/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success) {
        // Correctly accessing nested data from your JSON structure
        const userData = response.data.data;
        const token = userData.access_token || userData.token; 

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');

        navigate('/'); // Take them to the Dashboard
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
      <div className="max-w-md w-full bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <ShieldCheck className="text-blue-500 mx-auto mb-4" size={40} />
          <h1 className="text-2xl font-bold">SAFEN Portal</h1>
          {location.state?.msg && <p className="text-green-500 text-xs mt-2">{location.state.msg}</p>}
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-500" size={18} />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 py-2.5 pl-10 pr-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 py-2.5 pl-10 pr-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>

          <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin" size={20}/> : 'Enter Dashboard'}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-slate-500">New operator? <Link to="/register" className="text-blue-500">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;