import React from 'react';
import { db as dbService } from '../services/db';
import { db } from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Button } from '../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { CHART_DATA_PERFORMANCE, CHART_DATA_HIRING_FUNNEL, MOCK_CANDIDATES } from '../constants'; // Keeping for UI placeholders for now, can replace later

import {
  Users,
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  Briefcase,
  Plus,
  Download,
  Trash2,
  FileText,
  Sheet,
  Star,
  ChevronRight
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ... (Imports remain same)

const DashboardCard: React.FC<{ title: string; value: string; sub: string; icon: React.ReactNode; trend?: 'up' | 'down'; delay?: string }> = ({ title, value, sub, icon, trend, delay }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 transform hover:-translate-y-1 animate-slide-up ${delay || ''}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{value}</h3>
      </div>
      <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shadow-sm">
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className={`font-semibold px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {trend === 'up' ? '↑' : '↓'} {sub}
      </span>
      <span className="text-gray-400 ml-2">vs last month</span>
    </div>
  </div>
);

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { UserRole, Organization } from '../types';
import { Lock, Clock, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [candidates, setCandidates] = React.useState<any[]>([]);
  const [results, setResults] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({
    totalCandidates: 0,
    avgScore: 0,
    avgCheatScore: 0,
    hiringVelocity: '0 Days',
    debugCounts: {
      candidates: 0,
      results: 0,
      applications: 0,
      users: 0,
      questions: 0
    }
  });
  
  const [funnelData, setFunnelData] = React.useState<any[]>([]);
  const [performanceData, setPerformanceData] = React.useState<any[]>([]);

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Enterprise Workflow: Locked State Logic
  const [isLocked, setIsLocked] = React.useState(false);
  const [orgStatus, setOrgStatus] = React.useState<string>('');

  React.useEffect(() => {
    if (!user) return;

    {/* Super Admin check removed */ }

    if (user.organizationId) {
      const checkStatus = async () => {
        const org = await dbService.getOrganizationById(user.organizationId!);
        if (org && (org.status === 'PENDING_VERIFICATION' || org.status === 'PENDING_PAYMENT' || org.status === 'PAID_PENDING_APPROVAL' || org.status === 'ON_HOLD')) {
          setIsLocked(true);
          setOrgStatus(org.status.replace(/_/g, ' '));
        } else {
          setIsLocked(false);
        }
      };

      checkStatus();
      const interval = setInterval(checkStatus, 3000); // Real-time polling
      return () => clearInterval(interval);
    }
  }, [user]);

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in border border-gray-100">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <Lock className="w-10 h-10 text-amber-500" />
            <div className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-md">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Locked</h2>
          <p className="text-gray-500 mb-6">Your organization account is currently under verification.</p>

          <div className="bg-amber-50 rounded-xl p-4 text-left space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className="font-bold text-amber-700 uppercase">{orgStatus}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Received</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estimated Time:</span>
              <span className="font-bold text-gray-800">24 Hours</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-6">
            Our admin team checks every request to ensure platform integrity.
            This page will auto-refresh upon approval.
          </p>

          <Button onClick={logout} variant="outline" className="w-full">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  // ... (Rest of existing dashboard logic)

  React.useEffect(() => {
    // Initial Fetch
    const loadInitial = async () => {
      const cands = await dbService.getCandidates();
      setCandidates(cands);
      // Other initial loads...
    };
    loadInitial();

    const unsubResults = dbService.subscribeToResults((resList) => {
      setStats(prev => ({ ...prev, debugCounts: { ...prev.debugCounts, results: resList.length } }));
      const displayResults = resList.length > 0 ? resList : MOCK_CANDIDATES;
      setResults(displayResults);

      const totalScore = displayResults.reduce((acc, curr) => acc + (curr.score || 0), 0);
      const totalCheat = displayResults.reduce((acc, curr) => acc + (curr.cheatScore || 0), 0);
      const avgScore = displayResults.length ? Math.round(totalScore / displayResults.length) : 0;
      const avgCheat = displayResults.length ? (totalCheat / displayResults.length).toFixed(1) : '0';

      // Dynamic Performance Data
      const totalMcq = displayResults.reduce((acc, curr) => acc + (curr.breakdown?.mcq || 0), 0);
      const totalCoding = displayResults.reduce((acc, curr) => acc + (curr.breakdown?.coding || 0), 0);
      const avgMcq = displayResults.length ? Math.round(totalMcq / displayResults.length) : 0;
      const avgCoding = displayResults.length ? Math.round(totalCoding / displayResults.length) : 0;

      setPerformanceData([
        { name: 'Technical', score: avgMcq },
        { name: 'Coding', score: avgCoding },
        { name: 'Aptitude', score: Math.round(avgMcq * 0.8) }, 
        { name: 'Behavioral', score: 80 }
      ]);

      setStats(prev => ({
        ...prev,
        avgScore,
        avgCheatScore: Number(avgCheat)
      }));
    });

    const unsubCandidates = dbService.subscribeToCandidates((list) => {
      setStats(prev => ({ ...prev, debugCounts: { ...prev.debugCounts, candidates: list.length } }));
      setCandidates(list);
      setStats(prev => ({
        ...prev,
        totalCandidates: list.length > 0 ? list.length : 0
      }));
    });

    // Also check applications (Workday)
    const unsubApps = onSnapshot(collection(db, 'applications'), (snap) => {
      setStats(prev => ({ ...prev, debugCounts: { ...prev.debugCounts, applications: snap.size } }));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setStats(prev => ({ ...prev, debugCounts: { ...prev.debugCounts, users: snap.size } }));
    });

    const unsubQuestions = onSnapshot(collection(db, 'questions'), (snap) => {
      setStats(prev => ({ ...prev, debugCounts: { ...prev.debugCounts, questions: snap.size } }));
    });

    return () => {
      unsubResults();
      unsubCandidates();
      unsubApps();
      unsubUsers();
      unsubQuestions();
    };
  }, []);

  React.useEffect(() => {
    // Dynamic Funnel Data calculation whenever results or candidates update
    const applied = candidates.length;
    const assessment = results.length;
    const selected = results.filter(r => r.status === 'Selected').length;

    setFunnelData([
      { stage: 'Applied', count: applied },
      { stage: 'Screened', count: Math.round(applied * 0.7) },
      { stage: 'Assessment', count: assessment },
      { stage: 'Interview', count: selected + (assessment > selected ? Math.min(2, assessment - selected) : 0) },
      { stage: 'Offer', count: selected }
    ]);
  }, [candidates, results]);

  const handleDeleteResult = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the result for ${name}?`)) return;
    await dbService.deleteResult(id);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return;

    for (const id of selectedIds) {
      await dbService.deleteResult(id);
    }
    setSelectedIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === results.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(results.map(r => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDownloadCSV = () => {
    // 1. Prepare Data
    const headers = ['Candidate Name', 'Email', 'Department', 'Score', 'Trust Score (Risk %)', 'Status', 'Completed Date'];

    const csvRows = results.map(r => {
      const row = [
        r.candidateName || 'Unknown',
        r.candidateEmail || r.candidateId || 'N/A',
        r.department || '--',
        r.score,
        r.cheatScore,
        r.status,
        new Date(r.completedAt).toLocaleString()
      ];
      // Escape quotes and wrap in quotes
      return row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',');
    });

    // 2. Convert to CSV
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // 3. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `assessment_results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Sentinel AI - Assessment Results', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    // Table
    const tableColumn = ["Candidate", "Email", "Score", "Risk %", "Status", "Date"];
    const tableRows = results.map(r => [
      r.candidateName || 'Unknown',
      r.candidateEmail || 'N/A',
      r.score,
      `${r.cheatScore}%`,
      r.status,
      new Date(r.completedAt).toLocaleDateString()
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
    });

    doc.save(`assessment_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const onStartTest = () => {
    navigate('/exam', {
      state: {
        candidateName: user?.name || 'Admin Demo',
        candidateId: user?.email || 'admin@demo.com'
      }
    });
  };

  if (!user) return null;

  return (
    <div className="bg-[#F8FAFC] min-h-full">
      {/* MAIN CONTENT */}
      {/* HEADER - Glassmorphism */}
      <header className="bg-white/80 backdrop-blur-md h-20 border-b border-gray-200/60 flex items-center justify-between px-8 sticky top-0 z-10 transition-all">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, {(user.name || 'User').split(' ')[0]}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onStartTest} className="hover:bg-indigo-50 text-indigo-700">
            <span className="font-semibold">Demo: Start Exam</span>
          </Button>
          <Button variant="primary" size="lg" onClick={() => navigate('/create-assessment')} className="shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40">
            <Plus className="w-5 h-5 mr-2" /> New Assessment
          </Button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {user.role === UserRole.CANDIDATE && (
          <div className="bg-indigo-600 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl mb-8 group animate-fade-in border border-indigo-500/30">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Star className="w-64 h-64 -mr-20 -mt-20" />
            </div>
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 font-bold text-xs uppercase tracking-widest">
                <Star className="w-4 h-4 fill-white" /> Adventure Completion
              </div>
              <h3 className="text-4xl font-bold mb-6 tracking-tight">Your Internship Milestone! 🚀</h3>
              <p className="text-indigo-100 text-lg mb-10 leading-relaxed font-medium">
                You've reached the final stage of your journey. Complete the end-of-internship form to collect your feedback, generate an AI summary of your growth, and structure your career path.
              </p>
              <Button 
                onClick={() => navigate('/internship-end')} 
                variant="secondary" 
                size="lg"
                className="bg-white text-indigo-600 hover:bg-slate-50 font-bold px-10 py-5 rounded-2xl shadow-2xl shadow-indigo-900/40 transform active:scale-95 transition-all text-lg"
              >
                Complete Final Form <ChevronRight className="ml-2 w-6 h-6" />
              </Button>
            </div>
          </div>
        )}

        {/* DEBUG STATS */}
        <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg mb-6 flex gap-4 text-[10px] font-mono text-amber-700">
          <span>DEBUG:</span>
          {Object.entries(stats.debugCounts).map(([k, v]) => (
            <span key={k}>{k.toUpperCase()}: {v}</span>
          ))}
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard title="Active Candidates" value={stats.totalCandidates.toString()} sub="Real-time" trend="up" icon={<Users className="w-6 h-6" />} delay="delay-100" />
          <DashboardCard title="Avg. Cheat Score" value={`${stats.avgCheatScore}%`} sub="System-wide" trend="down" icon={<AlertTriangle className="w-6 h-6" />} delay="delay-200" />
          <DashboardCard title="Avg. Skill Score" value={`${stats.avgScore}/100`} sub="Performance" trend="up" icon={<BrainCircuit className="w-6 h-6" />} delay="delay-300" />
          <DashboardCard title="Hiring Velocity" value={stats.totalCandidates > 0 ? '4 Days' : '0 Days'} sub="Real-time" trend="up" icon={<TrendingUp className="w-6 h-6" />} delay="delay-400" />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up delay-300">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Recruitment Funnel</h3>
              <Button variant="ghost" size="sm" className="text-indigo-600">View Report</Button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={funnelData.length > 0 ? funnelData : CHART_DATA_HIRING_FUNNEL}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#4f46e5', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Category Performance</h3>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600"><Filter className="w-4 h-4" /></Button>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData.length > 0 ? performanceData : CHART_DATA_PERFORMANCE} layout="vertical" barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }} />
                  <Tooltip cursor={{ fill: '#f1f5f9', radius: 4 }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="score" fill="#6366f1" radius={[0, 6, 6, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up delay-500">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              Recent Assessments <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{results.length}</span>
            </h3>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search candidates..." className="w-full sm:w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
              </div>
              <Button variant="secondary" size="sm" className="border-gray-200 hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>

              <div className="h-6 w-px bg-gray-200 mx-1"></div>

              <Button onClick={handleDownloadCSV} variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-50" title="Download CSV">
                <Sheet className="w-4 h-4 mr-2" /> CSV
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline" size="sm" className="text-red-700 border-red-200 hover:bg-red-50" title="Download PDF">
                <FileText className="w-4 h-4 mr-2" /> PDF
              </Button>

              {selectedIds.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleBulkDelete} className="text-red-600 border-red-200 hover:bg-red-50 animate-fade-in">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete ({selectedIds.length})
                </Button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4 pl-8">
                    <input
                      type="checkbox"
                      checked={results.length > 0 && selectedIds.length === results.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                  </th>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Trust Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Completed On</th>
                  <th className="px-6 py-4 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400 italic">No assessments completed yet.</td></tr>
                ) : results.map((c, i) => (
                  <tr key={c.candidateId || Math.random()} className={`hover:bg-gray-50/80 transition-colors group ${selectedIds.includes(c.id) ? 'bg-indigo-50/40' : ''}`}>
                    <td className="px-6 py-4 pl-8">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => toggleSelectOne(c.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold">
                        {(c.candidateName || '?').charAt(0)}
                      </div>
                      {c.candidateName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {c.department || '--'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold text-base ${c.score >= 80 ? 'text-emerald-600' : c.score >= 60 ? 'text-indigo-600' : 'text-gray-600'}`}>{c.score}</span>
                      <span className="text-xs text-gray-400 ml-1">/100</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Inverted CheatScore to TrustScore visually */}
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${c.cheatScore < 20 ? 'bg-emerald-500' : c.cheatScore < 50 ? 'bg-yellow-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.min(c.cheatScore, 100)}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-semibold ${c.cheatScore < 20 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {c.cheatScore > 0 ? `${c.cheatScore}% Risk` : 'Clean'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${c.status === 'Selected' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        c.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                          'bg-yellow-50 text-yellow-700 border-yellow-100'
                        }`}>
                        {c.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm font-medium">
                      <div className="flex flex-col">
                        <span className="text-gray-900">
                          {c.completedAt && c.completedAt.includes('T')
                            ? new Date(c.completedAt).toLocaleDateString()
                            : (c.completedAt || new Date().toLocaleDateString())}
                        </span>
                        {c.completedAt && c.completedAt.includes('T') && (
                          <span className="text-xs text-gray-400">
                            {new Date(c.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right pr-8">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate('/result-details', { state: { result: c } })}
                          className="text-indigo-600 hover:text-white hover:bg-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => handleDeleteResult(c.id, c.candidateName)}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                          title="Delete Result"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};