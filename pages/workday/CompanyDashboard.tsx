import React, { useState, useEffect } from 'react';
import { useWorkdayAuth } from '../../contexts/WorkdayAuthContext';
import { 
    createJob, getJobs, updateApplicationStatus, 
    assignAssessment, assignInterview, assignVerification, sendOfferLetter, Job, Application 
} from '../../services/workdayService';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { 
    Briefcase, Users, CheckCircle, XCircle, Send, 
    Calendar, ClipboardCheck, ArrowRight, LayoutDashboard,
    Search, Filter, ChevronDown, ChevronRight, Plus
} from 'lucide-react';

type Stage = 'All' | 'Applied' | 'Shortlisted' | 'Test Assigned' | 'Interview' | 'Document Verification' | 'Selected' | 'Rejected';

export const CompanyDashboard: React.FC = () => {
    const { profile, user } = useWorkdayAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [appsByJob, setAppsByJob] = useState<Record<string, Application[]>>({});
    const [activeStage, setActiveStage] = useState<Stage>('All');
    const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Create Job Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [salary, setSalary] = useState('');
    const [type, setType] = useState('Full-time');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState('');

    // Action State
    const [actioningAppId, setActioningAppId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'Test' | 'Interview' | 'Verification' | 'Offer' | null>(null);
    const [actionLink, setActionLink] = useState('');

    useEffect(() => {
        if (!user) return;
        
        // Subscribe to Jobs
        const jobsRef = collection(db, 'jobs');
        const qJobs = query(jobsRef, where("companyId", "==", user.uid));
        const unsubJobs = onSnapshot(qJobs, (snap) => {
            const fetched = snap.docs.map(doc => doc.data() as Job);
            setJobs(fetched);
        });

        // Subscribe to ALL Applications for this company's jobs
        const appsRef = collection(db, 'applications');
        const unsubApps = onSnapshot(appsRef, (snap) => {
            const allApps = snap.docs.map(doc => doc.data() as Application);
            // Group by JobId
            const grouped: Record<string, Application[]> = {};
            allApps.forEach(app => {
                if (!grouped[app.jobId]) grouped[app.jobId] = [];
                grouped[app.jobId].push(app);
            });
            setAppsByJob(grouped);
        });

        return () => {
            unsubJobs();
            unsubApps();
        };
    }, [user]);

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createJob({
                companyId: user.uid,
                companyName: profile?.name || 'Unknown',
                title,
                location,
                salary,
                type,
                description,
                requirements: requirements.split(',').map(r => r.trim())
            });
            setShowCreateModal(false);
            setTitle(''); setLocation(''); setSalary(''); setType('Full-time'); setDescription(''); setRequirements('');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAction = async (jobId: string, fromStatus: string, toStatus: string) => {
        const targets = (appsByJob[jobId] || []).filter(a => a.status === fromStatus);
        if (targets.length === 0) return;
        
        if (!confirm(`Move all ${targets.length} candidates from ${fromStatus} to ${toStatus}?`)) return;

        for (const app of targets) {
            await updateApplicationStatus(app.applicationId!, toStatus);
        }
    };

    const processNextStep = async (app: Application, jobId: string) => {
        if (app.status === 'Applied') {
            await updateApplicationStatus(app.applicationId!, 'Shortlisted');
        } else if (app.status === 'Shortlisted') {
            setActioningAppId(app.applicationId!);
            setActionType('Test');
        } else if (app.status === 'Test Completed' || app.status === 'Test Assigned') {
            setActioningAppId(app.applicationId!);
            setActionType('Interview');
        } else if (app.status === 'Interview') {
            setActioningAppId(app.applicationId!);
            setActionType('Verification');
        } else if (app.status === 'Document Verification' || app.status === 'Onboarding Complete' || (app.status === 'Selected' && !app.finalStatus)) {
            setActioningAppId(app.applicationId!);
            setActionType('Offer');
        }
    };

    const submitAction = async (jobId: string) => {
        if (!actioningAppId || !actionLink) return;
        setLoading(true);
        try {
            if (actionType === 'Test') {
                await assignAssessment(actioningAppId, actionLink, user?.uid);
            } else if (actionType === 'Interview') {
                await assignInterview(actioningAppId, actionLink, user?.uid);
            } else if (actionType === 'Verification') {
                await assignVerification(actioningAppId, actionLink, user?.uid);
            } else if (actionType === 'Offer') {
                await sendOfferLetter(actioningAppId, actionLink, user?.uid);
            }
            setActioningAppId(null);
            setActionType(null);
            setActionLink('');
        } catch (err) {
            console.error("Action failed:", err);
            alert("Failed to submit action. Please check your connection and permissions.");
        } finally {
            setLoading(false);
        }
    };

    const [selectedApps, setSelectedApps] = useState<string[]>([]);

    const handleSelectApp = (appId: string) => {
        setSelectedApps(prev => 
            prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
        );
    };

    const handleSelectAll = (jobId: string) => {
        const apps = filteredApps(jobId).map(a => a.applicationId!);
        const allSelected = apps.every(id => selectedApps.includes(id));
        if (allSelected) {
            setSelectedApps(prev => prev.filter(id => !apps.includes(id)));
        } else {
            setSelectedApps(prev => Array.from(new Set([...prev, ...apps])));
        }
    };

    const handleBulkStatusChange = async (newStatus: string) => {
        if (selectedApps.length === 0) return;
        if (!confirm(`Move ${selectedApps.length} candidates to ${newStatus}?`)) return;
        
        setLoading(true);
        for (const id of selectedApps) {
            await updateApplicationStatus(id, newStatus);
        }
        setSelectedApps([]);
        setLoading(false);
    };

    const handleBulkAssign = async () => {
        if (selectedApps.length === 0 || !actionLink || !actionType) return;
        
        setLoading(true);
        try {
            for (const id of selectedApps) {
                if (actionType === 'Test') {
                    await assignAssessment(id, actionLink, user?.uid);
                } else if (actionType === 'Interview') {
                    await assignInterview(id, actionLink, user?.uid);
                } else if (actionType === 'Verification') {
                    await assignVerification(id, actionLink, user?.uid);
                } else if (actionType === 'Offer') {
                    await sendOfferLetter(id, actionLink, user?.uid);
                }
            }
            alert(`Successfully processed ${selectedApps.length} candidates!`);
            setSelectedApps([]);
            setActionType(null);
            setActionLink('');
            setActioningAppId(null);
        } catch (err) {
            console.error("Bulk action failed:", err);
            alert("Failed to process bulk action. Please check your connection and permissions.");
        } finally {
            setLoading(false);
        }
    };

    const filteredApps = (jobId: string) => {
        let apps = appsByJob[jobId] || [];
        if (activeStage !== 'All') {
            apps = apps.filter(a => a.status === activeStage);
        }
        if (searchTerm) {
            apps = apps.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.email.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return apps;
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8 font-sans">
            {/* Header */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8 text-indigo-600" />
                        Hiring Command Center
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your enterprise talent pipeline</p>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="group bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Create Job Post
                </button>
            </div>

            {/* Stages Bar */}
            <div className="max-w-7xl mx-auto bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex overflow-x-auto gap-2 no-scrollbar">
                {(['All', 'Applied', 'Shortlisted', 'Test Assigned', 'Interview', 'Document Verification', 'Selected', 'Rejected'] as Stage[]).map(stage => (
                    <button
                        key={stage}
                        onClick={() => setActiveStage(stage)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeStage === stage ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        {stage}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto space-y-6">
                {jobs.map(job => (
                    <div key={job.jobId} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden group">
                        {/* Job Row */}
                        <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white group-hover:bg-slate-50/30 transition-colors">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-black text-slate-900">{job.title}</h3>
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black rounded-full uppercase tracking-wider">{job.type}</span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-400">
                                    <span className="flex items-center gap-1.5"><Search className="w-4 h-4" /> {job.location}</span>
                                    <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle className="w-4 h-4" /> {job.salary}</span>
                                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {(appsByJob[job.jobId!] || []).length} Applicants</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button 
                                    onClick={() => handleBulkAction(job.jobId!, 'Applied', 'Shortlisted')}
                                    className="hidden lg:flex items-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl font-bold text-xs transition-all"
                                >
                                    Shortlist All New
                                </button>
                                <button 
                                    onClick={() => setExpandedJobId(expandedJobId === job.jobId ? null : job.jobId!)}
                                    className={`flex-1 md:flex-none px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${expandedJobId === job.jobId ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                                >
                                    {expandedJobId === job.jobId ? 'Close Pipeline' : 'Open Pipeline'}
                                    {expandedJobId === job.jobId ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Expanded Pipeline */}
                        {expandedJobId === job.jobId && (
                            <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/30 space-y-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                                    <div className="relative flex-1 w-full">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search candidates by name or email..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-600"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => handleSelectAll(job.jobId!)}
                                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                        >
                                            {filteredApps(job.jobId!).every(id => selectedApps.includes(id.applicationId!)) ? 'Deselect All' : 'Select All In View'}
                                        </button>
                                    </div>
                                </div>

                                {selectedApps.length > 0 && (
                                    <div className="sticky top-4 z-20 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-4 animate-slide-up">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-indigo-600 px-3 py-1 rounded-lg text-xs font-black">{selectedApps.length} Selected</span>
                                            <p className="text-sm font-bold text-slate-300">Perform mass action:</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button onClick={() => handleBulkStatusChange('Shortlisted')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-bold transition-colors">Shortlist All</button>
                                            <button onClick={() => { setActionType('Test'); setActioningAppId('BULK'); }} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-bold transition-colors">Assign Test</button>
                                            <button onClick={() => { setActionType('Interview'); setActioningAppId('BULK'); }} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold transition-colors">Assign Interview</button>
                                            <button onClick={() => { setActionType('Verification'); setActioningAppId('BULK'); }} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-xs font-bold transition-colors">Verify Docs</button>
                                            <button onClick={() => { setActionType('Offer'); setActioningAppId('BULK'); }} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-bold transition-colors">Send Offers</button>
                                            <button onClick={() => handleBulkStatusChange('Rejected')} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-bold transition-colors">Reject All</button>
                                            <button onClick={() => setSelectedApps([])} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold transition-colors">Cancel</button>
                                        </div>
                                    </div>
                                )}

                                {actioningAppId === 'BULK' && (
                                    <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl space-y-4 animate-fade-in">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-black text-indigo-900 tracking-tight">Bulk Assign {actionType} to {selectedApps.length} Candidates</h4>
                                            <button onClick={() => setActioningAppId(null)}><XCircle className="w-5 h-5 text-indigo-300" /></button>
                                        </div>
                                        <div className="flex gap-4">
                                            <input 
                                                type="text" 
                                                placeholder={`Paste ${actionType} URL for all selected...`}
                                                value={actionLink}
                                                onChange={e => setActionLink(e.target.value)}
                                                className="flex-1 px-4 py-3 bg-white border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                            />
                                            <button onClick={handleBulkAssign} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Confirm Bulk Action</button>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-4">
                                    {filteredApps(job.jobId!).length === 0 ? (
                                        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
                                            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                            <h4 className="text-slate-900 font-bold">No candidates found</h4>
                                            <p className="text-slate-400 text-sm mt-1">Try changing the stage or search term.</p>
                                        </div>
                                    ) : (
                                        filteredApps(job.jobId!).map(app => (
                                            <div key={app.applicationId} className={`bg-white p-5 md:p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-all group/card ${selectedApps.includes(app.applicationId!) ? 'border-indigo-500 ring-1 ring-indigo-500/10 bg-indigo-50/10' : 'border-slate-200'}`}>
                                                <div className="flex items-start gap-4">
                                                    <div className="flex items-center h-12">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedApps.includes(app.applicationId!)}
                                                            onChange={() => handleSelectApp(app.applicationId!)}
                                                            className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-lg group-hover/card:bg-indigo-600 group-hover/card:text-white transition-colors">
                                                        {app.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-lg font-black text-slate-900">{app.name}</p>
                                                            <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                                                                app.status === 'Selected' ? 'bg-green-100 text-green-700 border-green-200' :
                                                                app.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                                                'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                            }`}>
                                                                {app.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-400 mt-0.5">{app.email}</p>
                                                        {app.resumeURL && (
                                                            <a href={app.resumeURL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs font-black text-indigo-600 hover:underline">
                                                                VIEW RESUME <ArrowRight className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                                                    {actioningAppId === app.applicationId ? (
                                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3 w-full md:w-72">
                                                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Assign {actionType} Link</p>
                                                            <input 
                                                                type="text" 
                                                                placeholder={`Paste ${actionType} URL...`}
                                                                value={actionLink}
                                                                onChange={e => setActionLink(e.target.value)}
                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button 
                                                                    onClick={() => submitAction(job.jobId!)} 
                                                                    disabled={loading || !actionLink}
                                                                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                                                >
                                                                    {loading ? 'Submitting...' : 'Submit'}
                                                                </button>
                                                                <button 
                                                                    onClick={() => { setActioningAppId(null); setActionLink(''); }} 
                                                                    className="px-3 py-2 bg-white border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-100"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-2 min-w-[200px]">
                                                            <div className="flex gap-2">
                                                                {app.finalStatus !== 'Offer Accepted' && app.finalStatus !== 'Offer Rejected' && (
                                                                    <button 
                                                                        onClick={() => processNextStep(app, job.jobId!)}
                                                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-sm hover:shadow-indigo-200 flex items-center justify-center gap-2"
                                                                    >
                                                                        {app.status === 'Applied' ? 'Shortlist Candidate' : 
                                                                         app.status === 'Shortlisted' ? 'Assign Test' :
                                                                         app.status === 'Test Assigned' || app.status === 'Test Completed' ? 'Move to Interview' :
                                                                         app.status === 'Interview' ? 'Verify Documents' :
                                                                         app.status === 'Document Verification' || app.status === 'Onboarding Complete' ? 'Send Offer Letter' :
                                                                         app.finalStatus === 'Offer Sent' ? 'Update Offer' :
                                                                         app.status === 'Selected' && !app.finalStatus ? 'Send Offer Letter' :
                                                                         app.status === 'Selected' ? 'Hiring Complete' :
                                                                         'Process Next'}
                                                                        {(app.status !== 'Selected' || (app.status === 'Selected' && !app.finalStatus)) && <ArrowRight className="w-3 h-3" />}
                                                                    </button>
                                                                )}
                                                                {(app.finalStatus === 'Offer Accepted' || app.finalStatus === 'Offer Rejected') && (
                                                                    <div className="flex-1 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-black flex items-center justify-center gap-2 border border-slate-200">
                                                                        Hiring Process Complete
                                                                    </div>
                                                                )}
                                                                {app.status !== 'Selected' && app.status !== 'Rejected' && (
                                                                    <button 
                                                                        onClick={() => handleBulkStatusChange('Rejected')}
                                                                        className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-200"
                                                                    >
                                                                        <XCircle className="w-5 h-5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="flex justify-between items-center px-1">
                                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                                                    app.finalStatus === 'Offer Accepted' ? 'bg-green-600 text-white shadow-sm' :
                                                                    app.finalStatus === 'Offer Rejected' ? 'bg-red-600 text-white shadow-sm' :
                                                                    app.finalStatus === 'Offer Sent' ? 'bg-indigo-600 text-white animate-pulse shadow-md' :
                                                                    app.status === 'Applied' ? 'bg-amber-100 text-amber-700' :
                                                                    app.status === 'Shortlisted' ? 'bg-blue-100 text-blue-700' :
                                                                    app.status === 'Test Assigned' ? 'bg-purple-100 text-purple-700' :
                                                                    app.status === 'Interview' ? 'bg-indigo-100 text-indigo-700' :
                                                                    app.status === 'Document Verification' ? 'bg-cyan-100 text-cyan-700' :
                                                                    app.status === 'Selected' ? 'bg-emerald-100 text-emerald-700' :
                                                                    'bg-slate-100 text-slate-700'
                                                                }`}>
                                                                    {app.finalStatus === 'Offer Accepted' ? 'Hired / Offer Accepted' : 
                                                                     app.finalStatus === 'Offer Sent' ? 'Offer Sent - Pending' : 
                                                                     app.finalStatus === 'Offer Rejected' ? 'Offer Declined' :
                                                                     app.status}
                                                                </span>
                                                                <button className="text-[10px] font-bold text-slate-400 hover:text-indigo-600">View Details</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Create Job Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-8 md:p-12 animate-scale-in relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
                        
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Post New Opening</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><XCircle className="w-6 h-6 text-slate-300" /></button>
                        </div>

                        <form onSubmit={handleCreateJob} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Job Title</label>
                                    <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 outline-none transition-all shadow-inner" placeholder="e.g. Lead Designer" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                                    <input required value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 outline-none transition-all shadow-inner" placeholder="Remote / City" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Salary Range</label>
                                    <input required value={salary} onChange={e => setSalary(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 outline-none transition-all shadow-inner" placeholder="$100k - $120k" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                                    <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 outline-none transition-all shadow-inner">
                                        <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Key Requirements</label>
                                    <input required value={requirements} onChange={e => setRequirements(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 outline-none transition-all shadow-inner" placeholder="React, Next.js, Tailwind..." />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 outline-none transition-all shadow-inner resize-none" placeholder="What makes this role special?" />
                                </div>
                            </div>
                            <button disabled={loading} className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50">
                                {loading ? 'Publishing...' : 'Confirm \u0026 Post Job'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

