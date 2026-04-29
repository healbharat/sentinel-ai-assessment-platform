import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { InterviewSession, InterviewSlot } from '../types';
import { Button } from '../components/ui/Button';
import { Calendar, Clock, CheckCircle, AlertTriangle, User, Mail, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const InterviewBookingPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [session, setSession] = useState<InterviewSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Booking Form
    const [selectedSlot, setSelectedSlot] = useState<InterviewSlot | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isBooking, setIsBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        const loadSession = async () => {
            if (!sessionId) return;
            const data = await db.getInterviewSession(sessionId);
            if (data) {
                setSession(data);
            } else {
                setError("Session not found or expired.");
            }
            setLoading(false);
        };
        loadSession();
    }, [sessionId]);

    const handleBookSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot || !session) return;
        setIsBooking(true);

        // 1. Refresh session to check availability (Optimistic locking via logic)
        // In a real app, use Firestore Transaction. Here we check again.
        const freshSession = await db.getInterviewSession(session.id);
        if (!freshSession) return;

        const freshSlot = freshSession.slots.find(s => s.id === selectedSlot.id);
        if (freshSlot?.isBooked) {
            alert("Oh no! This slot was just booked by someone else. Please choose another.");
            setSession(freshSession); // Update UI
            setIsBooking(false);
            return;
        }

        // 2. Update Slot
        const updatedSlots = freshSession.slots.map(s => {
            if (s.id === selectedSlot.id) {
                return {
                    ...s,
                    isBooked: true,
                    bookedBy: { name, email },
                    bookedAt: new Date().toISOString()
                };
            }
            return s;
        });

        await db.updateInterviewSession(session.id, { slots: updatedSlots });
        setBookingSuccess(true);

        // Simulation of Email Sending
        // sendConfirmationEmail({ to: email, link: session.meetLink, time: selectedSlot.timeLabel });
        setIsBooking(false);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Scheduling...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    if (bookingSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md w-full border border-indigo-50"
                >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Interview Booked!</h2>
                    <p className="text-gray-500 mb-6">You are scheduled for {session?.date} at {selectedSlot?.timeLabel}.</p>

                    <div className="bg-indigo-50 p-4 rounded-xl mb-6 text-left border border-indigo-100">
                        <h4 className="text-xs font-bold text-indigo-800 uppercase mb-2">Meeting Link</h4>
                        <div className="flex items-center gap-2 text-indigo-600 font-medium break-all">
                            <Video className="w-4 h-4 flex-shrink-0" />
                            <a href={session?.meetLink} target="_blank" rel="noreferrer" className="underline hover:text-indigo-800">
                                {session?.meetLink}
                            </a>
                        </div>
                    </div>

                    <p className="text-xs text-gray-400">A confirmation email has been sent to {email}.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Your Interview</h1>
                    <p className="text-gray-500">Select a time slot for your assessment review.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                    {/* Left Info Panel */}
                    <div className="md:w-1/3 bg-slate-900 text-white p-8 flex flex-col justify-between">
                        <div>
                            <div className="inline-block p-3 bg-indigo-600 rounded-xl mb-6 shadow-lg shadow-indigo-500/30">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold mb-1">{session?.title}</h2>
                            <p className="text-indigo-300 text-sm mb-6">Duration: {session?.slotDuration} Minutes</p>

                            <div className="space-y-4 text-sm text-slate-300">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-indigo-400" />
                                    <span>{session?.startTime} - {session?.endTime}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Video className="w-4 h-4 text-indigo-400" />
                                    <span>Google Meet</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-slate-500 mt-8">
                            * Slots are limited. First come, first served.
                        </div>
                    </div>

                    {/* Right Booking Area */}
                    <div className="md:w-2/3 p-8 bg-white relative">
                        {!selectedSlot ? (
                            <div className="h-full flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    Available Slots <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{session?.slots.filter(s => !s.isBooked).length} Open</span>
                                </h3>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[400px] pr-2">
                                    {session?.slots.map(slot => (
                                        <button
                                            key={slot.id}
                                            disabled={slot.isBooked}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`
                                                py-3 px-2 rounded-lg text-sm font-medium border transition-all duration-200
                                                ${slot.isBooked
                                                    ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-60'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-500 hover:shadow-md hover:text-indigo-600'
                                                }
                                            `}
                                        >
                                            {slot.timeLabel}
                                            {slot.isBooked && <span className="block text-[10px] uppercase font-bold mt-1 text-red-300">Booked</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Confirm Booking Form
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="h-full flex flex-col"
                            >
                                <button onClick={() => setSelectedSlot(null)} className="text-sm text-gray-400 hover:text-indigo-600 mb-6 flex items-center gap-1">
                                    ← Back to Slots
                                </button>

                                <div className="flex-1 max-w-sm mx-auto w-full">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Booking</h3>
                                    <div className="bg-indigo-50 p-4 rounded-xl mb-8 flex items-center gap-3 border border-indigo-100">
                                        <Clock className="w-5 h-5 text-indigo-600" />
                                        <span className="font-semibold text-indigo-900">{selectedSlot.timeLabel}</span>
                                    </div>

                                    <form onSubmit={handleBookSlot} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    required
                                                    value={name}
                                                    onChange={e => setName(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" disabled={isBooking} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 mt-4">
                                            {isBooking ? 'Securing Slot...' : 'Confirm Booking'}
                                        </Button>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
