import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setIsSubmitted(true);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 right-0 w-2/3 h-2/3 bg-blue-600/10 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10 p-8 md:p-10"
            >
                <div>
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Login
                    </button>

                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                        <ShieldCheck className="w-6 h-6" />
                        <span className="font-bold text-lg tracking-wide uppercase">Sentinel AI</span>
                    </div>

                    {!isSubmitted ? (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                            <p className="text-gray-500 mb-8">Enter your registered work email and we'll send you a link to reset your password.</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-gray-900"
                                            placeholder="Enter your work email"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center"
                                >
                                    Send Reset Link <ArrowRight className="w-5 h-5 ml-2" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
                            <p className="text-gray-500 mb-6">
                                We've sent a password reset link to <br />
                                <span className="font-medium text-gray-900">{email}</span>
                            </p>
                            <p className="text-sm text-gray-400">
                                Didn't receive the email? <button onClick={() => setIsSubmitted(false)} className="text-indigo-600 font-medium hover:underline">Click to resend</button>
                            </p>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
