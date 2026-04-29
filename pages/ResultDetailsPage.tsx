import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CandidateResult } from '../types';
import { db } from '../services/db';
import { Button } from '../components/ui/Button';
import { ChevronLeft, Download, Mail, Share2, Printer, AlertTriangle, CheckCircle, Clock, BookOpen, User, Briefcase } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const ResultDetailsPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [result, setResult] = useState<CandidateResult | null>(null);

    useEffect(() => {
        // If passed via state (immediate view)
        if (location.state?.result) {
            setResult(location.state.result);
        } else {
            // Mock fallback or fetch from ID mechanism if implemented
            // For demo, we just go back if no state
            navigate('/dashboard');
        }
    }, [location, navigate]);

    if (!result) return null;

    const isLowRisk = result.cheatScore < 30;
    const isMediumRisk = result.cheatScore >= 30 && result.cheatScore < 60;
    const isHighRisk = result.cheatScore >= 60;

    // Mock Radar Data from breakdown
    const radarData = [
        { subject: 'Coding', A: result.breakdown?.coding || 0, fullMark: 100 },
        { subject: 'MCQ', A: result.breakdown?.mcq || 0, fullMark: 100 },
        { subject: 'Speed', A: result.timeTakenMinutes ? (60 - result.timeTakenMinutes) * 1.5 : 50, fullMark: 100 },
        { subject: 'Quality', A: result.score, fullMark: 100 },
        { subject: 'Integrity', A: 100 - result.cheatScore, fullMark: 100 },
    ];

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Candidate,Score,Status,Cheat Score,Time Taken\n"
            + `${result.candidateName},${result.score},${result.status},${result.cheatScore},${result.timeTakenMinutes || 'N/A'}`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${result.candidateName}_Report.csv`);
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 print:bg-white print:p-0">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between print:hidden">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={handleExportCSV}>
                            <Download className="w-4 h-4 mr-2" /> Export CSV
                        </Button>
                        <Button variant="primary" onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" /> Print Report
                        </Button>
                    </div>
                </div>

                {/* Main Report Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden print:shadow-none print:border-none">
                    {/* Banner */}
                    <div className={`h-24 ${result.status === 'Selected' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}></div>

                    <div className="px-8 pb-8">
                        {/* Profile Header */}
                        <div className="relative flex justify-between items-end -mt-10 mb-8">
                            <div className="flex items-end gap-6">
                                <div className="w-24 h-24 bg-white p-1 rounded-xl shadow-md">
                                    <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                        <User className="w-10 h-10" />
                                    </div>
                                </div>
                                <div className="mb-1">
                                    <h1 className="text-3xl font-bold text-gray-900">{result.candidateName}</h1>
                                    <p className="text-gray-500 flex items-center gap-2">
                                        <Briefcase className="w-3 h-3" /> {result.department || 'General'} • <Mail className="w-3 h-3" /> ID: {result.candidateId} • {result.completedAt && result.completedAt.includes('T') ? new Date(result.completedAt).toLocaleString() : result.completedAt}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border ${result.status === 'Selected' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                    Status: {result.status.toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="text-sm text-gray-500 mb-1">Final Score</div>
                                <div className="text-3xl font-bold text-indigo-600">{result.score}/100</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="text-sm text-gray-500 mb-1">Answer Quality</div>
                                <div className="text-3xl font-bold text-gray-900">{(result.score * 0.9).toFixed(0)}%</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="text-sm text-gray-500 mb-1">Time Taken</div>
                                <div className="text-3xl font-bold text-gray-900 flex items-baseline gap-1">
                                    {result.timeTakenMinutes || '--'} <span className="text-sm font-normal text-gray-500">min</span>
                                </div>
                            </div>
                            <div className={`p-4 rounded-lg border ${isHighRisk ? 'bg-red-50 border-red-200' : isMediumRisk ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                                <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                    Integrity Risks {isHighRisk && <AlertTriangle className="w-3 h-3 text-red-600" />}
                                </div>
                                <div className={`text-3xl font-bold ${isHighRisk ? 'text-red-700' : isMediumRisk ? 'text-yellow-700' : 'text-green-700'}`}>
                                    {isHighRisk ? 'Critical' : isMediumRisk ? 'Moderate' : 'Low'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mt-8">
                            {/* Section 1: Performance Radar & Recording */}
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-indigo-500" /> Skill Analysis
                                    </h3>
                                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                <PolarGrid />
                                                <PolarAngleAxis dataKey="subject" />
                                                <PolarRadiusAxis />
                                                <Radar name="Candidate" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                {result.recordingUrl && (
                                    <div className="bg-slate-900 rounded-lg p-4 text-white">
                                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                            Session Recording
                                        </h4>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-400">ID: {result.candidateId}</span>
                                            <a href={result.recordingUrl} target="_blank" rel="noreferrer" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors text-indigo-200 hover:text-white">
                                                Watch Playback
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section 2: Integrity Log */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-500" /> Integrity Report
                                </h3>
                                <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 h-64 overflow-y-auto">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
                                            <span className="text-gray-500">Trust Score</span>
                                            <span className="font-bold">{100 - result.cheatScore}%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
                                            <span className="text-gray-500">Inferred Cheating Risk</span>
                                            <span className={`font-bold ${isHighRisk ? 'text-red-600' : 'text-green-600'}`}>{result.cheatScore}%</span>
                                        </div>

                                        {result.cheatScore > 0 ? (
                                            <div className="mt-4">
                                                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Detected Anomalies</p>
                                                <ul className="space-y-2 text-sm">
                                                    {result.cheatScore > 10 && <li className="text-red-600 flex items-center gap-2">• Suspicious eye movement detected.</li>}
                                                    {result.cheatScore > 30 && <li className="text-red-600 flex items-center gap-2">• Tab switching interference logged.</li>}
                                                    {result.cheatScore > 60 && <li className="text-red-600 flex items-center gap-2 font-bold">• CRITICAL: Multiple faces or unauthorized device detected.</li>}
                                                </ul>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center mt-8 text-green-600">
                                                <CheckCircle className="w-8 h-8 mb-2" />
                                                <span className="text-sm font-medium">No anomalies detected. Clean Session.</span>
                                            </div>
                                        )}
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
