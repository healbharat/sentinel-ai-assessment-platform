import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { InterviewSession, InterviewSlot } from '../types';
import { Button } from '../components/ui/Button';
import { Calendar, Clock, Plus, Trash2, Link as LinkIcon, Users, CheckCircle, FileDown, ChevronDown, ChevronUp, UserPlus, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InterviewAccess } from '../types';

export const AdminInterviewPage: React.FC = () => {
    const [sessions, setSessions] = useState<InterviewSession[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'All' | 'Selected' | 'Rejected'>('All');

    // HR Modal State
    const [showHrModal, setShowHrModal] = useState<string | null>(null); // sessionId
    const [hrName, setHrName] = useState('');
    const [hrEmail, setHrEmail] = useState('');
    const [hrPin, setHrPin] = useState('');

    // Form
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('14:00');
    const [endTime, setEndTime] = useState('17:00');
    const [slotDuration, setSlotDuration] = useState(6);
    const [studentCount, setStudentCount] = useState(32);
    const [meetLink, setMeetLink] = useState('https://meet.google.com/abc-defg-hij');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const unsub = db.subscribeToInterviewSessions(setSessions);
        return () => unsub();
    }, []);

    const handleSyncSelected = async () => {
        if (!window.confirm("This will scan all sessions and ensure all 'Selected' candidates are added to the Onboarding list. Continue?")) return;

        setIsSyncing(true);
        try {
            let count = 0;
            for (const session of sessions) {
                const selectedSlots = session.slots.filter(s => s.isBooked && s.bookedBy?.status === 'Selected');
                for (const slot of selectedSlots) {
                    if (!slot.bookedBy) continue;
                    const studentId = slot.bookedBy.email.toLowerCase().replace(/[^a-z0-9]/g, '_');

                    // Check if exists
                    const existing = await db.getSelectedStudent(studentId);
                    if (!existing) {
                        await db.addSelectedStudent({
                            id: studentId,
                            name: slot.bookedBy.name,
                            email: slot.bookedBy.email,
                            interviewSessionId: session.id,
                            selectedAt: new Date().toISOString(),
                            status: 'PENDING_DOCS',
                            documents: {}
                        });
                        count++;
                    }
                }
            }
            alert(`Sync Complete! Added ${count} missing candidates to Onboarding.`);
        } catch (error) {
            console.error(error);
            alert("Error syncing candidates.");
        } finally {
            setIsSyncing(false);
        }
    };

    const generateSlots = () => {
        const slots: InterviewSlot[] = [];
        const startParts = startTime.split(':').map(Number);

        let currentMinutes = startParts[0] * 60 + startParts[1];

        // Auto generation based on student count
        for (let i = 0; i < studentCount; i++) {
            const startH = Math.floor(currentMinutes / 60);
            const startM = currentMinutes % 60;
            const endH = Math.floor((currentMinutes + slotDuration) / 60);
            const endM = (currentMinutes + slotDuration) % 60;

            const timeLabel = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')} - ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

            slots.push({
                id: `slot-${Date.now()}-${i}`,
                timeLabel,
                isBooked: false
            });

            currentMinutes += slotDuration;
        }

        return slots;
    };

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const slots = generateSlots();

            const session: InterviewSession = {
                id: `sess-${Date.now()}`,
                title: `Interview Session - ${date}`,
                date,
                startTime,
                endTime,
                slotDuration,
                totalSlots: slots.length,
                meetLink,
                slots,
                createdAt: new Date().toISOString()
            };

            await db.addInterviewSession(session);
            setShowModal(false);
            alert("Interview Session Created Successfully!");
        } catch (error) {
            console.error(error);
            alert("Error creating session");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAssignHr = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showHrModal) return;

        const accessId = `hr-${Date.now()}`;
        const newAccess: InterviewAccess = {
            id: accessId,
            sessionId: showHrModal,
            hrName,
            hrEmail,
            accessPin: hrPin,
            createdAt: new Date().toISOString()
        };

        await db.createInterviewAccess(newAccess);

        setShowHrModal(null);
        setHrName('');
        setHrEmail('');
        setHrPin('');

        const link = `${window.location.origin}/interviewer-login/${accessId}`;

        if (window.confirm(`HR Access Created!\n\nLink: ${link}\nPIN: ${hrPin}\n\nClick OK to copy this link to your clipboard.`)) {
            navigator.clipboard.writeText(link).then(() => {
                alert("Link copied to clipboard!");
            }).catch(err => {
                console.error('Failed to copy: ', err);
                alert("Failed to copy automatically. Please manually copy the link from the previous popup (or generate again).");
            });
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (window.confirm("Are you sure you want to delete this interview session? The booking link will expire immediately.")) {
            await db.deleteInterviewSession(sessionId);
        }
    };

    const handleStatusUpdate = async (session: InterviewSession, slotId: string, status: 'Selected' | 'Rejected') => {
        const slot = session.slots.find(s => s.id === slotId);
        if (!slot || !slot.bookedBy) return;

        const updatedSlots = session.slots.map(s => {
            if (s.id === slotId && s.bookedBy) {
                return { ...s, bookedBy: { ...s.bookedBy, status } };
            }
            return s;
        });

        // Update Session
        await db.updateInterviewSession(session.id, { slots: updatedSlots });

        // Sync with Selected Students Collection
        // Use normalized email as ID
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
            // Delete if exists
            await db.deleteSelectedStudent(studentId);
        }
    };

    const downloadPDF = (session: InterviewSession, filterStatus?: 'Selected' | 'Rejected') => {
        const doc = new jsPDF();
        const title = filterStatus ? `${filterStatus} Candidates` : 'Interview Schedule';

        doc.setFontSize(18);
        doc.text(`${title} - ${session.title}`, 14, 20);
        doc.setFontSize(10);
        doc.text(`Date: ${session.date} | Time: ${session.startTime} - ${session.endTime}`, 14, 28);

        const tableColumn = ["Candidate Name", "Email", "Time Slot", "Status"];

        let candidates = session.slots.filter(s => s.isBooked && s.bookedBy);
        if (filterStatus) {
            candidates = candidates.filter(s => s.bookedBy?.status === filterStatus);
        }

        const tableRows = candidates.map(slot => [
            slot.bookedBy?.name || 'N/A',
            slot.bookedBy?.email || 'N/A',
            slot.timeLabel,
            slot.bookedBy?.status || 'Pending'
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: filterStatus === 'Selected' ? [22, 163, 74] : filterStatus === 'Rejected' ? [220, 38, 38] : [79, 70, 229] },
        });

        doc.save(`${title.toLowerCase().replace(' ', '_')}_${session.date}.pdf`);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Interview Scheduling</h1>
                    <p className="text-gray-500">Manage interview slots and availability</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleSyncSelected} variant="secondary" disabled={isSyncing}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Sync Candidates'}
                    </Button>
                    <Button onClick={() => setShowModal(true)} className="shadow-lg shadow-indigo-500/20">
                        <Plus className="w-5 h-5 mr-2" /> Create Session
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {sessions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No Interview Sessions</h3>
                        <p className="text-gray-500 mb-6">Create a new session to start scheduling interviews.</p>
                        <Button onClick={() => setShowModal(true)}>Create First Session</Button>
                    </div>
                ) : (
                    sessions.map(session => (
                        <div key={session.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6 animate-slide-up transition-all">
                            {/* Session Header */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        {session.title}
                                        {new Date(session.date) < new Date() && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Past</span>}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(session.date).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {session.startTime} - {session.endTime}</span>
                                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {session.slots.filter(s => s.isBooked).length} / {session.totalSlots} Booked</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => downloadPDF(session)} className="text-red-600 border-red-100 hover:bg-red-50">
                                        <FileDown className="w-4 h-4 mr-2" /> Schedule PDF
                                    </Button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/book-interview/${session.id}`);
                                            alert("Booking Link Copied!");
                                        }}
                                        className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                        title="Copy Booking Link"
                                    >
                                        <LinkIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        {expandedSessionId === session.id ? <ChevronUp /> : <ChevronDown />}
                                    </button>
                                    <button
                                        onClick={() => setShowHrModal(session.id)}
                                        className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Assign HR"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSession(session.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Session"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Collapsible Section: Selection Management */}
                            {expandedSessionId === session.id && (
                                <div className="border-t border-gray-100 pt-6 animate-fade-in">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex gap-4 border-b border-gray-200">
                                            {['All', 'Selected', 'Rejected'].map(tab => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab as any)}
                                                    className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                                >
                                                    {tab} Candidates
                                                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
                                                </button>
                                            ))}
                                        </div>
                                        {activeTab !== 'All' && (
                                            <Button variant="secondary" size="sm" onClick={() => downloadPDF(session, activeTab as any)}>
                                                <FileDown className="w-4 h-4 mr-2" /> Download {activeTab} List
                                            </Button>
                                        )}
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 uppercase text-gray-500 text-xs font-semibold">
                                                <tr>
                                                    <th className="px-4 py-3">Time Slot</th>
                                                    <th className="px-4 py-3">Candidate</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {session.slots
                                                    .filter(s => s.isBooked)
                                                    .filter(s => {
                                                        if (activeTab === 'All') return true;
                                                        return s.bookedBy?.status === activeTab;
                                                    })
                                                    .length === 0 ? (
                                                    <tr><td colSpan={4} className="text-center py-8 text-gray-400">No candidates found in this category.</td></tr>
                                                ) : (
                                                    session.slots
                                                        .filter(s => s.isBooked)
                                                        .filter(s => {
                                                            if (activeTab === 'All') return true;
                                                            return s.bookedBy?.status === activeTab;
                                                        })
                                                        .map(slot => (
                                                            <tr key={slot.id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 font-medium text-gray-900">{slot.timeLabel}</td>
                                                                <td className="px-4 py-3">
                                                                    <div className="font-semibold text-gray-900">{slot.bookedBy?.name}</div>
                                                                    <div className="text-xs text-gray-500">{slot.bookedBy?.email}</div>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold
                                                                        ${slot.bookedBy?.status === 'Selected' ? 'bg-green-100 text-green-700' :
                                                                            slot.bookedBy?.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                                                'bg-yellow-100 text-yellow-700'}`}>
                                                                        {slot.bookedBy?.status || 'Pending'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            onClick={() => handleStatusUpdate(session, slot.id, 'Selected')}
                                                                            className="px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded border border-green-200 text-xs font-semibold transition-colors"
                                                                        >
                                                                            Select
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleStatusUpdate(session, slot.id, 'Rejected')}
                                                                            className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded border border-red-200 text-xs font-semibold transition-colors"
                                                                        >
                                                                            Reject
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
                            )}

                            {/* Slot Grid Preview (Compact) */}
                            {expandedSessionId !== session.id && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex justify-between">
                                        <span>Slots Overview</span>
                                        <span className="text-xs text-gray-400 font-normal">Click arrow to manage selection</span>
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-24 overflow-hidden relative fade-bottom">
                                        {session.slots.map(slot => (
                                            <div
                                                key={slot.id}
                                                className={`
                                                    text-xs p-2 rounded border text-center relative
                                                    ${slot.isBooked
                                                        ? (slot.bookedBy?.status === 'Selected' ? 'bg-green-100 border-green-200 text-green-800' :
                                                            slot.bookedBy?.status === 'Rejected' ? 'bg-red-50 border-red-200 text-red-800' :
                                                                'bg-indigo-100 border-indigo-200 text-indigo-700')
                                                        : 'bg-white border-gray-200 text-gray-400'}
                                                `}
                                            >
                                                {slot.timeLabel}
                                            </div>
                                        ))}
                                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">New Interview Session</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><Plus className="w-6 h-6 rotate-45" /></button>
                        </div>

                        <form onSubmit={handleCreateSession} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={startTime}
                                        onChange={e => setStartTime(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time (Range only)</label>
                                    <input
                                        type="time"
                                        required
                                        value={endTime}
                                        onChange={e => setEndTime(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (Min)</label>
                                    <input
                                        type="number"
                                        value={slotDuration}
                                        onChange={e => setSlotDuration(Number(e.target.value))}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Students</label>
                                    <input
                                        type="number"
                                        required
                                        value={studentCount}
                                        onChange={e => setStudentCount(Number(e.target.value))}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Google Meet Link</label>
                                <input
                                    type="url"
                                    required
                                    value={meetLink}
                                    onChange={e => setMeetLink(e.target.value)}
                                    placeholder="https://meet.google.com/..."
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="pt-4">
                                <Button type="submit" disabled={isSaving} className="w-full py-3 shadow-lg shadow-indigo-500/20">
                                    {isSaving ? 'Generating Slots...' : 'Create & Generate Slots'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* HR Assignment Modal */}
            {showHrModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Assign HR</h2>
                            <button onClick={() => setShowHrModal(null)} className="text-gray-400 hover:text-gray-600"><Plus className="w-6 h-6 rotate-45" /></button>
                        </div>

                        <form onSubmit={handleAssignHr} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">HR Name</label>
                                <input
                                    required
                                    value={hrName}
                                    onChange={e => setHrName(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">HR Email</label>
                                <input
                                    type="email"
                                    required
                                    value={hrEmail}
                                    onChange={e => setHrEmail(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="jane@company.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">4-Digit Access PIN</label>
                                <input
                                    type="text"
                                    maxLength={4}
                                    pattern="\d{4}"
                                    required
                                    value={hrPin}
                                    onChange={e => setHrPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none tracking-widest text-center text-xl"
                                    placeholder="0000"
                                />
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="w-full py-3 shadow-lg shadow-indigo-500/20">
                                    Generate Access Link
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
