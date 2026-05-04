import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobs, Job } from '../../services/workdayService';
import { Briefcase, ExternalLink, CheckCircle2, Globe, Zap, ArrowRight } from 'lucide-react';

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
        <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
            <div className="text-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 w-24 h-24 bg-blue-400/10 rounded-full blur-3xl"></div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight sm:text-6xl mb-4">Explore Opportunities</h1>
                <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Discover high-impact roles and join the next generation of innovators.</p>
            </div>
            
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Opportunities...</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-premium">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                        <Briefcase className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">No jobs available right now</h3>
                    <p className="text-slate-500 font-medium">Check back soon for new opportunities.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {jobs.map(job => (
                        <div key={job.jobId} className="group bg-white rounded-[2.5rem] p-8 shadow-premium hover:shadow-2xl border border-slate-100 transition-all duration-500 flex flex-col justify-between relative overflow-hidden transform hover:-translate-y-2">
                            <div className="absolute top-0 right-0 p-6 z-10">
                                <button
                                    onClick={() => handleCopyLink(job.jobId!)}
                                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm bg-white/50 backdrop-blur-sm border border-slate-100"
                                    title="Copy Link"
                                >
                                    {copied === job.jobId ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <ExternalLink className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            
                            <div className="relative z-10">
                                <div className="inline-flex px-4 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-[10px] font-black tracking-widest uppercase mb-6 border border-blue-100 shadow-sm">
                                    {job.type}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors leading-tight mb-2">{job.title}</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-8">{job.companyName}</p>
                                
                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center text-slate-600 font-medium text-sm group/loc">
                                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 mr-3 group-hover/loc:bg-blue-50 group-hover/loc:text-blue-500 transition-colors">
                                            <Globe className="w-4 h-4" />
                                        </div>
                                        {job.location}
                                    </div>
                                    <div className="flex items-center text-slate-600 font-medium text-sm group/sal">
                                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 mr-3 group-hover/sal:bg-emerald-50 group-hover/sal:text-emerald-500 transition-colors">
                                            <Zap className="w-4 h-4" />
                                        </div>
                                        {job.salary}
                                    </div>
                                </div>
                            </div>
                            
                            <Link to={`/workday/jobs/${job.jobId}`} className="relative z-10 flex justify-center items-center w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-slate-200 hover:shadow-blue-200 group/btn">
                                View Details
                                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
