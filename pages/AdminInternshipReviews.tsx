import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Filter, Download, Star, 
  ChevronRight, Calendar, Mail, Briefcase, 
  CheckCircle2, BrainCircuit, TrendingUp, AlertCircle, Trash2 
} from 'lucide-react';
import { db } from '../services/db';
import { InternshipSubmission } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminInternshipReviews: React.FC = () => {
  const [submissions, setSubmissions] = useState<InternshipSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<InternshipSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<InternshipSubmission | null>(null);
  const [filterDomain, setFilterDomain] = useState('All Domains');
  const [filterRating, setFilterRating] = useState('All Ratings');

  useEffect(() => {
    const unsubscribe = db.subscribeToInternshipSubmissions((data) => {
      setSubmissions(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = submissions;

    if (searchQuery) {
      result = result.filter(s => 
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterDomain !== 'All Domains') {
      result = result.filter(s => s.internshipDomain === filterDomain);
    }

    if (filterRating !== 'All Ratings') {
      result = result.filter(s => s.experienceRating === parseInt(filterRating));
    }

    setFilteredSubmissions(result);
  }, [submissions, searchQuery, filterDomain, filterRating]);

  const uniqueDomains = ['All Domains', ...new Set(submissions.map(s => s.internshipDomain))];

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      await db.deleteInternshipSubmission(id);
      if (selectedSubmission?.id === id) setSelectedSubmission(null);
    }
  };

  const generateReport = (submission: InternshipSubmission) => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 44, 52);
    doc.text("Internship Performance Report", 105, 20, { align: 'center' });
    
    // User Info
    doc.setFontSize(14);
    doc.text(`Name: ${submission.fullName}`, 20, 35);
    doc.text(`Email: ${submission.email}`, 20, 42);
    doc.text(`Domain: ${submission.internshipDomain}`, 20, 49);
    doc.text(`Duration: ${submission.duration}`, 20, 56);
    doc.text(`Submitted On: ${new Date(submission.submittedAt).toLocaleDateString()}`, 20, 63);

    // Summary Section
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 70, 190, 70);
    doc.setFontSize(16);
    doc.text("AI Summary & Insights", 20, 80);
    doc.setFontSize(11);
    const splitSummary = doc.splitTextToSize(submission.aiSummary || "No summary available", 170);
    doc.text(splitSummary, 20, 88);

    // Performance Section
    doc.setFontSize(16);
    doc.text("Experience & Feedback", 20, 120);
    
    const rows = [
      ["Experience Rating", `${submission.experienceRating}/5`],
      ["Mentorship Rating", `${submission.mentorshipRating}/5`],
      ["Self Improvement", `${submission.improvementRating}/5`],
      ["Skills Learned", submission.skillsLearned],
      ["Project Worked", submission.projectWorkedOn],
      ["Sentiment", submission.aiSentiment || 'N/A']
    ];

    doc.autoTable({
      startY: 125,
      head: [['Metric', 'Value']],
      body: rows,
      theme: 'grid',
      headStyles: { fillStyle: [79, 70, 229] }
    });

    doc.save(`Internship_Report_${submission.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-outfit p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Internship Submissions</h1>
            <p className="text-slate-400">Total {submissions.length} reviews collected</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors group-hover:text-indigo-400" />
              <input 
                type="text" 
                placeholder="Search by name or email..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-2">
              <select 
                className="bg-transparent border-none focus:ring-0 px-4 py-2 text-sm font-semibold"
                value={filterDomain}
                onChange={e => setFilterDomain(e.target.value)}
              >
                {uniqueDomains.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* List Section */}
          <div className="xl:col-span-2 space-y-4">
            {filteredSubmissions.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center">
                <AlertCircle className="w-16 h-16 text-slate-700 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">No Submissions Found</h3>
                <p className="text-slate-500 max-w-sm">We couldn't find any internship reviews matching your current filters.</p>
              </div>
            ) : (
              filteredSubmissions.map((submission) => (
                <motion.div 
                  key={submission.id}
                  layoutId={submission.id}
                  onClick={() => setSelectedSubmission(submission)}
                  className={`group p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden backdrop-blur-xl
                    ${selectedSubmission?.id === submission.id ? 'bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.1)]' : 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-800/50 hover:border-slate-700'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/10">
                        {submission.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{submission.fullName}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                          <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {submission.internshipDomain}</span>
                          <span className="w-1 h-1 bg-slate-700 rounded-full" />
                          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {submission.experienceRating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${submission.aiSentiment === 'Positive' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : submission.aiSentiment === 'Negative' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-400'}`}>
                        {submission.aiSentiment || 'Analyzing...'}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(submission.id!); }}
                        className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Details Section */}
          <div className="xl:col-span-1">
            <AnimatePresence mode="wait">
              {selectedSubmission ? (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="sticky top-8 bg-slate-900 border border-slate-800 rounded-3xl p-8 overflow-y-auto max-h-[calc(100vh-4rem)] custom-scrollbar"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white">Performance Entry</h2>
                    <button 
                      onClick={() => generateReport(selectedSubmission)}
                      className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 text-sm font-bold"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* Hero Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30">
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">XP Rating</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-white">{selectedSubmission.experienceRating}</span>
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30">
                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Growth</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-white">{selectedSubmission.improvementRating}</span>
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                        </div>
                      </div>
                    </div>

                    {/* AI Insights Card */}
                    <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                      <BrainCircuit className="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-500/5 rotate-12" />
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                          <BrainCircuit className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-bold text-white">AI Assessment Summary</h4>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed italic">
                        "{selectedSubmission.aiSummary || 'Analysis in progress...'}"
                      </p>
                    </div>

                    {/* Details List */}
                    <div className="space-y-6">
                       <DetailItem icon={Calendar} label="Internship Duration" value={selectedSubmission.duration} />
                       <DetailItem icon={Mail} label="Contact Email" value={selectedSubmission.email} />
                       <DetailRow label="Key Skills Learned" value={selectedSubmission.skillsLearned} color="blue" />
                       <DetailRow label="Project Delivered" value={selectedSubmission.projectWorkedOn} color="emerald" />
                       <DetailRow label="Challenges Overcome" value={selectedSubmission.challengesFaced} color="rose" />
                       <DetailRow label="Next Career Goals" value={selectedSubmission.careerGoals} color="purple" />
                    </div>

                    <div className="pt-6 border-t border-slate-800">
                      <div className={`p-4 rounded-xl flex items-center justify-between ${selectedSubmission.recommendAnswer ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        <span className="text-sm font-bold uppercase tracking-wider">Recommendation</span>
                        <div className="flex items-center gap-2">
                          {selectedSubmission.recommendAnswer ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                          <span className="font-bold">{selectedSubmission.recommendAnswer ? 'Willing to refer' : 'Not willing to refer'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center h-[400px] flex flex-col items-center justify-center opacity-50 grayscale">
                  <ChevronRight className="w-12 h-12 text-slate-700 animate-pulse border-2 border-slate-800 rounded-full mb-4" />
                  <p className="text-slate-500 font-medium">Select a submission to view full breakdown and AI analysis.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="flex items-center gap-4 group">
    <div className="w-10 h-10 bg-slate-800/50 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  </div>
);

const DetailRow = ({ label, value, color }: { label: string, value: string, color: string }) => {
  const colors: any = {
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    rose: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
    purple: 'text-purple-400 border-purple-500/20 bg-purple-500/5'
  };

  return (
    <div className={`p-5 rounded-2xl border ${colors[color] || 'border-slate-800 bg-slate-800/20'}`}>
      <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-70">{label}</p>
      <p className="text-sm font-medium leading-relaxed text-slate-200">{value}</p>
    </div>
  );
}

export default AdminInternshipReviews;
