import React, { useState, useEffect } from 'react';
import { getCompanies, updateCompanyVerification, getAllApplications, getJobs, assignAssessment, updateTestResult, assignInterview, markInterviewResult, assignOnboarding, approveOnboarding, sendOffer, createAnnouncement, getAllTickets, replyToTicket, forceUpdateApplicationStatus, Company, Application, Job, Ticket } from '../../services/workdayService';

export const AdminPanel: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [activeTab, setActiveTab] = useState<'companies' | 'applications' | 'jobs' | 'announcements' | 'tickets'>('companies');
    const [jobs, setJobs] = useState<Job[]>([]);
    
    const [activeActionId, setActiveActionId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<string>('');
    const [inputValue, setInputValue] = useState('');

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [annTitle, setAnnTitle] = useState('');
    const [annContent, setAnnContent] = useState('');
    const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
    const [replyMsg, setReplyMsg] = useState('');

    const loadData = async () => {
        const comps = await getCompanies();
        setCompanies(comps);
        const apps = await getAllApplications();
        setApplications(apps);
        const allJobs = await getJobs();
        setJobs(allJobs);
        const allTickets = await getAllTickets();
        setTickets(allTickets);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleVerify = async (companyId: string, currentStatus: boolean) => {
        await updateCompanyVerification(companyId, !currentStatus);
        await loadData();
    };

    const handleAction = async (appId: string, currentActionType?: string) => {
        const typeToUse = currentActionType || actionType;
        if (!inputValue && typeToUse !== 'approve_docs' && typeToUse !== 'send_offer' && !typeToUse.startsWith('mark_interview')) return;
        
        switch (typeToUse) {
            case 'assign_test': await assignAssessment(appId, inputValue); break;
            case 'update_score': await updateTestResult(appId, Number(inputValue)); break;
            case 'assign_interview': await assignInterview(appId, inputValue); break;
            case 'mark_interview_selected': await markInterviewResult(appId, 'Selected'); break;
            case 'mark_interview_rejected': await markInterviewResult(appId, 'Rejected'); break;
            case 'assign_onboarding': await assignOnboarding(appId, inputValue); break;
            case 'approve_docs': await approveOnboarding(appId); break;
            case 'send_offer': await sendOffer(appId); break;
            case 'force_status': await forceUpdateApplicationStatus(appId, inputValue); break;
        }
        
        setActiveActionId(null);
        setActionType('');
        setInputValue('');
        await loadData();
    };

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!annTitle || !annContent) return;
        await createAnnouncement({ title: annTitle, content: annContent });
        setAnnTitle('');
        setAnnContent('');
        alert('Announcement created!');
    };

    const handleReplyTicket = async (ticketId: string) => {
        if(!replyMsg) return;
        await replyToTicket(ticketId, replyMsg);
        setReplyTicketId(null);
        setReplyMsg('');
        await loadData();
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Mission Control</h1>
                    <p className="mt-2 text-lg text-slate-500">Platform governance and oversight.</p>
                </div>
            </div>

            <div className="bg-slate-100/70 p-1.5 rounded-2xl inline-flex w-full md:w-auto shadow-inner overflow-x-auto">
                <button
                    onClick={() => setActiveTab('companies')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'companies' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    🏢 Companies
                </button>
                <button
                    onClick={() => setActiveTab('jobs')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'jobs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    💼 Active Jobs
                </button>
                <button
                    onClick={() => setActiveTab('applications')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'applications' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    📄 Global Applications
                </button>
                <button
                    onClick={() => setActiveTab('announcements')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'announcements' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    📢 Announcements
                </button>
                <button
                    onClick={() => setActiveTab('tickets')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'tickets' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                    🎫 Support Tickets
                </button>
            </div>

            <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-full blur-3xl -mr-32 -mt-32 opacity-70 pointer-events-none"></div>

                {activeTab === 'companies' && (
                    <div className="p-8 relative z-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Manage Companies</h2>
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Company Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Verification Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {companies.map(c => (
                                        <tr key={c.companyId} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mr-3">{c.name.charAt(0)}</div>
                                                {c.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">{c.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${c.verified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                                    {c.verified ? '✓ Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleVerify(c.companyId, c.verified)}
                                                    className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-colors ${c.verified ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'}`}
                                                >
                                                    {c.verified ? 'Revoke Access' : 'Approve Company'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {companies.length === 0 && (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">No companies registered yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div className="p-8 relative z-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Global Application Stream</h2>
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Target Job / Company</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pipeline Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Applied Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {applications.map(app => (
                                        <tr key={app.applicationId} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{app.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-900">{app.jobTitle}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{app.companyName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border
                                                    ${app.status === 'Applied' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                                    app.status === 'Shortlisted' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                                    app.status === 'Test Assigned' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                    app.status === 'Test Completed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                    app.status === 'Interview' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    app.status === 'Selected' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    app.status === 'Onboarding Complete' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    'bg-red-50 text-red-700 border-red-200'}`}>
                                                    {app.finalStatus === 'Offer Sent' ? 'Offer Sent 🎉' : app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                                                {app.appliedAt?.toDate ? app.appliedAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                {activeActionId === app.applicationId ? (
                                                    <div className="flex flex-col space-y-2 max-w-[200px]">
                                                        {(actionType === 'assign_test' || actionType === 'assign_interview' || actionType === 'assign_onboarding') && (
                                                            <input type="text" placeholder="Paste Link" value={inputValue} onChange={e => setInputValue(e.target.value)} className="px-2 py-1 text-xs border border-slate-300 rounded" />
                                                        )}
                                                        {actionType === 'update_score' && (
                                                            <input type="number" placeholder="Enter Score" value={inputValue} onChange={e => setInputValue(e.target.value)} className="px-2 py-1 text-xs border border-slate-300 rounded" />
                                                        )}
                                                        {actionType === 'force_status' && (
                                                            <select value={inputValue} onChange={e => setInputValue(e.target.value)} className="px-2 py-1 text-xs border border-slate-300 rounded">
                                                                <option value="">Select Process...</option>
                                                                <option value="Applied">Applied</option>
                                                                <option value="Shortlisted">Shortlisted</option>
                                                                <option value="Test Assigned">Test Assigned</option>
                                                                <option value="Test Completed">Test Completed</option>
                                                                <option value="Interview">Interview</option>
                                                                <option value="Selected">Selected</option>
                                                                <option value="Rejected">Rejected</option>
                                                                <option value="Onboarding Complete">Onboarding Complete</option>
                                                            </select>
                                                        )}
                                                        <div className="flex space-x-2">
                                                            <button onClick={() => handleAction(app.applicationId!)} className="px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700">Submit</button>
                                                            <button onClick={() => { setActiveActionId(null); setActionType(''); setInputValue(''); }} className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300">Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2 max-w-[200px]">
                                                        {app.status === 'Applied' && (
                                                            <button onClick={() => {setActiveActionId(app.applicationId!); setActionType('assign_test');}} className="px-2 py-1 bg-purple-50 text-purple-600 border border-purple-200 rounded text-xs hover:bg-purple-100">Assign Test</button>
                                                        )}
                                                        {app.status === 'Test Assigned' && (
                                                            <button onClick={() => {setActiveActionId(app.applicationId!); setActionType('update_score');}} className="px-2 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded text-xs hover:bg-indigo-100">Update Score</button>
                                                        )}
                                                        {app.status === 'Test Completed' && (
                                                            <button onClick={() => {setActiveActionId(app.applicationId!); setActionType('assign_interview');}} className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded text-xs hover:bg-blue-100">Assign Interview</button>
                                                        )}
                                                        {app.status === 'Interview' && (
                                                            <>
                                                                <button onClick={() => {handleAction(app.applicationId!, 'mark_interview_selected');}} className="px-2 py-1 bg-green-50 text-green-600 border border-green-200 rounded text-xs hover:bg-green-100">Pass Interview</button>
                                                                <button onClick={() => {handleAction(app.applicationId!, 'mark_interview_rejected');}} className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded text-xs hover:bg-red-100">Reject</button>
                                                            </>
                                                        )}
                                                        {app.status === 'Selected' && !app.onboarding?.assigned && (
                                                            <button onClick={() => {setActiveActionId(app.applicationId!); setActionType('assign_onboarding');}} className="px-2 py-1 bg-teal-50 text-teal-600 border border-teal-200 rounded text-xs hover:bg-teal-100">Assign Docs Link</button>
                                                        )}
                                                        {app.status === 'Selected' && app.onboarding?.assigned && app.onboarding?.status === 'Pending' && (
                                                            <button onClick={() => {handleAction(app.applicationId!, 'approve_docs');}} className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-xs hover:bg-emerald-100">Approve Docs</button>
                                                        )}
                                                        {app.status === 'Onboarding Complete' && app.finalStatus !== 'Offer Sent' && (
                                                            <button onClick={() => {handleAction(app.applicationId!, 'send_offer');}} className="px-2 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded text-xs hover:bg-amber-100 font-bold">Send Offer</button>
                                                        )}
                                                        <button onClick={() => {setActiveActionId(app.applicationId!); setActionType('force_status');}} className="px-2 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded text-xs hover:bg-slate-100 w-full mt-1">Override Process</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {applications.length === 0 && (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">No applications have been processed yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div className="p-8 relative z-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Active Global Jobs</h2>
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Job Title</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Posted By</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Location & Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Listing Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {jobs.map(job => (
                                        <tr key={job.jobId} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-slate-900">{job.title}</div>
                                                <div className="text-xs text-indigo-600 font-semibold mt-0.5">{job.salary}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">{job.companyName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-700">{job.location}</div>
                                                <div className="text-xs text-slate-400 mt-0.5">{job.type}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                                                {job.postedAt?.toDate ? job.postedAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                    {jobs.length === 0 && (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">No jobs have been posted globally yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'announcements' && (
                    <div className="p-8 relative z-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Create Public Announcement</h2>
                        <form onSubmit={handleCreateAnnouncement} className="space-y-4 max-w-xl">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                                <input type="text" value={annTitle} onChange={e => setAnnTitle(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Content</label>
                                <textarea value={annContent} onChange={e => setAnnContent(e.target.value)} required rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            <button type="submit" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">Post Announcement</button>
                        </form>
                    </div>
                )}

                {activeTab === 'tickets' && (
                    <div className="p-8 relative z-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Support Tickets</h2>
                        <div className="space-y-4">
                            {tickets.map(ticket => (
                                <div key={ticket.ticketId} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                    <div className="flex justify-between mb-4">
                                        <div>
                                            <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${ticket.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{ticket.status}</span>
                                            <span className="text-xs text-slate-500 ml-3">User ID: {ticket.userId}</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-800 font-medium mb-4">{ticket.message}</p>
                                    
                                    {ticket.status === 'Open' && replyTicketId !== ticket.ticketId && (
                                        <button onClick={() => setReplyTicketId(ticket.ticketId!)} className="text-sm font-bold text-blue-600 hover:text-blue-800">Reply</button>
                                    )}
                                    
                                    {replyTicketId === ticket.ticketId && (
                                        <div className="mt-4 flex gap-2">
                                            <input type="text" value={replyMsg} onChange={e => setReplyMsg(e.target.value)} placeholder="Type your reply..." className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                                            <button onClick={() => handleReplyTicket(ticket.ticketId!)} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">Send</button>
                                            <button onClick={() => setReplyTicketId(null)} className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-300">Cancel</button>
                                        </div>
                                    )}

                                    {ticket.reply && (
                                        <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                                            <p className="text-xs font-bold text-blue-600 mb-1">Admin Reply:</p>
                                            <p className="text-sm text-slate-600">{ticket.reply}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {tickets.length === 0 && <p className="text-slate-500">No support tickets found.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
