import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    ShieldCheck, 
    Lock, 
    Mail, 
    ArrowRight, 
    AlertCircle, 
    CheckCircle2, 
    Zap, 
    Globe, 
    Fingerprint,
    ScanEye
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError('System Access Denied: Invalid Credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#010413] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Starfield Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                {[...Array(60)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute w-px h-px bg-white rounded-full animate-pulse"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    ></div>
                ))}
            </div>

            {/* Ambient Glows */}
            <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-5xl flex flex-col md:flex-row relative z-10 glass-card rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
            >
                {/* Left Side: System Access Form */}
                <div className="w-full md:w-1/2 p-10 md:p-16 bg-slate-950/40 backdrop-blur-3xl relative">
                    {/* Decorative Brackets */}
                    <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-white/10 rounded-tl-2xl"></div>
                    <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-white/10 rounded-br-2xl"></div>
                    
                    <div className="mb-12">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 text-blue-500 mb-6"
                        >
                            <ShieldCheck className="w-8 h-8" />
                            <span className="font-black text-2xl tracking-[0.2em] uppercase">Sentinel <span className="text-white">AI</span></span>
                        </motion.div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 leading-none">Intelligence Hub <br /> <span className="text-blue-500">Authentication</span></h2>
                        <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2 rounded-xl w-fit">
                            < Zap className="w-4 h-4 text-blue-400 fill-blue-400/20" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sovereign Node #204</span>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-3 mb-8"
                        >
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4">Registry Identity</label>
                             <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all font-bold tracking-wide"
                                    placeholder="node@sentinel-ai.com"
                                />
                             </div>
                        </div>

                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4">Access Encryption</label>
                             <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all font-bold tracking-wide"
                                    placeholder="••••••••••••"
                                />
                             </div>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="w-5 h-5 rounded-md border-2 border-white/10 group-hover:border-blue-500/50 flex items-center justify-center transition-all">
                                    <input type="checkbox" className="hidden" />
                                    <div className="w-2 h-2 bg-blue-500 rounded-sm opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Persist Session</span>
                            </label>
                            <button
                                type="button"
                                className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Recover Access
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Decrypting...' : 'Initiate Access'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                </div>

                {/* Right Side: Security Engine Visualization */}
                <div className="hidden md:flex w-1/2 p-16 bg-blue-600 relative flex-col justify-between overflow-hidden group">
                    {/* Atmospheric Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    
                    {/* Animated Circles */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full animate-[spin_20s_linear_infinite]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-blue-600 shadow-2xl mb-10 group-hover:rotate-12 transition-transform duration-500">
                             <Globe className="w-8 h-8" />
                        </div>
                        <h3 className="text-5xl font-black text-white uppercase leading-[0.85] tracking-tighter mb-6 underline decoration-white/20 underline-offset-8">Zero <br /> Compromise <br /> Protocol.</h3>
                        <p className="text-blue-100 font-bold uppercase tracking-widest text-xs opacity-70">Securing 500k+ global talent assessments with bank-grade intelligence.</p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        {[
                            { label: "Ocular Gaze Tracking", icon: <ScanEye className="w-4 h-4" /> },
                            { label: "Biometric Authentication", icon: <Fingerprint className="w-4 h-4" /> },
                            { label: "Lockdown Architecture", icon: <ShieldCheck className="w-4 h-4" /> },
                            { label: "Audio Pattern Analysis", icon: <Zap className="w-4 h-4" /> }
                        ].map((item, idx) => (
                            <motion.div 
                                key={idx} 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + idx * 0.1 }}
                                className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-[1.25rem] border border-white/10 group/item hover:bg-white/20 transition-all"
                            >
                                <div className="p-2 bg-white/10 rounded-lg text-white group-hover/item:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">{item.label}</span>
                                <CheckCircle2 className="w-4 h-4 text-white ml-auto opacity-40" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
