import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validateToken } from '../services/candidateService';
import { useAuth } from '../contexts/AuthContext'; // We might need a special Login function here?
import { Button } from '../components/ui/Button';
import { ShieldCheck, AlertTriangle, Monitor, Globe } from 'lucide-react';
import { Invitation } from '../types';

export const ExamEntryPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [invite, setInvite] = useState<Invitation | null>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [checkingSystem, setCheckingSystem] = useState(false);

    useEffect(() => {
        const verifyInvite = async () => {
            if (!token) {
                setError('Invalid Invitation Link');
                setLoading(false);
                return;
            }

            try {
                const validInvite = await validateToken(token);
                if (validInvite) {
                    setInvite(validInvite);
                } else {
                    setError('This invitation link is invalid or has expired.');
                }
            } catch (err) {
                console.error(err);
                setError('System error verifying invitation.');
            } finally {
                setLoading(false);
            }
        };

        verifyInvite();
    }, [token]);

    const handleStart = () => {
        setCheckingSystem(true);
        // Fast-forward system check
        setTimeout(() => {
            navigate('/system-check', {
                state: {
                    token,
                    candidateName: invite?.candidateName,
                    candidateId: invite?.candidateEmail
                }
            });
        }, 100);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Verifying credentials...</div>;

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-600 max-w-md">{error}</p>
                <Button className="mt-6" variant="secondary" onClick={() => navigate('/')}>Return to Home</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <header className="border-b border-gray-100 h-16 flex items-center justify-center">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    SENTINEL SECURE EXAM
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="max-w-xl w-full text-center slide-up-fade">
                    <div className="mb-8">
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-4">
                            Assessment Invitation
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Welcome, {invite?.candidateName}
                        </h1>
                        <p className="text-lg text-gray-500">
                            You have been invited to take the assessment. Before we begin, we need to verify your environment.
                        </p>
                    </div>

                    {!checkingSystem ? (
                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 mb-8 text-left space-y-4">
                            <div className="flex items-start gap-4">
                                <Monitor className="w-6 h-6 text-gray-400 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">Device Check</h3>
                                    <p className="text-sm text-gray-500">You must be on a desktop or laptop device. Mobile usually not supported for coding.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Globe className="w-6 h-6 text-gray-400 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-gray-900">IP Verification</h3>
                                    <p className="text-sm text-gray-500">Your connection is being logged for security auditing.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-8 mb-8">
                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="font-medium text-gray-600">Checking System Constraints...</p>
                            </div>
                        </div>
                    )}

                    {!checkingSystem && (
                        <Button size="lg" className="w-full md:w-auto px-12 py-4" onClick={handleStart}>
                            Start System Check & Begin
                        </Button>
                    )}
                </div>
            </main>
        </div>
    );
};
