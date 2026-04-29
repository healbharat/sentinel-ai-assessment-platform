import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Button } from '../components/ui/Button';
import { Lock, ShieldCheck } from 'lucide-react';
import { InterviewAccess } from '../types';

export const InterviewerLoginPage: React.FC = () => {
    const { accessId } = useParams<{ accessId: string }>();
    const navigate = useNavigate();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [accessData, setAccessData] = useState<InterviewAccess | null>(null);

    useEffect(() => {
        const checkAccess = async () => {
            if (!accessId) return;
            // Check if access ID exists superficially first (optional step, or just wait for pin)
            // For strict security, we don't confirm ID existence without PIN, but valid UX might want to known.
            // Here we just wait for PIN.
            const data = await db.getInterviewAccess(accessId);
            if (data) {
                setAccessData(data);
            } else {
                setError('Invalid Access Link');
            }
        };
        checkAccess();
    }, [accessId]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!accessData) {
            setError('Access Link Invalid');
            return;
        }

        if (pin === accessData.accessPin) {
            // Success
            // Store token in sessionStorage for session duration
            sessionStorage.setItem('hr_access_token', accessId || '');
            sessionStorage.setItem('hr_session_id', accessData.sessionId);
            sessionStorage.setItem('hr_name', accessData.hrName);
            navigate('/interviewer-dashboard');
        } else {
            setError('Incorrect PIN');
        }
    };

    if (error === 'Invalid Access Link') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
                    <p className="text-gray-500">This interviewer access link is invalid or expired.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Interviewer Access</h1>
                    <p className="text-gray-500 mt-2">Enter your 4-digit PIN to access the evaluation dashboard.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                inputMode="numeric"
                                maxLength={4}
                                required
                                value={pin}
                                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-center text-2xl tracking-[0.5em]"
                                placeholder="••••"
                                autoFocus
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                    </div>

                    <Button type="submit" className="w-full py-3 shadow-lg shadow-indigo-500/30">
                        Access Dashboard
                    </Button>
                </form>

                {accessData && (
                    <div className="mt-6 text-center text-xs text-gray-400">
                        Welcome, {accessData.hrName}
                    </div>
                )}
            </div>
        </div>
    );
};
