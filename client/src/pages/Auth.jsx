import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Leaf } from 'lucide-react';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${endpoint}`, {
                email, password, role: 'admin'
            });

            if (isLogin) {
                login(res.data.token, res.data.user);
                navigate('/dashboard');
            } else {
                setIsLogin(true);
                setEmail('');
                setPassword('');
                alert('Registration successful! Please login.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="bg-white w-full max-w-md p-10 rounded-2xl border border-slate-200 shadow-2xl relative z-10 transition-all">
                <div className="text-center mb-10 flex flex-col items-center">
                    <div className="bg-emerald-50 p-3 rounded-full mb-4 border border-emerald-100">
                         <Leaf className="text-emerald-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold font-sans text-slate-900 mb-2 tracking-tight">
                        {isLogin ? 'Eco Platform Gateway' : 'Access Request'}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {isLogin ? 'Sign in with your organizational credentials.' : 'Initialize sub-administrator token.'}
                    </p>
                </div>

                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-6 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Corporate Identity</label>
                        <input 
                            type="email" 
                            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm placeholder-slate-400"
                            placeholder="director@smartcity.net"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Security Token</label>
                        <input 
                            type="password" 
                            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm placeholder-slate-400"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold uppercase tracking-wider py-3.5 rounded-lg transition-all shadow-lg shadow-emerald-500/20 mt-4 border border-transparent"
                    >
                        {isLogin ? 'Initialize Session' : 'Generate Token'}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-emerald-600 hover:text-emerald-500 text-xs font-semibold uppercase tracking-wider transition-colors hover:underline"
                    >
                        {isLogin ? "Bypass to Registration Form" : "Return to Valid Authentication"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
