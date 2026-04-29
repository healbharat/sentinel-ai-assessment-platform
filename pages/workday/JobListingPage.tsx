import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobs, Job } from '../../services/workdayService';

export const JobListingPage: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobs = async () => {
            const fetchedJobs = await getJobs();
            setJobs(fetchedJobs);
            setLoading(false);
        };
        fetchJobs();
    }, []);

    const handleCopyLink = (jobId: string) => {
        const link = `${window.location.origin}/workday/jobs/${jobId}`;
        navigator.clipboard.writeText(link);
        setCopied(jobId);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">Explore Opportunities</h1>
                <p className="mt-4 text-xl text-slate-500">Find your next great career move.</p>
            </div>
            
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-pulse flex space-x-4">
                        <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-slate-200 rounded w-24"></div>
                            <div className="h-4 bg-slate-200 rounded w-32"></div>
                        </div>
                    </div>
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center text-slate-500 bg-white py-16 rounded-3xl border border-slate-100 shadow-sm">
                    No jobs available right now. Check back later!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {jobs.map(job => (
                        <div key={job.jobId} className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-[0_20px_50px_rgb(0,0,0,0.06)] border border-slate-100 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6">
                                <button
                                    onClick={() => handleCopyLink(job.jobId!)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    title="Copy Link"
                                >
                                    {copied === job.jobId ? (
                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                                    )}
                                </button>
                            </div>
                            
                            <div>
                                <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold tracking-wide uppercase mb-4">
                                    {job.type}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                <p className="text-base font-medium text-slate-500 mt-1 mb-6">{job.companyName}</p>
                                
                                <div className="space-y-3 mb-8 text-sm text-slate-600">
                                    <p className="flex items-center"><svg className="w-5 h-5 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{job.location}</p>
                                    <p className="flex items-center"><svg className="w-5 h-5 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{job.salary}</p>
                                </div>
                            </div>
                            <Link to={`/workday/jobs/${job.jobId}`} className="flex justify-center items-center w-full bg-slate-900 group-hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform shadow-md">
                                View Details & Apply
                                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
