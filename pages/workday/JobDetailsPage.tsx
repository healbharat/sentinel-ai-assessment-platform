import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useWorkdayAuth } from '../../contexts/WorkdayAuthContext';
import { getJobDetails, applyJob, getApplicationsForStudent, Job } from '../../services/workdayService';
import ReactMarkdown from 'react-markdown';

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
            const fetched = await getJobDetails(id);
            setJob(fetched);
            
            if (user) {
                const studentApps = await getApplicationsForStudent(user.uid);
                const applied = studentApps.some(app => app.jobId === id);
                setHasApplied(applied);
            }
            setLoading(false);
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
        <div className="max-w-5xl mx-auto space-y-8 px-4 sm:px-6 py-8 font-sans">
            <button onClick={() => navigate('/workday/jobs')} className="text-slate-500 hover:text-blue-600 flex items-center transition-colors font-medium text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                Back to Jobs
            </button>

            <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 sm:p-10 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-70 pointer-events-none"></div>
                
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-wide uppercase mb-3">
                            {job.type}
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{job.title}</h1>
                        <p className="text-xl font-semibold text-blue-600 mt-2">{job.companyName}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center justify-center p-3 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                            title="Copy Link"
                        >
                            {copied ? (
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                            )}
                        </button>
                        
                        {profile?.role !== 'company' && profile?.role !== 'admin' && (
                            <button
                                onClick={handleApply}
                                disabled={hasApplied || applying}
                                className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-white transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none ${
                                    hasApplied ? 'bg-green-500 cursor-not-allowed' : 'bg-slate-900 hover:bg-blue-600'
                                }`}
                            >
                                {hasApplied ? 'Applied ✓' : applying ? 'Applying...' : 'Apply Now'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <div>
                        <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Location</span>
                        <span className="text-slate-800 font-medium">{job.location}</span>
                    </div>
                    <div>
                        <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Type</span>
                        <span className="text-slate-800 font-medium">{job.type}</span>
                    </div>
                    <div>
                        <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Salary</span>
                        <span className="text-slate-800 font-medium">{job.salary}</span>
                    </div>
                    <div>
                        <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Date Posted</span>
                        <span className="text-slate-800 font-medium">
                            {job.postedAt?.toDate ? job.postedAt.toDate().toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </div>

                {message && (
                    <div className={`mt-6 p-4 rounded-xl text-sm font-medium border ${hasApplied ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                        {message}
                    </div>
                )}

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 opacity-50"></div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center gap-3 relative">
                                <span className="bg-blue-100 text-blue-600 p-2 rounded-xl">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                                About The Role
                            </h3>
                            <div className="text-slate-600 relative">
                                <ReactMarkdown
                                    components={{
                                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-slate-900 mt-8 mb-4" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-lg font-bold text-slate-900 mt-6 mb-3 flex items-center gap-2" {...props} />,
                                        p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-slate-600" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 marker:text-blue-400" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 marker:text-blue-500 font-medium" {...props} />,
                                        li: ({node, ...props}) => <li className="text-slate-600 pl-1" {...props} />,
                                        strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
                                        a: ({node, ...props}) => <a className="text-blue-600 font-medium hover:text-blue-800 underline decoration-blue-300 decoration-2 underline-offset-2 transition-all" {...props} />,
                                        hr: ({node, ...props}) => <hr className="my-8 border-slate-100" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-6 bg-blue-50/50 italic text-slate-700 rounded-r-lg" {...props} />,
                                        code: ({node, inline, className, children, ...props}: any) => {
                                            return inline ? 
                                                <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded-md text-sm font-mono border border-slate-200" {...props}>{children}</code> :
                                                <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl overflow-x-auto my-6 shadow-inner"><code className="font-mono text-sm" {...props}>{children}</code></pre>
                                        }
                                    }}
                                >
                                    {job.description}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                    
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm sticky top-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center gap-3">
                                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-xl">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                                Requirements
                            </h3>
                            <div className="flex flex-col gap-3">
                                {job.requirements.map((req, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                        <svg className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        <span className="text-slate-700 font-medium text-sm leading-relaxed">
                                            {req}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
