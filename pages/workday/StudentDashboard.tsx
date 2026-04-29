import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWorkdayAuth } from '../../contexts/WorkdayAuthContext';
import { saveUserProfile, uploadResume, subscribeToApplicationsForStudent, subscribeToAnnouncements, subscribeToTickets, createTicket, respondToOffer, Application, Announcement, Ticket } from '../../services/workdayService';
import { XCircle, Download, ExternalLink, CheckCircle2 } from 'lucide-react';

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
        <div className="space-y-10 max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] rounded-3xl p-8 sm:p-10 border border-slate-100 relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl -mr-32 -mt-32 opacity-70 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 mb-8 tracking-tight relative z-10 inline-block">My Profile</h2>
                
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

            <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] rounded-3xl p-8 sm:p-10 border border-slate-100 relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full blur-3xl -ml-32 -mt-32 opacity-70 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-orange-800 to-slate-900 mb-8 tracking-tight relative z-10 inline-block">Sentinel Actions & Onboarding</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 w-full">
                    <Link to={user ? `/verify-docs/${user.uid}` : '#'} className="block group/card">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full shadow-sm hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300 transform group-hover/card:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full opacity-50 transition-transform group-hover/card:scale-150 duration-500"></div>
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover/card:scale-110 group-hover/card:bg-blue-600 group-hover/card:text-white transition-all duration-300 relative z-10 shadow-sm">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover/card:text-blue-700 transition-colors relative z-10">Verify Documents</h3>
                            <p className="text-sm text-slate-500 relative z-10">Upload your employment documents and track verification status.</p>
                        </div>
                    </Link>

                    <Link to="/submit-task" className="block group/card">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full shadow-sm hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-300 transition-all duration-300 transform group-hover/card:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full opacity-50 transition-transform group-hover/card:scale-150 duration-500"></div>
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover/card:scale-110 group-hover/card:bg-purple-600 group-hover/card:text-white transition-all duration-300 relative z-10 shadow-sm">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover/card:text-purple-700 transition-colors relative z-10">Submit Interview Tasks</h3>
                            <p className="text-sm text-slate-500 relative z-10">Complete and deliver technical assignments requested by interviewers.</p>
                        </div>
                    </Link>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full shadow-sm hover:shadow-lg hover:shadow-slate-500/10 hover:border-slate-300 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group/card">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full opacity-50 transition-transform group-hover/card:scale-150 duration-500"></div>
                        <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-4 group-hover/card:scale-110 group-hover/card:bg-slate-800 group-hover/card:text-white transition-all duration-300 relative z-10 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover/card:text-slate-800 transition-colors relative z-10">Assessments & Interviews</h3>
                        <p className="text-sm text-slate-500 relative z-10">Links for live exams and interviews appear directly in your dashboard.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] rounded-3xl p-8 sm:p-10 border border-slate-100 relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full blur-3xl -ml-32 -mt-32 opacity-70 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 mb-8 tracking-tight relative z-10 inline-block">Application History</h2>
                
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
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border shadow-sm transition-all duration-300 hover:scale-105
                                                ${app.finalStatus === 'Offer Accepted' ? 'bg-green-600 text-white shadow-sm border-green-700' :
                                                app.finalStatus === 'Offer Rejected' ? 'bg-red-600 text-white shadow-sm border-red-700' :
                                                app.status === 'Applied' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:shadow-yellow-200' : 
                                                app.status === 'Shortlisted' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:shadow-blue-200' : 
                                                app.status === 'Test Assigned' ? 'bg-purple-50 text-purple-700 border-purple-200 hover:shadow-purple-200 animate-pulse' :
                                                app.status === 'Test Completed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:shadow-indigo-200' :
                                                app.status === 'Interview' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:shadow-blue-200 animate-pulse' :
                                                app.status === 'Document Verification' ? 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:shadow-cyan-200 animate-pulse' :
                                                app.status === 'Selected' ? 'bg-green-50 text-green-700 border-green-200 hover:shadow-green-200' :
                                                app.status === 'Onboarding Complete' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:shadow-emerald-200' :
                                                'bg-red-50 text-red-700 border-red-200 hover:shadow-red-200'}`}>
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
                <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 border border-slate-100 relative overflow-hidden">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                        Public Announcements
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {announcements.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No announcements at this time.</p>
                        ) : (
                            announcements.map(ann => (
                                <div key={ann.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <h4 className="font-bold text-slate-800 text-sm">{ann.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1 mb-2">
                                        {ann.postedAt?.toDate ? ann.postedAt.toDate().toLocaleDateString() : 'Recent'}
                                    </p>
                                    <p className="text-sm text-slate-600">{ann.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Support Tickets */}
                <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 border border-slate-100 relative overflow-hidden flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        Support Tickets
                    </h3>
                    
                    <div className="flex-1 space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar mb-6">
                        {tickets.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">You have no active support tickets.</p>
                        ) : (
                            tickets.map(ticket => (
                                <div key={ticket.ticketId} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${ticket.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'}`}>
                                            {ticket.status}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-700 font-medium mb-2">{ticket.message}</p>
                                    {ticket.reply && (
                                        <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                                            <p className="text-xs font-bold text-blue-600 mb-1">Admin Reply:</p>
                                            <p className="text-sm text-slate-600">{ticket.reply}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleCreateTicket} className="mt-auto">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={ticketMsg} 
                                onChange={(e) => setTicketMsg(e.target.value)} 
                                placeholder="Need help? Describe your issue..." 
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button 
                                type="submit" 
                                disabled={!ticketMsg.trim()}
                                className="px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors"
                            >
                                Send
                            </button>
                        </div>
                    </form>
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
