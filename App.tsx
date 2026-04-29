import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { RequireAuth } from './components/RequireAuth';
import { DashboardLayout } from './components/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { ExamInterface } from './pages/ExamInterface';
import { FinishScreen } from './pages/FinishScreen';
import { SettingsPage } from './pages/SettingsPage';
import { CreateAssessment } from './pages/CreateAssessment';
import { QuestionBank } from './pages/QuestionBank';
import { CandidatesPage } from './pages/CandidatesPage';
import { ExamEntryPage } from './pages/ExamEntryPage';
import { SystemCheckPage } from './pages/SystemCheckPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResultDetailsPage } from './pages/ResultDetailsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ReviewPage } from './pages/ReviewPage';
import { ReviewDashboard } from './pages/ReviewDashboard';
import { AdminInterviewPage } from './pages/AdminInterviewPage';
import { InterviewBookingPage } from './pages/InterviewBookingPage';
import { InterviewerLoginPage } from './pages/InterviewerLoginPage';
import { InterviewerDashboard } from './pages/InterviewerDashboard';
import { DocumentVerificationPage } from './pages/DocumentVerificationPage';
import { VerificationDashboard } from './pages/VerificationDashboard';
import { TaskSubmissionPage } from './pages/TaskSubmissionPage';
import { TaskSubmissionsDashboard } from './pages/TaskSubmissionsDashboard';
import InternshipEndForm from './pages/InternshipEndForm';
import AdminInternshipReviews from './pages/AdminInternshipReviews';

// Workday App Imports
import { WorkdayAuthProvider } from './contexts/WorkdayAuthContext';
import { WorkdayLayout } from './pages/workday/WorkdayLayout';
import { WorkdayLogin } from './pages/workday/WorkdayLogin';
import { StudentDashboard } from './pages/workday/StudentDashboard';
import { CompanyDashboard } from './pages/workday/CompanyDashboard';
import { AdminPanel } from './pages/workday/AdminPanel';
import { JobListingPage } from './pages/workday/JobListingPage';
import { JobDetailsPage } from './pages/workday/JobDetailsPage';

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <WorkdayAuthProvider>
          <BrowserRouter>
            <div className="font-sans text-gray-900">
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/start/:token" element={<ExamEntryPage />} />
              <Route path="/start/:token" element={<ExamEntryPage />} />
              <Route path="/system-check" element={<SystemCheckPage />} />
              <Route path="/feedback" element={<ReviewPage />} />
              <Route path="/book-interview/:sessionId" element={<InterviewBookingPage />} />
              <Route path="/interviewer-login/:accessId" element={<InterviewerLoginPage />} />
              <Route path="/interviewer-dashboard" element={<InterviewerDashboard />} />
              <Route path="/verify-docs/:studentId" element={<DocumentVerificationPage />} />
              <Route path="/submit-task" element={<TaskSubmissionPage />} />
              <Route path="/internship-end" element={<InternshipEndForm />} />

              {/* Protected Dashboard Routes (with Sidebar) */}
              <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/candidates" element={<CandidatesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/question-bank" element={<QuestionBank />} />
                <Route path="/result-details" element={<ResultDetailsPage />} />
                <Route path="/audit-logs" element={<AuditLogsPage />} />
                <Route path="/audit-logs" element={<AuditLogsPage />} />
                <Route path="/reviews" element={<ReviewDashboard />} />
                <Route path="/interviews" element={<AdminInterviewPage />} />
                <Route path="/verification" element={<VerificationDashboard />} />
                <Route path="/create-assessment" element={<CreateAssessment />} />
                <Route path="/task-submissions" element={<TaskSubmissionsDashboard />} />
                <Route path="/internship-reviews" element={<AdminInternshipReviews />} />
              </Route>

              {/* Standalone Protected Routes (No Sidebar) */}
              {/* Standalone Candidate Routes (Public/Token safeguarded) */}
              <Route path="/exam" element={<ExamInterface />} />
              <Route path="/finish" element={<FinishScreen />} />

              {/* Workday Routes */}
              <Route path="/workday/login" element={<WorkdayLogin />} />
              <Route path="/workday" element={<WorkdayLayout />}>
                <Route index element={<Navigate to="/workday/login" replace />} />
                <Route path="student" element={<StudentDashboard />} />
                <Route path="company" element={<CompanyDashboard />} />
                <Route path="admin" element={<AdminPanel />} />
                <Route path="jobs" element={<JobListingPage />} />
                <Route path="jobs/:id" element={<JobDetailsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </BrowserRouter>
        </WorkdayAuthProvider>
      </AuthProvider>
    </SettingsProvider >
  );
};

export default App;