import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Send, CheckCircle, ChevronRight, ChevronLeft, 
  BookOpen, Laptop, Code, BarChart, ShieldCheck, 
  Search, Link as LinkIcon, AlertCircle, Info, HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/db';
import { generateInternshipSummary } from '../services/aiService';
import { sendInternshipEndNotification } from '../services/emailService';
import { InternshipSubmission } from '../types';

const steps = [
  { id: 'basics', title: 'Basics', icon: BookOpen },
  { id: 'project', title: 'Project', icon: Laptop },
  { id: 'challenge', title: 'Learning', icon: Code },
  { id: 'feedback', title: 'Feedback', icon: BarChart },
  { id: 'final', title: 'Submit', icon: ShieldCheck }
];

const InternshipEndForm: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Expanded Form Data
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    internshipDomain: '',
    duration: '',
    
    // Project Specifics
    projectTitle: '',
    projectDescription: '',
    projectTools: '',
    projectObjective: '',
    projectPerformanceRating: 5,
    
    // Challenges & Skills
    projectChallenges: '',
    projectSolutions: '',
    newSkillsGained: '',
    
    // Feedback & Usage
    overallExperience: 5,
    mentorshipRating: 5,
    portfolioUsed: 'No', // "Yes" / "No"
    portfolioLink: '',
    recommendation: 'Yes',
    recommendReason: '',
    
    // Legal & Agreements
    exclusivityAgreement: false,
    finalDeclaration: false,
  });

  const updateForm = (updates: any) => setFormData(prev => ({ ...prev, ...updates }));

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.exclusivityAgreement || !formData.finalDeclaration) {
        alert("Please accept all agreements before submitting.");
        return;
    }

    setIsSubmitting(true);
    try {
      const submissionData = {
        userId: user?.id || 'anon',
        fullName: formData.fullName,
        email: formData.email,
        internshipDomain: formData.internshipDomain,
        duration: formData.duration,
        experienceRating: formData.overallExperience,
        skillsLearned: formData.newSkillsGained,
        projectWorkedOn: formData.projectTitle,
        mentorshipRating: formData.mentorshipRating,
        challengesFaced: formData.projectChallenges,
        challengeSolutions: formData.projectSolutions,
        mostLiked: formData.projectObjective, // mapping objective for summary logic
        improvements: formData.projectDescription,
        recommendAnswer: formData.recommendation === 'Yes',
        recommendReason: formData.recommendReason,
        improvementRating: formData.projectPerformanceRating,
        careerGoals: formData.portfolioLink || 'None provided',
        isAgreed: formData.finalDeclaration,
        submittedAt: new Date().toISOString(),
      } as InternshipSubmission;

      const { summary, sentiment } = await generateInternshipSummary(submissionData);
      submissionData.aiSummary = summary;
      submissionData.aiSentiment = sentiment;

      await db.addInternshipSubmission(submissionData);
      await sendInternshipEndNotification(submissionData, 'careerplusee@gmail.com');
      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit. Check your internet and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-outfit">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-xl w-full bg-slate-900/60 backdrop-blur-2xl border border-blue-500/20 p-12 rounded-[2.5rem] text-center shadow-[0_0_50px_rgba(59,130,246,0.1)]">
          <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce transition-all">
            <CheckCircle className="w-12 h-12 text-blue-400" />
          </div>
          <h2 className="text-4xl font-black mb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Journey Completed!</h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">Your final internship project and feedback have been successfully archived. Our team will review your AI Performance Report and share next steps soon.</p>
          <button onClick={() => window.location.href = '/dashboard'} className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all rounded-3xl font-black text-xl shadow-xl shadow-blue-900/30">Back to Dashboard</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-outfitSelection p-4 lg:p-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="mb-12 text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-6">
            <Info className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-black tracking-widest text-[10px] lg:text-xs uppercase">Heal Bharat Services • Final Milestone</span>
          </motion.div>
          <h1 className="text-4xl lg:text-6xl font-black mb-4 tracking-tighter text-white">Internship <span className="text-blue-500 italic">Closure</span> Form</h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">Structural feedback for high-performers. Please provide detailed answers for your AI performance report.</p>
        </header>

        {/* Desktop Stepper */}
        <div className="hidden lg:flex justify-between items-center mb-16 gap-4">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-4 group">
                  <div className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all duration-500 font-black text-xl border-2 ${isActive ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]' : isCompleted ? 'bg-blue-500/20 border-blue-400/30 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                    {isCompleted ? <CheckCircle className="w-7 h-7" /> : <step.icon className="w-7 h-7" />}
                  </div>
                  <div>
                    <h3 className={`text-sm font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-500'}`}>{step.title}</h3>
                  </div>
                </div>
                {index < steps.length - 1 && <div className={`flex-1 h-1 rounded-full transition-all duration-1000 ${isCompleted ? 'bg-blue-500' : 'bg-slate-800'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile Progress Bar */}
        <div className="lg:hidden mb-10">
            <div className="flex justify-between items-end mb-3">
                <span className="text-blue-500 font-black tracking-widest text-xs uppercase">{steps[currentStep].title}</span>
                <span className="text-slate-500 text-xs font-bold">Step {currentStep + 1} of {steps.length}</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <motion.div initial={{ width: 0 }} animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
            </div>
        </div>

        {/* Form Box */}
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-blue-500/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          {isSubmitting && (
            <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6" />
              <p className="text-white font-black tracking-widest uppercase text-sm">Uploading Your Record...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 lg:p-14">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-2 h-10 bg-blue-600 rounded-full" />
                    <h2 className="text-3xl font-black text-white">Identity & Domain <span className="text-red-500">*</span></h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField 
                        label={user ? "Full Name (Auto)" : "Full Name"} 
                        value={formData.fullName} 
                        onChange={user ? undefined : (e: any) => updateForm({ fullName: e.target.value })}
                        readOnly={!!user} 
                        required 
                    />
                    <InputField 
                        label={user ? "Email Address (Auto)" : "Email Address"} 
                        value={formData.email} 
                        onChange={user ? undefined : (e: any) => updateForm({ email: e.target.value })}
                        readOnly={!!user} 
                        required 
                    />
                    <InputField label="Internship Domain" placeholder="e.g. Web Development" value={formData.internshipDomain} onChange={(e: any) => updateForm({ internshipDomain: e.target.value })} required />
                    <InputField label="Total Duration" placeholder="e.g. 3 Months" value={formData.duration} onChange={(e: any) => updateForm({ duration: e.target.value })} required />
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                   <div className="flex items-center gap-3 mb-8">
                    <div className="w-2 h-10 bg-indigo-600 rounded-full" />
                    <h2 className="text-3xl font-black text-white">Project Specs</h2>
                  </div>
                  <InputField label="🧩 What was the title of your project?" placeholder="Project Name..." value={formData.projectTitle} onChange={e => updateForm({ projectTitle: e.target.value })} required />
                  <TextAreaField label="💻 Briefly describe your project (2-3 lines)." placeholder="Explain the core functionality..." value={formData.projectDescription} onChange={e => updateForm({ projectDescription: e.target.value })} required />
                  <TextAreaField label="🛠 Which technologies/tools did you use?" placeholder="React, Node.js, Firebase, Tailwind..." value={formData.projectTools} onChange={e => updateForm({ projectTools: e.target.value })} required />
                  <TextAreaField label="🎯 What was your main objective?" placeholder="To solve problem X by doing Y..." value={formData.projectObjective} onChange={e => updateForm({ projectObjective: e.target.value })} required />
                  
                  <div className="pt-6 border-t border-slate-800">
                    <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-6">📊 How would you rate your project performance?</label>
                    <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => updateForm({ projectPerformanceRating: star })} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${formData.projectPerformanceRating >= star ? 'bg-yellow-500 text-slate-900 shadow-xl shadow-yellow-500/20' : 'bg-slate-800 text-slate-600'}`}>
                          <Star className={`w-7 h-7 ${formData.projectPerformanceRating >= star ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-2 h-10 bg-emerald-600 rounded-full" />
                    <h2 className="text-3xl font-black text-white">Challenges & Growth</h2>
                  </div>
                  <TextAreaField label="⚡ What challenges did you face while building?" value={formData.projectChallenges} onChange={e => updateForm({ projectChallenges: e.target.value })} required />
                  <TextAreaField label="🧠 How did you solve those challenges?" value={formData.projectSolutions} onChange={e => updateForm({ projectSolutions: e.target.value })} required />
                  <TextAreaField label="📈 What new skills or knowledge did you gain?" value={formData.newSkillsGained} onChange={e => updateForm({ newSkillsGained: e.target.value })} required />
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                   <div className="flex items-center gap-3 mb-8">
                    <div className="w-2 h-10 bg-purple-600 rounded-full" />
                    <h2 className="text-3xl font-black text-white">Portfolio & Feedback</h2>
                  </div>
                  
                  <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/30">
                    <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-6">🔍 Have you used this project elsewhere (GitHub, portfolio, etc.)?</label>
                    <div className="flex gap-4 mb-6">
                      {['Yes', 'No'].map(opt => (
                        <button key={opt} type="button" onClick={() => updateForm({ portfolioUsed: opt })} className={`flex-1 py-4 rounded-2xl font-black transition-all border ${formData.portfolioUsed === opt ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>{opt}</button>
                      ))}
                    </div>
                    {formData.portfolioUsed === 'Yes' && (
                       <InputField label="Provide link (Portfolio/GitHub)" placeholder="https://..." value={formData.portfolioLink} onChange={e => updateForm({ portfolioLink: e.target.value })} required />
                    )}
                  </div>

                  <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/30">
                    <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Will you recommend this internship to others?</label>
                    <div className="flex gap-4 mb-6">
                      {['Yes', 'No'].map(opt => (
                        <button key={opt} type="button" onClick={() => updateForm({ recommendation: opt })} className={`flex-1 py-4 rounded-2xl font-black transition-all border ${formData.recommendation === opt ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>{opt}</button>
                      ))}
                    </div>
                    <TextAreaField label="Tell us why?" value={formData.recommendReason} onChange={e => updateForm({ recommendReason: e.target.value })} required />
                  </div>

                  <div className="pt-6 border-t border-slate-800">
                    <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-6">🌟 Rate Your Overall Journey</label>
                    <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => updateForm({ overallExperience: star })} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${formData.overallExperience >= star ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-800 text-slate-600'}`}>
                          <Star className={`w-7 h-7 ${formData.overallExperience >= star ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-2 h-10 bg-emerald-500 rounded-full" />
                    <h2 className="text-3xl font-black text-white">Agreements <span className="text-red-500">*</span></h2>
                  </div>

                  <div className="space-y-6">
                    <AgreementBox 
                      id="ag1"
                      checked={formData.exclusivityAgreement} 
                      onChange={e => updateForm({ exclusivityAgreement: e.target.checked })}
                      icon={<ShieldCheck className="w-6 h-6 text-blue-400" />}
                      label="🔒 I agree that this project is submitted exclusively to Heal Bharat Services and will not be reused or shared elsewhere without permission."
                    />
                    <AgreementBox 
                      id="ag2"
                      checked={formData.finalDeclaration} 
                      onChange={e => updateForm({ finalDeclaration: e.target.checked })}
                      icon={<CheckCircle className="w-6 h-6 text-emerald-400" />}
                      label="✅ I confirm that all the information provided is true and I have completed my internship sincerely."
                    />
                  </div>

                  <div className="bg-blue-900/10 border border-blue-500/20 p-8 rounded-3xl mt-10">
                    <p className="text-blue-400 text-sm italic font-bold leading-relaxed flex items-start gap-3">
                        <HelpCircle className="w-6 h-6 flex-shrink-0" />
                        Reminder: Once submitted, your AI-generated performance report will be generated and shared with the certification team. This cannot be undone.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer Nav */}
            <div className="mt-16 pt-10 border-t border-slate-800/50 flex justify-between gap-4">
               {currentStep > 0 && (
                <button type="button" onClick={handleBack} className="flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black transition-all">
                  <ChevronLeft className="w-6 h-6" /> BACK
                </button>
              )}
              {currentStep < steps.length - 1 ? (
                <button type="button" onClick={handleNext} className="flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-3xl font-black ml-auto shadow-2xl shadow-blue-900/40 transition-all uppercase tracking-widest text-sm">
                  Continue <ChevronRight className="w-6 h-6" />
                </button>
              ) : (
                <button type="submit" disabled={!formData.finalDeclaration || !formData.exclusivityAgreement || isSubmitting} className={`flex items-center gap-2 px-10 py-5 text-white rounded-3xl font-black ml-auto shadow-2xl transition-all uppercase tracking-widest text-sm ${formData.finalDeclaration && formData.exclusivityAgreement && !isSubmitting ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                  <Send className="w-5 h-5" /> SUBMIT MY RECORD
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, readOnly, ...props }: any) => (
  <div className="group space-y-2">
    <label className="block text-[10px] lg:text-xs font-black text-slate-500 uppercase tracking-widest transition-colors group-focus-within:text-blue-500">{label}</label>
    <input {...props} readOnly={readOnly} className={`w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold ${readOnly ? 'opacity-50 cursor-not-allowed bg-slate-950' : 'hover:border-slate-700'}`} />
  </div>
);

const TextAreaField = ({ label, ...props }: any) => (
  <div className="group space-y-2">
    <label className="block text-[10px] lg:text-xs font-black text-slate-500 uppercase tracking-widest transition-colors group-focus-within:text-blue-500">{label}</label>
    <textarea {...props} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold min-h-[120px] hover:border-slate-700" />
  </div>
);

const AgreementBox = ({ id, checked, onChange, icon, label }: any) => (
  <label htmlFor={id} className={`flex items-start gap-6 p-6 rounded-3xl border-2 cursor-pointer transition-all ${checked ? 'bg-blue-600/10 border-blue-500 shadow-xl shadow-blue-500/10' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}>
    <div className="relative mt-1">
      <input type="checkbox" id={id} checked={checked} onChange={onChange} className="sr-only" />
      <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${checked ? 'bg-blue-500 border-blue-500' : 'border-slate-700 bg-slate-950'}`}>
        {checked && <CheckCircle className="w-6 h-6 text-white" />}
      </div>
    </div>
    <div className="flex gap-4">
      <div className="hidden sm:block mt-1">{icon}</div>
      <p className={`text-sm lg:text-base font-black leading-relaxed ${checked ? 'text-white' : 'text-slate-400'}`}>{label}</p>
    </div>
  </label>
);

export default InternshipEndForm;
