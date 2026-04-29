import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { InterviewSession, InterviewSlot } from '../types';
import { Button } from '../components/ui/Button';
import { Calendar, Clock, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const InterviewerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [session, setSession] = useState<InterviewSession | null>(null);
    const [hrName, setHrName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sessionId = sessionStorage.getItem('hr_session_id');
        const name = sessionStorage.getItem('hr_name');

        if (!sessionId || !name) {
            navigate('/login'); // Or back to specialized login if we knew the ID
            return;
        }
        setHrName(name);

        // Ideally we subscribe, but simple get is safer for access control if we don't have proper Firestore rules for this new role yet.
        // Actually, let's subscribe to the SPECIFIC session so they see updates (like if another HR books something? No, candidates book slots).
        // HR wants to see if a student booked a slot.
        // But `subscribeToInterviewSessions` returns ALL sessions. We need `subscribeToInterviewSession(id)`.
        // `db.ts` doesn't have single doc sub yet, but we can just use `onSnapshot` inside `useEffect` or poll.
        // For now, let's use the list subscription and filter (inefficient but works with current `db.ts`)
        // OR better, add a single session subscription to `db.ts` later.
        // For this task, let's just modify `db.ts` or cheat and use `db.getInterviewSession` + polling or just `subscribeToInterviewSessions` and filter.

        const unsub = db.subscribeToInterviewSessions((sessions) => {
            const target = sessions.find(s => s.id === sessionId);
            if (target) {
                setSession(target);
            } else {
                // Session deleted?
                alert("Session no longer exists.");
                navigate('/');
            }
            setLoading(false);
        });

        return () => unsub();
    }, [navigate]);

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/'); // Redirect to home or login generic
    };

    const handleStatusUpdate = async (slotId: string, status: 'Selected' | 'Rejected') => {
        if (!session) return;

        const slot = session.slots.find(s => s.id === slotId);
        if (!slot || !slot.bookedBy) return;

        const updatedSlots = session.slots.map(s => {
            if (s.id === slotId && s.bookedBy) {
                return { ...s, bookedBy: { ...s.bookedBy, status } };
            }
            return s;
        });

        await db.updateInterviewSession(session.id, { slots: updatedSlots });

        // Sync with Selected Students
        const studentId = slot.bookedBy.email.toLowerCase().replace(/[^a-z0-9]/g, '_');

        if (status === 'Selected') {
            await db.addSelectedStudent({
                id: studentId,
                name: slot.bookedBy.name,
                email: slot.bookedBy.email,
                interviewSessionId: session.id,
                selectedAt: new Date().toISOString(),
                status: 'PENDING_DOCS',
                documents: {}
            });
        } else if (status === 'Rejected') {
            await db.deleteSelectedStudent(studentId);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;
    if (!session) return <div className="min-h-screen flex items-center justify-center">Session not found.</div>;

    const bookedSlots = session.slots.filter(s => s.isBooked);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white">S</div>
                        <span className="font-bold text-gray-900">Sentinel AI - HR Portal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600">Hi, {hrName}</span>
                        <button onClick={handleLogout} className="text-gray-400 hover:text-red-500">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{session.title}</h1>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {session.date}</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {session.startTime} - {session.endTime}</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">Candidate List</h2>
                        <span className="text-sm text-gray-500">{bookedSlots.length} Candidates</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 uppercase text-gray-500 text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">Candidate Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Decision</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookedSlots.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-gray-400">
                                            No candidates have booked slots yet.
                                        </td>
                                    </tr>
                                ) : (
                                    bookedSlots.map(slot => (
                                        <tr key={slot.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{slot.timeLabel}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{slot.bookedBy?.name}</td>
                                            <td className="px-6 py-4 text-gray-500">{slot.bookedBy?.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${slot.bookedBy?.status === 'Selected' ? 'bg-green-100 text-green-800' :
                                                        slot.bookedBy?.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {slot.bookedBy?.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(slot.id, 'Selected')}
                                                        className={`p-2 rounded-lg transition-colors border ${slot.bookedBy?.status === 'Selected' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-400 border-gray-200 hover:border-green-500 hover:text-green-500'}`}
                                                        title="Select Candidate"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(slot.id, 'Rejected')}
                                                        className={`p-2 rounded-lg transition-colors border ${slot.bookedBy?.status === 'Rejected' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-400 border-gray-200 hover:border-red-500 hover:text-red-500'}`}
                                                        title="Reject Candidate"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};
