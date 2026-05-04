import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useWorkdayAuth } from '../../contexts/WorkdayAuthContext';
import { ShieldCheck, LogOut, LayoutDashboard, Briefcase, Settings } from 'lucide-react';

export const WorkdayLayout: React.FC = () => {
    const { profile, logout, isLoading } = useWorkdayAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/workday/login');
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900">
            <nav className="glass sticky top-0 z-50 border-b border-white/20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/workday" className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-blue-800">Sentinel Workday</span>
                                </Link>
                            </div>
                            {profile && (
                                <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                                    {profile.role === 'student' && (
                                        <>
                                            <Link to="/workday/student" className="text-slate-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 text-sm font-black transition-colors relative group/link">
                                                Dashboard
                                                <span className="absolute bottom-4 left-0 w-0 h-1 bg-blue-600 rounded-full transition-all group-hover/link:w-full"></span>
                                            </Link>
                                            <Link to="/workday/jobs" className="text-slate-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 text-sm font-black transition-colors relative group/link">
                                                Browse Jobs
                                                <span className="absolute bottom-4 left-0 w-0 h-1 bg-blue-600 rounded-full transition-all group-hover/link:w-full"></span>
                                            </Link>
                                        </>
                                    )}
                                    {profile.role === 'company' && (
                                        <>
                                            <Link to="/workday/company" className="text-slate-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 text-sm font-black transition-colors relative group/link">
                                                Dashboard
                                                <span className="absolute bottom-4 left-0 w-0 h-1 bg-blue-600 rounded-full transition-all group-hover/link:w-full"></span>
                                            </Link>
                                        </>
                                    )}
                                    {profile.role === 'admin' && (
                                        <>
                                            <Link to="/workday/admin" className="text-slate-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 text-sm font-black transition-colors relative group/link">
                                                Admin Panel
                                                <span className="absolute bottom-4 left-0 w-0 h-1 bg-blue-600 rounded-full transition-all group-hover/link:w-full"></span>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-6">
                            {profile ? (
                                <div className="flex items-center gap-4">
                                    <div className="hidden md:flex flex-col items-end">
                                        <span className="text-sm font-black text-slate-900 leading-tight">{profile.name}</span>
                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{profile.role}</span>
                                    </div>
                                    <div className="w-10 h-10 bg-slate-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-slate-500 font-bold">
                                        {profile.name.charAt(0)}
                                    </div>
                                    <button 
                                        onClick={handleLogout} 
                                        className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-black transition-all shadow-md shadow-slate-200 active:scale-95"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link to="/workday/login" className="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-black transition-all shadow-lg shadow-blue-200 active:scale-95">Sign In</Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                {/* Router view starts here */}
                <Outlet />
            </main>
        </div>
    );
};
