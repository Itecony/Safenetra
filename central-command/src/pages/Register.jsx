import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldPlus, Loader2 } from 'lucide-react';
import api from '../lib/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register', formData);

      if (response.data.success) {
        navigate('/login', { state: { msg: 'Registration successful! Please login.' } });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100 font-sans">
      <div className="max-w-md w-full bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <ShieldPlus className="text-blue-500 mx-auto mb-4" size={40} />
          <h1 className="text-2xl font-bold">Create Account</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="flex gap-4">
            <input
              name="first_name"
              placeholder="First Name"
              onChange={e => setFormData({...formData, first_name: e.target.value})}
              className="w-1/2 bg-slate-800 border border-slate-700 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              name="last_name"
              placeholder="Last Name"
              onChange={e => setFormData({...formData, last_name: e.target.value})}
              className="w-1/2 bg-slate-800 border border-slate-700 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            name="phone"
            placeholder="Phone (e.g. 081...)"
            onChange={e => setFormData({...formData, phone: e.target.value})}
            className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={e => setFormData({...formData, password: e.target.value})}
            className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20}/> : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          Have an account? <Link to="/login" className="text-blue-500">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;