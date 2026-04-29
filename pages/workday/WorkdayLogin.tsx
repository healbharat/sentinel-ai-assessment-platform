import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { saveUserProfile, Role, getUserProfile, saveCompanyProfile } from '../../services/workdayService';
import { useWorkdayAuth } from '../../contexts/WorkdayAuthContext';

export const WorkdayLogin: React.FC = () => {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<Role>('student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshProfile } = useWorkdayAuth();

    // Check for query parameters (e.g. ?role=student&redirect=/workday/jobs/123)
    const queryParams = new URLSearchParams(location.search);
    const redirectUrl = queryParams.get('redirect');
    const requestedRole = queryParams.get('role');

    useEffect(() => {
        if (requestedRole && (requestedRole === 'student' || requestedRole === 'company' || requestedRole === 'admin')) {
            setRole(requestedRole as Role);
            setIsSignup(true);
        }
    }, [requestedRole]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignup) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                await saveUserProfile(user.uid, {
                    userId: user.uid,
                    name,
                    email,
                    role,
                    createdAt: new Date()
                });

                if (role === 'company') {
                    await saveCompanyProfile(user.uid, {
                        companyId: user.uid,
                        name,
                        email,
                        verified: false,
                        createdAt: new Date()
                    });
                }
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            
            await refreshProfile();
            const profile = await getUserProfile(auth.currentUser!.uid);
            
            if (redirectUrl) {
                navigate(redirectUrl);
            } else {
                // Default routing based on role
                if (profile?.role === 'student') navigate('/workday/student');
                else if (profile?.role === 'company') navigate('/workday/company');
                else if (profile?.role === 'admin') navigate('/workday/admin');
                else navigate('/workday');
            }

        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-sans items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-md p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-slate-800 tracking-tight">
                        {isSignup ? `Join as ${role.charAt(0).toUpperCase() + role.slice(1)}` : 'Welcome back'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-500">
                        {isSignup ? 'Create your platform account below.' : 'Please sign in to continue.'}
                    </p>
                </div>
                
                {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center border border-red-100">{error}</div>}
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {isSignup && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-white/50"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="appearance-none block w-full px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-white/50"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                className="appearance-none block w-full px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-white/50"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
                        </button>
                    </div>
                    
                    <div className="text-sm text-center">
                        <button
                            type="button"
                            className="font-medium text-slate-500 hover:text-blue-600 transition-colors"
                            onClick={() => setIsSignup(!isSignup)}
                        >
                            {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
