import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useWorkdayAuth } from '../../contexts/WorkdayAuthContext';

export const WorkdayLayout: React.FC = () => {
    const { profile, logout, isLoading } = useWorkdayAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/workday/login');
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <nav className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/workday" className="text-2xl font-bold text-blue-600">Workday App</Link>
                            </div>
                            {profile && (
                                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                    {profile.role === 'student' && (
                                        <>
                                            <Link to="/workday/student" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Dashboard</Link>
                                            <Link to="/workday/jobs" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Browse Jobs</Link>
                                        </>
                                    )}
                                    {profile.role === 'company' && (
                                        <>
                                            <Link to="/workday/company" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Dashboard</Link>
                                        </>
                                    )}
                                    {profile.role === 'admin' && (
                                        <>
                                            <Link to="/workday/admin" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Admin Panel</Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center">
                            {profile ? (
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-700">Hey, {profile.name} ({profile.role})</span>
                                    <button onClick={handleLogout} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md font-medium transition-colors">Logout</button>
                                </div>
                            ) : (
                                <Link to="/workday/login" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">Sign In</Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Router view starts here */}
                <Outlet />
            </main>
        </div>
    );
};
