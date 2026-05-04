import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { saveUserProfile, Role, getUserProfile, saveCompanyProfile } from '../../services/workdayService';
import { useWorkdayAuth } from '../../contexts/WorkdayAuthContext';
import { ShieldCheck, User, Mail, Lock, Rocket, XCircle } from 'lucide-react';

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
        <div className="min-h-screen flex font-sans items-center justify-center bg-[#f8fafc] relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-400/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>
            
            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] text-white shadow-2xl shadow-blue-200 mb-6 animate-float">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                        {isSignup ? `Join as ${role.charAt(0).toUpperCase() + role.slice(1)}` : 'Welcome Back'}
                    </h2>
                    <p className="text-slate-500 font-medium">
                        {isSignup ? 'Experience the future of hiring today.' : 'Sign in to access your Sentinel dashboard.'}
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-premium border border-white/50">
                    {error && (
                        <div className="mb-6 bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-black border border-rose-100 flex items-center gap-3 animate-shake">
                            <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <XCircle className="w-4 h-4" />
                            </div>
                            {error}
                        </div>
                    )}
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {isSignup && (
                                <div className="animate-slide-up">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                        Full Name
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            className="block w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium text-sm"
                                            placeholder="Enter your full name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="animate-slide-up delay-100">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium text-sm"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="animate-slide-up delay-200">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 animate-slide-up delay-300">
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-200 active:scale-95"
                            >
                                <span className="flex items-center gap-2">
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {isSignup ? 'Create Account' : 'Sign In Now'}
                                            <Rocket className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                        
                        <div className="text-center animate-slide-up delay-400">
                            <button
                                type="button"
                                className="text-xs font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
                                onClick={() => setIsSignup(!isSignup)}
                            >
                                {isSignup ? 'Already have an account? Sign in' : "New to Sentinel? Create an account"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
