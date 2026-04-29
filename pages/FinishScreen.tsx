import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FinishScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg w-full">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Assessment Complete</h2>
                <p className="text-gray-600 mb-8">
                    Your responses have been securely submitted. The AI is currently analyzing your code quality and proctoring logs.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 text-left">
                    <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-2">Next Steps</p>
                    <ul className="text-sm text-gray-700 space-y-2">
                        <li>• Report generation (approx. 2 min)</li>
                        <li>• HR Review of Integrity Score</li>
                        <li>• Final decision notification via email</li>
                    </ul>
                </div>
                <button
                    onClick={() => {
                        window.close(); // For popups
                        // Fallback if not popup
                        navigate('/');
                        window.location.href = "about:blank"; // Force "Exit" feel
                    }}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                    Exit Test
                </button>
            </div>
        </div>
    );
};
