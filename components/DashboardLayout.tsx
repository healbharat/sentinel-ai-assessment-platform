import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import {
    LayoutDashboard,
    FileText,
    Users,
    Database,
    BarChart3,
    ShieldAlert,
    Settings,
    LogOut,
    Menu,
    X,
    Briefcase,
    MessageSquare,
    Calendar,
    FolderGit2,
    Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    if (!user) return null;

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Assessments', path: '/create-assessment', icon: FileText },
        { label: 'Submissions', path: '/task-submissions', icon: FolderGit2 },
        { label: 'Candidates', path: '/candidates', icon: Users },
        { label: 'Interviews', path: '/interviews', icon: Calendar },
        { label: 'Onboarding', path: '/verification', icon: Briefcase },
        { label: 'Internship Reviews', path: '/internship-reviews', icon: Star },
        { label: 'Question Bank', path: '/question-bank', icon: Database },
        { label: 'Analytics', path: '/analytics', icon: BarChart3 }, // Placeholder
        { label: 'Feedback', path: '/reviews', icon: MessageSquare },
        { label: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    const SidebarContent = () => (
        <>
            {/* Header */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3 animate-fade-in">
                    {settings.orgLogoUrl ? (
                        <img src={settings.orgLogoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover bg-white shadow-md" />
                    ) : (
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/30 text-white">
                            {settings.orgName?.charAt(0) || 'S'}
                        </div>
                    )}
                    <span className="font-bold text-lg tracking-wide truncate text-gray-100">{(settings.orgName || 'SENTINEL').toUpperCase()}</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => {
                                navigate(item.path);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden
                                ${isActive
                                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400 rounded-r-full" />
                            )}
                            <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-indigo-200' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={user.avatarUrl} alt="User" className="w-9 h-9 rounded-full bg-slate-700 border-2 border-slate-600" />
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-200 max-w-[100px] truncate">{user.name}</span>
                            <span className="text-xs text-slate-500 max-w-[100px] truncate">{user.role.replace('_', ' ')}</span>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white flex-shrink-0 shadow-xl z-20 h-screen sticky top-0">
                <SidebarContent />
            </aside>

            {/* Mobile Header & Overlay */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 z-30 flex items-center px-4 justify-between shadow-md">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white">S</div>
                    <span className="font-bold text-white">Sentinel AI</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="md:hidden fixed inset-y-0 left-0 w-64 bg-slate-900 text-white z-40 shadow-2xl flex flex-col"
                    >
                        <SidebarContent />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 overflow-auto pt-16 md:pt-0">
                <Outlet />
            </main>
        </div>
    );
};
