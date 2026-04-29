import { Question, QuestionType, QuestionCategory, QuestionDifficulty, UserRole, CandidateResult, Exam, TaskSubmission, Review } from './types';

export const MOCK_USER = {
  id: 'u1',
  name: 'Krishana',
  email: 'admin@sentinel.ai',
  role: UserRole.SUPER_ADMIN,
  avatarUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
};

// Expanded & Structured Question Bank
import { FULL_QUESTION_BANK } from './data/mockQuestions';

// Expanded & Structured Question Bank
export const MOCK_QUESTIONS: Question[] = [
  ...FULL_QUESTION_BANK,

  // Specific Demo Questions (Preserved)
  {
    id: 'demo-1',
    type: QuestionType.MCQ,
    category: QuestionCategory.TECHNICAL,
    difficulty: QuestionDifficulty.EASY,
    topic: 'Algorithms',
    tags: ['algorithms', 'complexity'],
    text: 'What is the time complexity of a binary search algorithm?',
    options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'],
    correctOptionIndex: 1,
    points: 5,
    usageCount: 124
  },
];

export const MOCK_CANDIDATES: CandidateResult[] = [
  { candidateId: 'c1', candidateName: 'John Doe', score: 92, cheatScore: 5, status: 'Selected', completedAt: '2023-10-25', breakdown: { mcq: 45, coding: 47 }, recordingUrl: 'https://example.com/rec1', department: 'Computer Science' },
  { candidateId: 'c2', candidateName: 'Jane Smith', score: 88, cheatScore: 12, status: 'Selected', completedAt: '2023-10-24', breakdown: { mcq: 40, coding: 48 }, recordingUrl: 'https://example.com/rec2', department: 'Information Tech' },
  { candidateId: 'c3', candidateName: 'Robert Brown', score: 45, cheatScore: 85, status: 'Rejected', completedAt: '2023-10-24', breakdown: { mcq: 20, coding: 25 }, recordingUrl: 'https://example.com/rec3', department: 'Electronics' },
  { candidateId: 'c4', candidateName: 'Emily Davis', score: 76, cheatScore: 2, status: 'Pending', completedAt: '2023-10-26', breakdown: { mcq: 36, coding: 40 }, department: 'Computer Science' },
  { candidateId: 'c5', candidateName: 'Michael Wilson', score: 95, cheatScore: 0, status: 'Selected', completedAt: '2023-10-26', breakdown: { mcq: 50, coding: 45 }, department: 'Mechanical' },
];

export const MOCK_CANDIDATE_PROFILES = [
  { id: 'c1', name: 'John Doe', email: 'john@example.com', status: 'Completed', invitedAt: '2023-10-20' },
  { id: 'c2', name: 'Jane Smith', email: 'jane@example.com', status: 'Completed', invitedAt: '2023-10-21' },
  { id: 'c3', name: 'Robert Brown', email: 'robert@example.com', status: 'Completed', invitedAt: '2023-10-22' },
  { id: 'c4', name: 'Emily Davis', email: 'emily@example.com', status: 'In Progress', invitedAt: '2023-10-23' },
  { id: 'c5', name: 'Michael Wilson', email: 'michael@example.com', status: 'Completed', invitedAt: '2023-10-24' },
  { id: 'c5', name: 'Michael Wilson', email: 'michael@example.com', status: 'Completed', invitedAt: '2023-10-24' },
];

export const MOCK_EXAMS: Exam[] = [
  { id: 'e1', title: 'Senior Software Engineer - React', description: 'Advanced assessment for React specialists.', durationMinutes: 60, questionCount: 20, status: 'PUBLISHED', type: 'Technical', difficulty: 'Hard' },
  { id: 'e2', title: 'Graduate Aptitude Test', description: 'General aptitude and logical reasoning.', durationMinutes: 45, questionCount: 30, status: 'PUBLISHED', type: 'Aptitude', difficulty: 'Medium' },
  { id: 'e3', title: 'Python Backend Developer', description: 'Data structures, algorithms and Python concepts.', durationMinutes: 90, questionCount: 15, status: 'PUBLISHED', type: 'Coding', difficulty: 'Hard' },
  { id: 'e3', title: 'Python Backend Developer', description: 'Data structures, algorithms and Python concepts.', durationMinutes: 90, questionCount: 15, status: 'PUBLISHED', type: 'Coding', difficulty: 'Hard' },
];

export const MOCK_SUBMISSIONS: TaskSubmission[] = [
  { id: 's1', name: 'Adam Smith', email: 'adam@example.com', phone: '9876543210', githubLink: 'https://github.com/adam/react-task', liveLink: 'https://adam-react.vercel.app', submittedAt: '2023-11-01T10:00:00Z' },
  { id: 's2', name: 'Bella Thorne', email: 'bella@example.com', phone: '9876543211', githubLink: 'https://github.com/bella/api-service', liveLink: 'https://bella-api.railway.app', submittedAt: '2023-11-02T14:30:00Z' },
  { id: 's2', name: 'Bella Thorne', email: 'bella@example.com', phone: '9876543211', githubLink: 'https://github.com/bella/api-service', liveLink: 'https://bella-api.railway.app', submittedAt: '2023-11-02T14:30:00Z' },
];

export const MOCK_REVIEWS: Review[] = [
  { id: 'r1', studentName: 'Alice Cooper', assessmentDate: '2023-11-05', rating: 5, comment: 'Great assessment platform! Smooth experience.', createdAt: '2023-11-05T09:00:00Z' },
  { id: 'r2', studentName: 'Bob Marley', assessmentDate: '2023-11-06', rating: 4, comment: 'Interface is very clean and easy to use.', createdAt: '2023-11-06T11:00:00Z' },
  { id: 'r3', studentName: 'Charlie Brown', assessmentDate: '2023-11-07', rating: 5, comment: 'AI proctoring felt very professional.', createdAt: '2023-11-07T14:00:00Z' },
];

export const CHART_DATA_PERFORMANCE = [
  { name: 'Aptitude', score: 85 },
  { name: 'Technical', score: 72 },
  { name: 'Coding', score: 90 },
  { name: 'Behavioral', score: 78 },
];

export const CHART_DATA_HIRING_FUNNEL = [
  { stage: 'Applied', count: 1200 },
  { stage: 'Screened', count: 850 },
  { stage: 'Assessment', count: 400 },
  { stage: 'Interview', count: 120 },
  { stage: 'Offer', count: 45 },
];