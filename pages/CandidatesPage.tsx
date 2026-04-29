import React, { useState, useEffect } from 'react';
import { db } from '../services/db'; // Realtime DB
import { getAssessments } from '../services/assessmentService';
import { sendInvitationEmail } from '../services/emailService'; // New Email Service
import { CandidateProfile, Exam } from '../types';
import { runAutoHiringPipeline } from '../services/hiringService';
import { Button } from '../components/ui/Button';
import { UserPlus, Mail, Upload, Search, CheckCircle2, Zap, Link as LinkIcon, Copy, Trash2, Trash } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { MOCK_CANDIDATE_PROFILES } from '../constants';

export const CandidatesPage: React.FC = () => {
    const { settings } = useSettings();
    const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState('');

    // New Candidate Form
    const [newParams, setNewParams] = useState({ name: '', email: '' });
    const [isProcesssing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Initial Fetch
        const loadExams = async () => {
            const examList = await getAssessments();
            setExams(examList);
            if (examList.length > 0 && !selectedExam) {
                setSelectedExam(examList[0].id);
            }
        };
        loadExams();

        // Realtime Subscription
        const unsubscribe = db.subscribeToCandidates((data) => {
            setCandidates(data.length > 0 ? data : MOCK_CANDIDATE_PROFILES as any);
        });
        return () => unsubscribe();
    }, []);

    const handleAddCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            // 1. Add Candidate to DB
            const newCandidate: CandidateProfile = {
                id: `cand-${Date.now()}`,
                name: newParams.name,
                email: newParams.email,
                status: 'Invited',
                invitedAt: new Date().toISOString(),
                assignedExamId: selectedExam // Ensure this is saved
            };
            await db.addCandidate(newCandidate);

            // 2. Generate Invite & Send Email
            if (selectedExam) {
                // Generate a unique token
                const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

                const invite = {
                    id: `inv-${Date.now()}`,
                    candidateEmail: newCandidate.email,
                    candidateName: newCandidate.name,
                    examId: selectedExam,
                    token: token,
                    status: 'PENDING' as const,
                    createdAt: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    used: false
                };

                // Save invite to DB so the link works
                await db.addInvitation(invite);

                // Send the actual email (Simulated/Real)
                if (settings.emailEnabled !== false) {
                    await sendInvitationEmail(invite);
                    alert("Candidate invited successfully via Email!");
                } else {
                    alert("Candidate added! Emails are disabled. Please copy the link manually.");
                }
            }
        } catch (error) {
            console.error(error);
            alert("Error adding candidate.");
        } finally {
            setNewParams({ name: '', email: '' });
            setIsProcessing(false);
            setShowInviteModal(false);
        }
    };

    const handleCopyLink = async (candidate: CandidateProfile) => {
        const examId = candidate.assignedExamId || (exams.length > 0 ? exams[0].id : '');
        if (!examId) {
            alert("No assessment assigned to this candidate.");
            return;
        }

        // Generate a new manual link (ensures it works even if previous expired)
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const invite = {
            id: `inv-manual-${Date.now()}`,
            candidateEmail: candidate.email,
            candidateName: candidate.name,
            examId: examId,
            token: token,
            status: 'PENDING' as const,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            used: false
        };

        await db.addInvitation(invite);

        const link = `${window.location.origin}/start/${token}`;
        navigator.clipboard.writeText(link);
        alert(`Assessment Link Copied to Clipboard!\n\n${link}`);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleBulkUpload(e.target.files[0]);
        }
    };


    const handleBulkUpload = (file: File) => {
        setIsProcessing(true);
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) return;

            // Basic CSV parsing
            const lines = text.split('\n');
            let addedCount = 0;

            // Skip header if present (assuming Name, Email format)
            const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;

            const promises = [];
            for (let i = startIndex; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const parts = line.split(',');
                if (parts.length >= 2) {
                    const name = parts[0].trim();
                    const email = parts[1].trim();
                    if (name && email && email.includes('@')) {
                        const newCand: CandidateProfile = {
                            id: `cand-${Date.now()}-${Math.random()}`,
                            name: name,
                            email: email,
                            status: 'Invited',
                            invitedAt: new Date().toISOString()
                        };
                        promises.push(db.addCandidate(newCand));
                        addedCount++;
                    }
                }
            }

            Promise.all(promises).then(async (candidates) => {
                // Now create invites for all added candidates
                let sentCount = 0;
                const emailPromises = candidates.map(async (candResult: any) => {
                    if (!candResult || !candResult.id) return;

                    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    const invite = {
                        id: `inv-${Date.now()}-${Math.random()}`,
                        candidateEmail: candResult.email,
                        candidateName: candResult.name,
                        examId: selectedExam || (exams[0] ? exams[0].id : 'EXAM-001'),
                        token: token,
                        status: 'PENDING' as const,
                        createdAt: new Date().toISOString(),
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        used: false
                    };

                    await db.addInvitation(invite);

                    if (settings.emailEnabled !== false) {
                        await sendInvitationEmail(invite);
                        sentCount++;
                    }
                });

                await Promise.all(emailPromises);

                // No need to manually refresh, subscription does it
                setIsProcessing(false);
                alert(`Successfully imported ${addedCount} candidates and sent ${sentCount} invitation emails.`);
            });
        };

        // If simulated for demo without file (via button click legacy)
        if (!file.name) {
            setTimeout(async () => {
                const promises = ['demo.user1@example.com', 'demo.user2@example.com'].map((email) => {
                    const c: CandidateProfile = {
                        id: `cand-${Date.now()}-${Math.random()}`,
                        name: email.split('@')[0],
                        email: email,
                        status: 'Invited',
                        invitedAt: new Date().toISOString()
                    };
                    return db.addCandidate(c);
                });
                await Promise.all(promises);
                setIsProcessing(false);
                alert("Simulated import of 2 demo candidates.");
            }, 800);
            return;
        }

        reader.readAsText(file);
    };

    // ... (handleBulkUpload)

    const handleAutoHire = async () => {
        if (!confirm("Start Automated Hiring Pipeline?\nThis will process all pending results, shortlist high performers based on criteria (Score > 70, Cheat < 20), and send rejection emails automatically.")) return;

        setIsProcessing(true);
        const result = await runAutoHiringPipeline();
        setIsProcessing(false);
        // UI updates automatically via subscription
        alert(`Pipeline Completed!\n\nShortlisted: ${result.Shortlisted}\nRejected: ${result.Rejected}\nEmails have been sent.`);
    };

    const handleResendInvite = async (candidate: CandidateProfile) => {
        setIsProcessing(true);
        const examId = candidate.assignedExamId || (exams.length > 0 ? exams[0].id : '');
        // ...

        if (!examId) {
            alert("No assessment available to send.");
            setIsProcessing(false);
            return;
        }

        // Generate new token for resend
        const token = Math.random().toString(36).substring(2, 15);
        const invite = {
            id: `inv-${Date.now()}`,
            candidateEmail: candidate.email,
            candidateName: candidate.name,
            examId: examId,
            token: token,
            status: 'PENDING' as const,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            used: false
        };

        await db.addInvitation(invite);
        await sendInvitationEmail(invite);

        setIsProcessing(false);
    };

    const handleDeleteCandidate = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        setIsProcessing(true);
        await db.deleteCandidate(id);
        setIsProcessing(false);
    };

    const handleClearAllCandidates = async () => {
        if (!confirm("WARNING: This will permanently DELETE ALL candidates.\n\nAre you sure you want to proceed?")) return;

        const confirmText = prompt("Type 'DELETE' to confirm clearing all candidates:");
        if (confirmText !== 'DELETE') return;

        setIsProcessing(true);
        try {
            await db.clearAllCandidates();
            alert("All candidates have been deleted successfully.");
        } catch (error) {
            console.error(error);
            alert("Failed to delete some candidates. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm sticky top-0 z-10">
                <div className="flex justify-between items-center mb-4 max-w-7xl mx-auto w-full">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            Candidates & Invites
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 ml-12">Manage your talent pool and assessments</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleAutoHire} disabled={isProcesssing} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30 border-none transition-all hover:scale-105">
                            <Zap className="w-4 h-4 mr-2" /> Auto-Hire Pipeline
                        </Button>

                        <Button onClick={handleClearAllCandidates} disabled={isProcesssing || candidates.length === 0} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            <Trash2 className="w-4 h-4 mr-2" /> Clear All
                        </Button>

                        <div className="relative group">
                            <input
                                type="file"
                                accept=".csv"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                onChange={handleFileChange}
                            />
                            <Button variant="secondary" disabled={isProcesssing} className="relative z-10 transition-all group-hover:bg-gray-100 border-gray-200">
                                <Upload className="w-4 h-4 mr-2 text-indigo-500" />
                                {isProcesssing ? 'Importing...' : 'Upload CSV'}
                            </Button>
                        </div>
                        <Button onClick={() => setShowInviteModal(true)} className="shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
                            <Mail className="w-4 h-4 mr-2" /> Invite Candidate
                        </Button>
                    </div>
                </div>

                <div className="relative max-w-7xl mx-auto w-full mt-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search candidates by name, email, or status..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full animate-slide-up">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 font-semibold text-xs uppercase text-gray-500 tracking-wider">Name</th>
                                <th className="px-8 py-5 font-semibold text-xs uppercase text-gray-500 tracking-wider">Email</th>
                                <th className="px-8 py-5 font-semibold text-xs uppercase text-gray-500 tracking-wider">Status</th>
                                <th className="px-8 py-5 font-semibold text-xs uppercase text-gray-500 tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {candidates.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-24 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-2 shadow-inner">
                                                <UserPlus className="w-10 h-10 text-indigo-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">No candidates yet</h3>
                                            <p className="max-w-sm mx-auto text-gray-400 mb-4">Start by inviting individual candidates or upload a CSV to bulk import your talent pool.</p>
                                            <Button onClick={() => setShowInviteModal(true)} className="px-8 shadow-lg shadow-indigo-500/20">
                                                Add First Candidate
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                candidates.map((c, i) => (
                                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-8 py-5 font-medium text-gray-900 flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                                                ${i % 3 === 0 ? 'bg-indigo-500' : i % 3 === 1 ? 'bg-purple-500' : 'bg-pink-500'}
                                             `}>
                                                {c.name.charAt(0).toUpperCase()}
                                            </div>
                                            {c.name}
                                        </td>
                                        <td className="px-8 py-5 text-gray-600">{c.email}</td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${c.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                c.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                {c.status === 'Completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleCopyLink(c)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Copy Invite Link"
                                                >
                                                    <LinkIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleResendInvite(c)}
                                                    disabled={isProcesssing}
                                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold disabled:opacity-50"
                                                >
                                                    Resend Invite
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCandidate(c.id, c.name)}
                                                    disabled={isProcesssing}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Candidate"
                                                >
                                                    <Trash className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main >

            {/* Invite Modal */}
            {
                showInviteModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slide-up">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Send Invitation</h2>
                                <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                            </div>

                            <form onSubmit={handleAddCandidate} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Candidate Name</label>
                                    <input
                                        required
                                        value={newParams.name}
                                        onChange={e => setNewParams({ ...newParams, name: e.target.value })}
                                        className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="e.g. Jane Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={newParams.email}
                                        onChange={e => setNewParams({ ...newParams, email: e.target.value })}
                                        className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="e.g. jane@company.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Assessment</label>
                                    <div className="relative">
                                        <select
                                            className="w-full border border-gray-300 p-3 rounded-xl appearance-none bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all pr-10"
                                            value={selectedExam}
                                            onChange={e => setSelectedExam(e.target.value)}
                                        >
                                            <option value="">Select an assessment...</option>
                                            {exams.map(e => (
                                                <option key={e.id} value={e.id}>{e.title}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
                                    <Button type="button" variant="secondary" onClick={() => setShowInviteModal(false)} className="flex-1 py-3">Cancel</Button>
                                    <Button type="submit" disabled={isProcesssing} className="flex-1 py-3 shadow-lg shadow-indigo-500/20">
                                        {isProcesssing ? 'Sending...' : 'Send Invite'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
