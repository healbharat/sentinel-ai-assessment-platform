import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWorkdayAuth } from '../../contexts/WorkdayAuthContext';
import { saveUserProfile, uploadResume, subscribeToApplicationsForStudent, subscribeToAnnouncements, subscribeToTickets, createTicket, respondToOffer, Application, Announcement, Ticket } from '../../services/workdayService';
import { XCircle, Download, ExternalLink, CheckCircle2, MessageCircle, Bell, Send, Calendar, User, Briefcase, ShieldCheck, Rocket, HelpCircle } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
    const { user, profile, refreshProfile } = useWorkdayAuth();
    const [phone, setPhone] = useState(profile?.phone || '');
    const [skills, setSkills] = useState(profile?.skills?.join(', ') || '');
    const [education, setEducation] = useState(profile?.education || '');
    const [resumeLink, setResumeLink] = useState(profile?.resumeURL || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [applications, setApplications] = useState<Application[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [ticketMsg, setTicketMsg] = useState('');
    const [selectedOffer, setSelectedOffer] = useState<Application | null>(null);
    const [activeSupportTab, setActiveSupportTab] = useState<'tickets' | 'chatbot'>('tickets');
    const [chatbotMessages, setChatbotMessages] = useState<{sender: 'user' | 'ai', text: string}[]>([
        {sender: 'ai', text: 'Hello! I am Sentinel AI. How can I help you today? You can ask me about assessments, interviews, or profile updates.'}
    ]);
    const [chatbotInput, setChatbotInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (profile) {
            setPhone(profile.phone || '');
            setSkills(profile.skills?.join(', ') || '');
            setEducation(profile.education || '');
            setResumeLink(profile.resumeURL || '');
        }
        if (user) {
            const unsubApps = subscribeToApplicationsForStudent(user.uid, setApplications);
            const unsubTickets = subscribeToTickets(user.uid, setTickets);
            const unsubAnns = subscribeToAnnouncements(setAnnouncements);
            return () => { unsubApps(); unsubTickets(); unsubAnns(); };
        }
    }, [profile, user]);

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!ticketMsg.trim() || !user) return;
        await createTicket(user.uid, ticketMsg);
        setTicketMsg('');
    };

    const handleChatbotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!chatbotInput.trim()) return;

        const userMsg = chatbotInput.trim();
        setChatbotMessages(prev => [...prev, {sender: 'user', text: userMsg}]);
        setChatbotInput('');
        setIsTyping(true);

        // Simulate AI Response
        setTimeout(() => {
            let aiResponse = "I'm not sure about that. Would you like to create a support ticket for our human team?";
            const msg = userMsg.toLowerCase();

            if (msg.includes('assessment') || msg.includes('test')) {
                aiResponse = "Assessments are assigned by companies. Once assigned, you'll see a 'Start Assessment' button in your Application History.";
            } else if (msg.includes('interview')) {
                aiResponse = "Interviews can be scheduled once you are shortlisted. Look for the 'Select Interview Slot' button in your dashboard.";
            } else if (msg.includes('profile') || msg.includes('resume')) {
                aiResponse = "You can update your phone, skills, and resume link in the 'My Profile' section at the top of this dashboard.";
            } else if (msg.includes('offer')) {
                aiResponse = "If a company sends you an offer, a 'Review Offer' button will appear in your applications table. You can then accept or decline it.";
            } else if (msg.includes('hello') || msg.includes('hi')) {
                aiResponse = "Hello! I'm Sentinel AI. I can guide you through the assessment and hiring process. What's on your mind?";
            }

            setChatbotMessages(prev => [...prev, {sender: 'ai', text: aiResponse}]);
            setIsTyping(false);
        }, 1000);
    };

    const handleOfferResponse = async (response: 'Accepted' | 'Rejected') => {
        if (!selectedOffer) return;
        setLoading(true);
        try {
            await respondToOffer(selectedOffer.applicationId!, response);
            setSelectedOffer(null);
            setMessage(`Offer ${response} successfully!`);
        } catch (err) {
            console.error(err);
            setMessage('Error processing offer response.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await saveUserProfile(user.uid, {
                phone,
                skills: skills.split(',').map(s => s.trim()),
                education,
                resumeURL: resumeLink
            });
            await refreshProfile();
            setMessage('Profile updated successfully!');
        } catch (err: any) {
            setMessage('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-sans bg-slate-50/30">
            <div className="bg-white shadow-premium rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 relative overflow-hidden transition-all duration-500 hover:shadow-2xl group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full blur-3xl -mr-48 -mt-48 opacity-70 pointer-events-none group-hover:scale-125 transition-transform duration-1000"></div>
                <div className="flex items-center gap-4 mb-10 relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 animate-float">
                        <User className="w-6 h-6" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">My Profile</h2>
                </div>
                
                {message && (
                    <div className={`mb-8 p-4 rounded-xl text-sm font-medium border relative z-10 ${message.startsWith('Error') ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                        {message}
                    </div>
                )}
                
                <form onSubmit={handleUpdateProfile} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                            <input type="text" disabled value={profile?.name || ''} className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-slate-500 cursor-not-allowed sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                            <input type="text" disabled value={profile?.email || ''} className="w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-slate-500 cursor-not-allowed sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Education</label>
                            <input type="text" value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g. B.S. Computer Science" className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm shadow-sm" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Skills (comma separated)</label>
                            <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js, Python, Leadership" className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm shadow-sm" />
                        </div>
                        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Resume Link (Google Drive, LinkedIn, etc.)</label>
                            <p className="text-xs text-slate-500 mb-4">Make sure your link is set to "Anyone with the link can view".</p>
                            <input 
                                type="url" 
                                value={resumeLink} 
                                onChange={(e) => setResumeLink(e.target.value)}
                                placeholder="https://docs.google.com/document/d/..." 
                                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm shadow-sm"
                            />
                            {profile?.resumeURL && (
                                <div className="mt-4 flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg max-w-max border border-blue-100">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                    <a href={profile.resumeURL} target="_blank" rel="noreferrer" className="font-medium hover:underline text-sm truncate max-w-xs " style={{maxWidth: '300px'}}>{profile.resumeURL}</a>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all shadow-md hover:shadow-blue-500/30 transform hover:-translate-y-0.5 disabled:transform-none">
                            {loading ? 'Saving...' : 'Save Profile Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white shadow-premium rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 relative overflow-hidden transition-all duration-500 hover:shadow-2xl group">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-400/10 via-yellow-400/10 to-red-400/10 rounded-full blur-3xl -ml-48 -mt-48 opacity-70 pointer-events-none group-hover:scale-125 transition-transform duration-1000"></div>
                <div className="flex items-center gap-4 mb-10 relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200 animate-float">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Sentinel Actions & Onboarding</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 w-full">
                    <Link to={user ? `/verify-docs/${user.uid}` : '#'} className="block group/card">
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 h-full shadow-premium hover:shadow-2xl hover:border-blue-400 transition-all duration-500 transform group-hover/card:-translate-y-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-bl-full opacity-50 transition-transform group-hover/card:scale-150 duration-700"></div>
                            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 group-hover/card:scale-110 transition-all duration-500 shadow-lg shadow-blue-200">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-3 group-hover/card:text-blue-700 transition-colors relative z-10">Verify Documents</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed relative z-10">Securely upload and manage your employment documents for verification.</p>
                        </div>
                    </Link>

                    <Link to="/submit-task" className="block group/card">
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 h-full shadow-premium hover:shadow-2xl hover:border-purple-400 transition-all duration-500 transform group-hover/card:-translate-y-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-bl-full opacity-50 transition-transform group-hover/card:scale-150 duration-700"></div>
                            <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-pink-600 text-white rounded-2xl flex items-center justify-center mb-6 group-hover/card:scale-110 transition-all duration-500 shadow-lg shadow-purple-200">
                                <Rocket className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-3 group-hover/card:text-purple-700 transition-colors relative z-10">Submit Interview Tasks</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed relative z-10">Upload and submit your technical assessments directly to recruitment teams.</p>
                        </div>
                    </Link>

                    <div className="bg-white border border-slate-200 rounded-3xl p-8 h-full shadow-premium hover:shadow-2xl hover:border-amber-400 transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden group/card">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-bl-full opacity-50 transition-transform group-hover/card:scale-150 duration-700"></div>
                        <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl flex items-center justify-center mb-6 group-hover/card:scale-110 transition-all duration-500 shadow-lg shadow-amber-200">
                            <Calendar className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-3 group-hover/card:text-amber-700 transition-colors relative z-10">Assessments & Interviews</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed relative z-10">Stay updated with your scheduled interview slots and live assessment links.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-premium rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 relative overflow-hidden transition-all duration-500 hover:shadow-2xl group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/10 via-blue-400/10 to-cyan-400/10 rounded-full blur-3xl -mr-48 -mt-48 opacity-70 pointer-events-none group-hover:scale-125 transition-transform duration-1000"></div>
                <div className="flex items-center gap-4 mb-10 relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 animate-float">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Application History</h2>
                </div>
                
                {applications.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 relative z-10">
                        <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        <h3 className="mt-4 text-sm font-medium text-slate-900">No applications yet</h3>
                        <p className="mt-1 text-sm text-slate-500">Get started by browsing our job board.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 relative z-10">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Job Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date Applied</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {applications.map(app => (
                                    <tr key={app.applicationId} className="hover:bg-slate-50/80 transition-all duration-200 group/row">
                                        <td className="px-6 py-4 whitespace-nowrap transform group-hover/row:translate-x-1 transition-transform">
                                            <div className="text-sm font-bold text-slate-900">{app.jobTitle || 'Unknown Job'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">{app.companyName || 'Unknown Company'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-4 py-1.5 inline-flex text-xs leading-5 font-black rounded-xl border shadow-sm transition-all duration-300 hover:scale-105 uppercase tracking-wider
                                                ${app.finalStatus === 'Offer Accepted' ? 'bg-emerald-500 text-white shadow-emerald-200 border-emerald-600' :
                                                app.finalStatus === 'Offer Rejected' ? 'bg-rose-500 text-white shadow-rose-200 border-rose-600' :
                                                app.status === 'Applied' ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-50' : 
                                                app.status === 'Shortlisted' ? 'bg-sky-50 text-sky-700 border-sky-200 shadow-sky-50' : 
                                                app.status === 'Test Assigned' ? 'bg-violet-600 text-white border-violet-700 shadow-violet-200 animate-pulse' :
                                                app.status === 'Test Completed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                app.status === 'Interview' ? 'bg-blue-600 text-white border-blue-700 shadow-blue-200 animate-pulse' :
                                                app.status === 'Document Verification' ? 'bg-cyan-600 text-white border-cyan-700 shadow-cyan-200 animate-pulse' :
                                                app.status === 'Selected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                app.status === 'Onboarding Complete' ? 'bg-teal-500 text-white border-teal-600 shadow-teal-200' :
                                                'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                                {app.finalStatus === 'Offer Sent' ? 'Offer Sent 🎉' : 
                                                 app.finalStatus === 'Offer Accepted' ? 'Accepted ✓' :
                                                 app.finalStatus === 'Offer Rejected' ? 'Declined ✗' :
                                                 app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                                            {app.appliedAt?.toDate ? app.appliedAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {app.finalStatus === 'Offer Sent' ? (
                                                <button 
                                                    onClick={() => setSelectedOffer(app)}
                                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95"
                                                >
                                                    Review Offer
                                                </button>
                                            ) : app.finalStatus === 'Offer Accepted' ? (
                                                <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                                    <CheckCircle2 className="w-4 h-4" /> Accepted
                                                </span>
                                            ) : app.finalStatus === 'Offer Rejected' ? (
                                                <span className="text-red-500 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">Offer Rejected</span>
                                            ) : app.status === 'Rejected' ? (
                                                <span className="text-red-500 font-semibold">Rejected</span>
                                            ) : app.status === 'Test Assigned' && app.assessment?.assigned && app.assessment?.status === 'Pending' ? (
                                                <div className="relative inline-block">
                                                    <div className="absolute inset-0 bg-indigo-500 rounded-md blur opacity-30 animate-pulse"></div>
                                                    <a href={app.assessment.testLink} target="_blank" rel="noopener noreferrer" 
                                                       className="relative inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200">
                                                        Start Assessment
                                                    </a>
                                                </div>
                                            ) : app.status === 'Test Completed' ? (
                                                <span className="text-slate-500 font-semibold">Test Completed</span>
                                            ) : app.status === 'Interview' && app.interview?.assigned && app.interview?.status === 'Scheduled' ? (
                                                <div className="relative inline-block">
                                                    <div className="absolute inset-0 bg-blue-500 rounded-md blur opacity-30 animate-pulse"></div>
                                                    <a href={app.interview.slotLink} target="_blank" rel="noopener noreferrer" 
                                                       className="relative inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200">
                                                        Select Interview Slot
                                                    </a>
                                                </div>
                                            ) : (app.status === 'Document Verification' || app.status === 'Selected') && app.onboarding?.assigned && app.onboarding?.status === 'Pending' ? (
                                                <div className="relative inline-block">
                                                    <div className="absolute inset-0 bg-emerald-500 rounded-md blur opacity-30 animate-pulse"></div>
                                                    <a href={app.onboarding.documentLink} target="_blank" rel="noopener noreferrer" 
                                                       className="relative inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-md shadow-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transform hover:-translate-y-0.5 transition-all duration-200">
                                                        Upload Documents
                                                    </a>
                                                </div>
                                            ) : app.status === 'Selected' ? (
                                                <span className="text-blue-600 font-semibold">Next Stage Open</span>
                                            ) : app.status === 'Onboarding Complete' ? (
                                                <span className="text-emerald-600 font-semibold">Verified</span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Support and Announcements Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 w-full">
                {/* Announcements */}
                <div className="bg-white shadow-premium rounded-[2.5rem] p-8 border border-slate-100 relative overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                            <Bell className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Announcements</h3>
                    </div>
                    <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {announcements.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                <Bell className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm font-medium italic">No announcements at this time.</p>
                            </div>
                        ) : (
                            announcements.map(ann => (
                                <div key={ann.id} className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 shadow-sm hover:border-amber-200 transition-colors group/ann">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-black text-slate-800 text-base group-hover/ann:text-amber-700 transition-colors">{ann.title}</h4>
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase">
                                            {ann.postedAt?.toDate ? ann.postedAt.toDate().toLocaleDateString() : 'Recent'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">{ann.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Support Tickets */}
                <div className="bg-white shadow-premium rounded-[2.5rem] p-8 border border-slate-100 relative overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Support</h3>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button 
                                onClick={() => setActiveSupportTab('tickets')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeSupportTab === 'tickets' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Tickets
                            </button>
                            <button 
                                onClick={() => setActiveSupportTab('chatbot')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeSupportTab === 'chatbot' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                AI Chatbot
                            </button>
                        </div>
                    </div>

                    {activeSupportTab === 'tickets' ? (
                        <>
                            <div className="flex-1 space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                                {tickets.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                        <HelpCircle className="w-12 h-12 mb-3 opacity-20" />
                                        <p className="text-sm font-medium italic">You have no active support tickets.</p>
                                    </div>
                                ) : (
                                    tickets.map(ticket => (
                                        <div key={ticket.ticketId} className="space-y-3">
                                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm relative group/ticket">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border shadow-sm
                                                        ${ticket.status === 'Open' ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-200 text-slate-700 border-slate-300'}`}>
                                                        {ticket.status}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <Calendar className="w-3 h-3" />
                                                        <span className="text-[10px] font-bold">
                                                            {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleDateString() : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-700 font-bold leading-relaxed">{ticket.message}</p>
                                            </div>
                                            
                                            {ticket.reply && (
                                                <div className="ml-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm relative animate-slide-in-right">
                                                    <div className="absolute -left-3 top-4 w-6 h-6 bg-blue-50 border-l border-t border-blue-100 transform -rotate-45"></div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                                                        <p className="text-xs font-black text-blue-700 uppercase tracking-wider">Admin Response</p>
                                                    </div>
                                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{ticket.reply}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={handleCreateTicket} className="mt-auto relative">
                                <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                                    <input 
                                        type="text" 
                                        value={ticketMsg} 
                                        onChange={(e) => setTicketMsg(e.target.value)} 
                                        placeholder="Describe your issue..." 
                                        className="flex-1 bg-transparent border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-0 text-slate-700"
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!ticketMsg.trim()}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-black hover:shadow-lg hover:shadow-blue-200 disabled:opacity-50 transition-all flex items-center gap-2 group"
                                    >
                                        Send
                                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="flex-1 space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                                {chatbotMessages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                        <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed
                                            ${msg.sender === 'user' 
                                                ? 'bg-gradient-to-tr from-indigo-600 to-blue-600 text-white rounded-tr-none' 
                                                : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start animate-pulse">
                                        <div className="bg-slate-50 text-slate-400 p-3 rounded-2xl text-xs font-bold border border-slate-100">
                                            Sentinel AI is typing...
                                        </div>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleChatbotSubmit} className="mt-auto relative">
                                <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                                    <input 
                                        type="text" 
                                        value={chatbotInput} 
                                        onChange={(e) => setChatbotInput(e.target.value)} 
                                        placeholder="Ask Sentinel AI something..." 
                                        className="flex-1 bg-transparent border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-0 text-slate-700"
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!chatbotInput.trim() || isTyping}
                                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-black hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-50 transition-all flex items-center gap-2 group"
                                    >
                                        Ask AI
                                        <Rocket className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
            {/* Offer Review Modal */}
            {selectedOffer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in">
                        <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                            <div>
                                <h3 className="text-xl font-black tracking-tight">Offer Letter Review</h3>
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1">{selectedOffer.jobTitle}</p>
                            </div>
                            <button onClick={() => setSelectedOffer(null)} className="hover:rotate-90 transition-transform">
                                <XCircle className="w-8 h-8" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-8">
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Download className="w-4 h-4 text-indigo-600" /> 1. Download Offer Letter
                                </h4>
                                <p className="text-sm text-slate-500 mb-6 font-medium">Please download and read your offer letter carefully before responding.</p>
                                <a 
                                    href={selectedOffer.offerLetterURL} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-black text-sm hover:bg-indigo-50 transition-all shadow-sm"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Offer PDF
                                </a>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4 text-indigo-600" /> 2. Review Company Policies
                                </h4>
                                <p className="text-sm text-slate-500 mb-6 font-medium">By accepting this offer, you agree to the Heal Bharat Services terms and guidelines.</p>
                                <a 
                                    href="https://www.healbharatservices.com/#/policies-guidelines" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 text-indigo-600 font-black text-sm hover:underline"
                                >
                                    View Policies & Guidelines <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => handleOfferResponse('Accepted')}
                                    disabled={loading}
                                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Accept Offer'}
                                </button>
                                <button 
                                    onClick={() => {
                                        if(confirm('Are you sure you want to reject this offer? This action cannot be undone.')) {
                                            handleOfferResponse('Rejected');
                                        }
                                    }}
                                    disabled={loading}
                                    className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-400 rounded-2xl font-black hover:border-red-200 hover:text-red-600 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
