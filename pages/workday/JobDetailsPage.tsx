import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useWorkdayAuth } from '../../contexts/WorkdayAuthContext';
import { getJobDetails, applyJob, getApplicationsForStudent, Job } from '../../services/workdayService';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, ExternalLink, CheckCircle2, Rocket, Globe, Briefcase, Zap, Calendar, XCircle, FileText, ShieldCheck } from 'lucide-react';

export const JobDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { profile, user } = useWorkdayAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [message, setMessage] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const jobPromise = getJobDetails(id);
                const appsPromise = user ? getApplicationsForStudent(user.uid) : Promise.resolve([]);

                const [fetchedJob, studentApps] = await Promise.all([jobPromise, appsPromise]);

                setJob(fetchedJob);
                if (user) {
                    const applied = (studentApps || []).some(app => app.jobId === id);
                    setHasApplied(applied);
                }
            } catch (err) {
                console.error("Failed to fetch details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, user]);

    const handleCopyLink = () => {
        const link = `${window.location.origin}/workday/jobs/${id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleApply = async () => {
        if (!user) {
            navigate(`/workday/login?role=student&redirect=${encodeURIComponent(location.pathname)}`);
            return;
        }

        if (profile?.role !== 'student') {
            setMessage('Only student accounts can apply for jobs.');
            return;
        }
        
        if (!profile.resumeURL) {
            setMessage('You must upload a resume in your profile before applying.');
            return;
        }

        setApplying(true);
        setMessage('');

        try {
            await applyJob({
                jobId: id!,
                userId: user.uid,
                name: profile.name,
                email: profile.email,
                resumeURL: profile.resumeURL,
                jobTitle: job?.title,
                companyName: job?.companyName
            });
            setHasApplied(true);
            setMessage('Application submitted successfully!');
        } catch (err: any) {
            setMessage('Error: ' + err.message);
        } finally {
            setApplying(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20 font-sans">
            <div className="animate-pulse space-y-8 w-full max-w-4xl px-4">
                <div className="h-12 bg-slate-200 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                <div className="h-32 bg-slate-200 rounded-2xl w-full"></div>
            </div>
        </div>
    );
    if (!job) return <div className="text-center py-20 text-slate-500 font-sans">Job not found.</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 px-4 sm:px-6 py-12 font-sans">
            <button onClick={() => navigate('/workday/jobs')} className="group text-slate-500 hover:text-blue-600 flex items-center transition-all font-black text-xs uppercase tracking-widest">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Opportunities
            </button>

            <div className="bg-white shadow-premium rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 relative overflow-hidden transition-all duration-500 hover:shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full blur-3xl -mr-48 -mt-48 opacity-70 pointer-events-none group-hover:scale-125 transition-transform duration-1000"></div>
                
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                    <div className="flex-1">
                        <div className="inline-flex px-4 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-[10px] font-black tracking-widest uppercase mb-4 border border-blue-100 shadow-sm">
                            {job.type}
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">{job.title}</h1>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
                                {job.companyName?.charAt(0)}
                            </div>
                            <p className="text-xl font-bold text-blue-600">{job.companyName}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center justify-center p-4 rounded-2xl border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all bg-white shadow-sm active:scale-95"
                            title="Copy Link"
                        >
                            {copied ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            ) : (
                                <ExternalLink className="w-6 h-6" />
                            )}
                        </button>
                        
                        {profile?.role !== 'company' && profile?.role !== 'admin' && (
                            <button
                                onClick={handleApply}
                                disabled={hasApplied || applying}
                                className={`flex-1 md:flex-none px-10 py-4 rounded-2xl font-black text-white transition-all shadow-xl active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 ${
                                    hasApplied ? 'bg-emerald-500 shadow-emerald-100' : 'bg-slate-900 hover:bg-blue-600 shadow-slate-200 hover:shadow-blue-200'
                                }`}
                            >
                                {hasApplied ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Applied
                                    </>
                                ) : applying ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Apply Now
                                        <Rocket className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50/50 rounded-3xl p-8 border border-slate-100 relative z-10">
                    <div className="group/item">
                        <span className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 group-hover/item:text-blue-500 transition-colors">Location</span>
                        <div className="flex items-center gap-2 text-slate-800 font-bold">
                            <Globe className="w-4 h-4 text-slate-400" />
                            {job.location}
                        </div>
                    </div>
                    <div className="group/item">
                        <span className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 group-hover/item:text-indigo-500 transition-colors">Employment</span>
                        <div className="flex items-center gap-2 text-slate-800 font-bold">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            {job.type}
                        </div>
                    </div>
                    <div className="group/item">
                        <span className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 group-hover/item:text-emerald-500 transition-colors">Salary Range</span>
                        <div className="flex items-center gap-2 text-slate-800 font-bold">
                            <Zap className="w-4 h-4 text-slate-400" />
                            {job.salary}
                        </div>
                    </div>
                    <div className="group/item">
                        <span className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 group-hover/item:text-orange-500 transition-colors">Posted On</span>
                        <div className="flex items-center gap-2 text-slate-800 font-bold">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {job.postedAt?.toDate ? job.postedAt.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`mt-8 p-5 rounded-[1.5rem] text-sm font-black border flex items-center gap-4 animate-slide-up ${hasApplied ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${hasApplied ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                            {hasApplied ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        {message}
                    </div>
                )}

                <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        <div className="relative">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Role Description</h3>
                            </div>
                            <div className="bg-white rounded-[2rem] p-8 sm:p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="text-slate-600 relative prose prose-slate max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({node, ...props}) => <h1 className="text-3xl font-black text-slate-900 mt-10 mb-6 uppercase tracking-tight" {...props} />,
                                            h2: ({node, ...props}) => <h2 className="text-2xl font-black text-slate-900 mt-10 mb-5 uppercase tracking-tight" {...props} />,
                                            h3: ({node, ...props}) => <h3 className="text-xl font-black text-slate-900 mt-8 mb-4 flex items-center gap-3" {...props} />,
                                            p: ({node, ...props}) => <p className="mb-6 leading-relaxed text-slate-600 font-medium text-lg" {...props} />,
                                            ul: ({node, ...props}) => <ul className="list-none pl-0 mb-8 space-y-4" {...props} />,
                                            li: ({node, ...props}) => (
                                                <li className="flex items-start gap-3 text-slate-600 font-medium text-lg" {...props}>
                                                    <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </div>
                                                    <span>{props.children}</span>
                                                </li>
                                            ),
                                            strong: ({node, ...props}) => <strong className="font-black text-slate-900" {...props} />,
                                            hr: ({node, ...props}) => <hr className="my-10 border-slate-100" {...props} />,
                                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-6 py-2 my-8 bg-blue-50/30 italic text-slate-700 rounded-r-2xl font-medium" {...props} />,
                                        }}
                                    >
                                        {job.description}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 space-y-8">
                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-premium relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Key Requirements</h3>
                                </div>
                                <div className="space-y-4">
                                    {job.requirements.map((req, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-indigo-100 hover:bg-white transition-all duration-300 group/req">
                                            <div className="w-5 h-5 text-indigo-400 mt-0.5 group-hover/req:text-indigo-600 transition-colors">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                            <span className="text-slate-600 font-bold text-sm leading-relaxed">
                                                {req}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                <div className="relative z-10">
                                    <h4 className="text-lg font-black uppercase tracking-widest mb-4">Sentinel Guard™</h4>
                                    <p className="text-slate-300 text-xs font-medium leading-relaxed mb-6">This application is protected by Sentinel-AI anti-fraud and automated verification layers.</p>
                                    <div className="flex items-center gap-3 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                        <ShieldCheck className="w-4 h-4" />
                                        Verified Listing
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
