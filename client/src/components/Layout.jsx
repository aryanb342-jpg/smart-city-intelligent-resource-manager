import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Zap, Droplets, Wifi, Trash2, LayoutDashboard, LogOut, Bell, Leaf } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Sidebar = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/electricity', label: 'Electricity', icon: <Zap size={20} /> },
        { path: '/water', label: 'Water', icon: <Droplets size={20} /> },
        { path: '/wifi', label: 'WiFi', icon: <Wifi size={20} /> },
        { path: '/waste', label: 'Waste', icon: <Trash2 size={20} /> },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 sticky top-0 shadow-sm z-20">
            <div className="p-7 border-b border-slate-100 flex items-center gap-3">
                <Leaf className="text-emerald-500" size={26} />
                <div>
                   <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                       EcoNexus
                   </h1>
                   <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-[0.2em]">Smart Platform</p>
                </div>
            </div>
            
            <nav className="flex-1 px-4 space-y-2 mt-8">
                {menuItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-semibold tracking-wide ${
                                isActive 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                            }`
                        }
                    >
                        <div className={`${item.path === window.location.pathname ? 'text-emerald-500' : 'text-slate-400'}`}>
                           {item.icon}
                        </div>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-5 border-t border-slate-100 mt-auto">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-bold uppercase tracking-widest transition-colors border border-transparent hover:border-red-100 group"
                >
                    <LogOut size={16} className="group-hover:text-red-500" />
                    <span>Disconnect</span>
                </button>
            </div>
        </aside>
    );
};

export const Layout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const [alerts, setAlerts] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if(user) {
             axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/alerts`)
                 .then(res => setAlerts(res.data))
                 .catch(console.error);
        }
    }, [user]);

    const handleLogout = () => {
         logout();
         navigate('/login');
    }

    return (
        <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans selection:bg-emerald-200">
            <Sidebar />
            <main className="flex-1 flex flex-col relative max-h-screen overflow-y-auto">
                <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        Secure Link Valid
                    </div>
                    <div className="flex items-center gap-5 relative">
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-500 transition-colors border border-transparent">
                                <Bell size={18} />
                                {alerts.length > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                            </button>
                            
                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 overflow-hidden">
                                    <div className="px-5 py-3 border-b border-slate-100 font-bold text-[10px] text-emerald-600 uppercase tracking-widest bg-slate-50/50">System Diagnostics</div>
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                        {alerts.length === 0 ? (
                                            <p className="p-5 text-sm text-slate-500 font-medium tracking-wide">All infrastructure operating optimally.</p>
                                        ) : (
                                            alerts.map((a, i) => (
                                                <div key={a._id} className={`p-4 hover:bg-slate-50 transition duration-150 ${i !== alerts.length -1 ? 'border-b border-slate-100' : ''}`}>
                                                    <p className="text-sm font-medium text-slate-800 leading-relaxed">{a.message}</p>
                                                    <p className="text-xs text-slate-500 mt-2 font-mono">{new Date(a.timestamp).toLocaleString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-5 w-px bg-slate-200"></div>

                        <div className="relative">
                            <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-3 hover:bg-slate-100 p-1.5 pr-3 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-xs tracking-tighter shadow-sm">
                                    {user?.role === 'admin' ? 'AD' : 'OP'}
                                </div>
                                <div className="text-xs font-semibold text-slate-600 capitalize hidden sm:block">Director</div>
                            </button>

                            {showProfile && (
                                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 overflow-hidden text-sm">
                                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                                        <p className="text-slate-900 font-bold truncate text-sm">{user?.id}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-emerald-600 mt-1 font-bold">{user?.role || 'Standard'}</p>
                                    </div>
                                    <div className="p-2">
                                        <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-red-50 hover:text-red-500 flex items-center gap-3 transition-colors">
                                            <LogOut size={16} /> End Session
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};
