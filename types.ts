export type OrganizationStatus = 'PENDING_VERIFICATION' | 'PENDING_PAYMENT' | 'PAID_PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'ON_HOLD';
export type OrganizationType = 'COLLEGE' | 'COMPANY';

export interface PaymentDetails {
  referenceId: string;
  amount: number;
  date: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  email: string;
  phone: string;
  address: string;
  authPersonName: string;
  status: OrganizationStatus;
  plan: 'ENTERPRISE_YEARLY';
  payment?: PaymentDetails;
  createdAt: string;
  // Basic settings snapshotted here, or referenced via SettingsContext
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COLLEGE_ADMIN = 'COLLEGE_ADMIN',
  COMPANY_HR = 'COMPANY_HR',
  FACULTY = 'FACULTY',
  CANDIDATE = 'CANDIDATE',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  organizationId?: string;
}

export enum QuestionType {
  MCQ = 'MCQ',
  CODING = 'CODING',
  SUBJECTIVE = 'SUBJECTIVE',
}

export enum QuestionCategory {
  APTITUDE = 'Aptitude',
  LOGICAL = 'Logical Reasoning',
  VERBAL = 'Verbal',
  TECHNICAL = 'Technical',
  CODING = 'Coding'
}

export enum QuestionDifficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  category?: QuestionCategory; // New
  difficulty?: QuestionDifficulty; // New
  topic?: string; // e.g. "Arrays", "Time & Work"
  tags?: string[];
  usageCount?: number;

  options?: string[]; // For MCQ
  correctOptionIndex?: number;
  codeTemplate?: string; // For Coding
  testCases?: { input: string; output: string }[];
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  type?: 'Aptitude' | 'Coding' | 'Technical' | 'Mixed';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  durationMinutes: number;
  questions?: Question[]; // Optional now, as we might use rounds
  rounds?: RoundConfig[]; // New: For multi-stage assessments
  status: 'active' | 'upcoming' | 'completed' | 'PUBLISHED';
  securityLevel?: 'high' | 'medium' | 'low';
  passingScore?: number;
  questionCount: number;
  createdAt?: string;
}

export interface ProctorEvent {
  id: string;
  timestamp: Date;
  type: 'TAB_SWITCH' | 'FACE_MISSING' | 'MULTIPLE_FACES' | 'NOISE_DETECTED' | 'RESIZE' | 'COPY_PASTE' | 'PHONE_DETECTED';
  severity: 'low' | 'medium' | 'high';
  screenshotUrl?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

export interface CandidateResult {
  candidateId: string;
  candidateName: string;
  score: number;
  cheatScore: number;
  status: 'Selected' | 'Rejected' | 'Pending';
  completedAt: string;
  breakdown: {
    mcq: number;
    coding: number;
  };
  timeTakenMinutes?: number;
  recordingUrl?: string; // New field for playback
  department?: string; // New field for College/Admin view
}



export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  status: 'Idle' | 'Invited' | 'In Progress' | 'Completed';
  assignedExamId?: string;
  invitedAt?: string;
}

export interface Invitation {
  token: string;
  examId: string;
  candidateEmail: string;
  candidateName: string;
  expiresAt: string;
  used: boolean;
}

// --- ROUND ARCHITECTURE ---

export enum RoundType {
  APTITUDE = 'APTITUDE',
  TECHNICAL = 'TECHNICAL',
  CODING = 'CODING',
  BEHAVIORAL = 'BEHAVIORAL'
}

export interface RoundConfig {
  id: string;
  order: number;
  title: string;
  type: RoundType;
  description?: string;

  // Configuration
  isEnabled: boolean;
  durationMinutes: number;
  passingScore: number; // Percentage or absolute
  totalMarks: number;
  weightage: number; // For final score calculation

  // Content (depending on type)
  questionCount?: number;
  questions?: Question[]; // Array of question objects

  // Specific for Coding
  codingProblems?: {
    title: string;
    problemStatement: string;
    constraints: string;
    starterCode?: string;
    solution?: string;
    language?: string;
    testCases: { input: string; output: string; hidden: boolean }[];
  }[];
}

export interface AssessmentPipeline {
  id: string;
  name: string;
  description: string;
  rounds: RoundConfig[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  createdByOrgId: string;
}

export interface CandidateRoundStatus {
  roundId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  score: number;
  feedback?: string;
  completedAt?: string;
}

export interface CandidateAssessmentProgress {
  candidateId: string;
  assessmentId: string;
  currentRoundOrder: number; // 1, 2, 3...
  overallStatus: 'IN_PROGRESS' | 'QUALIFIED' | 'REJECTED';
  roundHistory: CandidateRoundStatus[];
}

// Update existing CandidateResult to reference this new structure if needed, 
// but for now we keep CandidateResult for backward compatibility or strict reporting.
export interface CandidateResult {
  candidateId: string;
  candidateName: string;
  score: number;
  cheatScore: number;
  status: 'Selected' | 'Rejected' | 'Pending';
  completedAt: string;
  breakdown: {
    mcq: number;
    coding: number;
  };
  timeTakenMinutes?: number;
  recordingUrl?: string;
  department?: string;

  // Link to detailed progress
  progressId?: string;
}

export interface OrganizationSettings {
  orgName: string;
  orgLogoUrl: string;
  theme: 'light' | 'dark';
  securityLevel: 'high' | 'medium' | 'low';
  emailBranding: boolean;
  plan: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  emailEnabled?: boolean;
}

export interface Review {
  id: string;
  studentName?: string;
  assessmentDate: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface InterviewSlot {
  id: string;
  timeLabel: string; // e.g., "14:00 - 14:06"
  isBooked: boolean;
  bookedBy?: {
    name: string;
    email: string;
    status?: 'Selected' | 'Rejected' | 'Pending';
  };
  bookedAt?: string;
}

export interface InterviewSession {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  slotDuration: number;
  meetLink: string;
  slots: InterviewSlot[]; // Array of slots
  totalSlots: number;
  createdAt: string;
}

export interface InterviewAccess {
  id: string; // Serves as the unique token in URL
  sessionId: string;
  hrName: string;
  hrEmail: string;
  accessPin: string; // 4-digit pin
  createdAt: string;
}

export interface SelectedStudent {
  id: string; // Unique ID (could be email or composite)
  name: string;
  email: string;
  phone?: string;
  interviewSessionId?: string; // Reference, but not dependent for existence
  selectedAt: string;
  status: 'PENDING_DOCS' | 'DOCS_UPLOADED' | 'VERIFIED' | 'REJECTED_DOCS';
  documents: {
    aadharUrl?: string;
    marksheetUrl?: string;
    passportPhotoUrl?: string;
  };
}

export interface TaskSubmission {
  id?: string;
  name: string;
  email: string;
  phone: string;
  liveLink: string;
  githubLink: string;
  submittedAt: string;
}

export interface InternshipSubmission {
  id?: string;
  userId: string;
  fullName: string;
  email: string;
  internshipDomain: string;
  duration: string;
  experienceRating: number;
  skillsLearned: string;
  projectWorkedOn: string;
  mentorshipRating: number;
  challengesFaced: string;
  challengeSolutions: string;
  mostLiked: string;
  improvements: string;
  recommendAnswer: boolean;
  recommendReason: string;
  improvementRating: number;
  careerGoals: string;
  isAgreed: boolean;
  submittedAt: string;
  aiSummary?: string;
  aiSentiment?: string;
}