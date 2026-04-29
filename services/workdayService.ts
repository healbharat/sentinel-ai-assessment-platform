import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, where, serverTimestamp, addDoc, deleteDoc, onSnapshot, orderBy
} from 'firebase/firestore';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export type Role = 'student' | 'company' | 'admin';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: Role;
  createdAt: any;
  phone?: string;
  skills?: string[];
  education?: string;
  resumeURL?: string;
}

export interface Company {
  companyId: string;
  name: string;
  email: string;
  verified: boolean;
  createdAt: any;
}

export interface Job {
  jobId?: string;
  companyId: string;
  companyName?: string;
  title: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  requirements: string[];
  postedAt: any;
}

export interface AssessmentData {
  assigned: boolean;
  testLink: string;
  score: number | null;
  status: 'Not Assigned' | 'Pending' | 'Completed';
}

export interface InterviewData {
  assigned: boolean;
  slotLink: string;
  status: 'Not Assigned' | 'Scheduled' | 'Completed' | 'Rejected';
}

export interface OnboardingData {
  assigned: boolean;
  documentLink: string;
  status: 'Not Started' | 'Pending' | 'Verified';
}

export interface Application {
  applicationId?: string;
  jobId: string;
  userId: string;
  name: string;
  email: string;
  resumeURL: string;
  status: 'Applied' | 'Shortlisted' | 'Test Assigned' | 'Test Completed' | 'Interview' | 'Rejected' | 'Selected' | 'Onboarding Complete';
  finalStatus?: 'Offer Sent' | 'Rejected' | 'Selected' | '';
  appliedAt: any;
  jobTitle?: string;
  companyName?: string;
  assessment?: AssessmentData;
  interview?: InterviewData;
  onboarding?: OnboardingData;
}

export const saveUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const docSnap = await getDoc(doc(db, 'users', userId));
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const saveCompanyProfile = async (companyId: string, data: Partial<Company>) => {
  const compRef = doc(db, 'companies', companyId);
  await setDoc(compRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

export const uploadResume = async (userId: string, file: File): Promise<string> => {
  const fileRef = ref(storage, `resumes/${userId}_${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};

export const createJob = async (jobData: Omit<Job, 'jobId' | 'postedAt'>) => {
  const jobsRef = collection(db, 'jobs');
  const docRef = await addDoc(jobsRef, {
    ...jobData,
    postedAt: serverTimestamp()
  });
  await updateDoc(docRef, { jobId: docRef.id });
  return docRef.id;
};

export const getJobs = async (companyId?: string): Promise<Job[]> => {
  const jobsRef = collection(db, 'jobs');
  let q = query(jobsRef);
  if (companyId) {
    q = query(jobsRef, where("companyId", "==", companyId));
  }
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as Job);
};

export const getJobDetails = async (jobId: string): Promise<Job | null> => {
  const snap = await getDoc(doc(db, 'jobs', jobId));
  if (snap.exists()) {
    return snap.data() as Job;
  }
  return null;
};

export const applyJob = async (applicationData: Omit<Application, 'applicationId' | 'status' | 'appliedAt'>) => {
  // Check if student applied already
  const appsRef = collection(db, 'applications');
  const q = query(appsRef, where("jobId", "==", applicationData.jobId), where("userId", "==", applicationData.userId));
  const existing = await getDocs(q);
  if (!existing.empty) {
    throw new Error('You have already applied for this job.');
  }

    const docRef = await addDoc(appsRef, {
    ...applicationData,
    status: 'Applied',
    finalStatus: '',
    assessment: {
      assigned: false,
      testLink: "",
      score: null,
      status: "Not Assigned"
    },
    interview: {
      assigned: false,
      slotLink: "",
      status: "Not Assigned"
    },
    onboarding: {
      assigned: false,
      documentLink: "",
      status: "Not Started"
    },
    appliedAt: serverTimestamp()
  });
  await updateDoc(docRef, { applicationId: docRef.id });
  return docRef.id;
};

export const getApplicationsForJob = async (jobId: string): Promise<Application[]> => {
  const appsRef = collection(db, 'applications');
  const q = query(appsRef, where("jobId", "==", jobId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as Application);
};

export const getApplicationsForStudent = async (userId: string): Promise<Application[]> => {
  const appsRef = collection(db, 'applications');
  const q = query(appsRef, where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as Application);
};

export const subscribeToApplicationsForStudent = (userId: string, callback: (apps: Application[]) => void) => {
  const appsRef = collection(db, 'applications');
  const q = query(appsRef, where("userId", "==", userId));
  return onSnapshot(q, (snap) => {
    const apps = snap.docs.map(doc => doc.data() as Application);
    callback(apps);
  });
};

export const updateApplicationStatus = async (applicationId: string, status: string) => {
  const docRef = doc(db, 'applications', applicationId);
  await updateDoc(docRef, { status });
};

export const forceUpdateApplicationStatus = async (applicationId: string, status: string) => {
  const docRef = doc(db, 'applications', applicationId);
  await updateDoc(docRef, { status });
};

const createAuditLog = async (applicationId: string, action: string, performedBy: string, details?: any) => {
  await addDoc(collection(db, 'auditLogs'), {
    applicationId,
    action,
    performedBy,
    performedAt: serverTimestamp(),
    details: details || {}
  });
};

export const assignAssessment = async (applicationId: string, testLink: string, adminId: string = 'admin') => {
  const docRef = doc(db, 'applications', applicationId);
  await updateDoc(docRef, {
    "assessment.assigned": true,
    "assessment.testLink": testLink,
    "assessment.status": "Pending",
    status: "Test Assigned"
  });
  await createAuditLog(applicationId, 'Test Assigned', adminId, { testLink });
};

export const updateTestResult = async (applicationId: string, score: number, adminId: string = 'admin') => {
  const docRef = doc(db, 'applications', applicationId);
  await updateDoc(docRef, {
    "assessment.status": "Completed",
    "assessment.score": score,
    status: score >= 50 ? "Test Completed" : "Rejected",
    finalStatus: score < 50 ? "Rejected" : ""
  });
  await createAuditLog(applicationId, 'Test Result Updated', adminId, { score });
};

export const assignInterview = async (applicationId: string, slotLink: string, adminId: string = 'admin') => {
  const docRef = doc(db, 'applications', applicationId);
  await updateDoc(docRef, {
    "interview.assigned": true,
    "interview.slotLink": slotLink,
    "interview.status": "Scheduled",
    status: "Interview"
  });
  await createAuditLog(applicationId, 'Interview Assigned', adminId, { slotLink });
};

export const markInterviewResult = async (applicationId: string, result: 'Selected' | 'Rejected', adminId: string = 'admin') => {
  const docRef = doc(db, 'applications', applicationId);
  await updateDoc(docRef, {
    "interview.status": result === 'Selected' ? 'Completed' : 'Rejected',
    status: result,
    finalStatus: result === 'Rejected' ? 'Rejected' : ''
  });
  await createAuditLog(applicationId, 'Interview Result Marked', adminId, { result });
};

export const assignVerification = async (applicationId: string, documentLink: string, adminId: string = 'admin') => {
  const docRef = doc(db, 'applications', applicationId);
  await updateDoc(docRef, {
    "onboarding.assigned": true,
    "onboarding.documentLink": documentLink,
    "onboarding.status": "Pending",
    status: "Document Verification"
  });
  await createAuditLog(applicationId, 'Verification Link Assigned', adminId, { documentLink });
};

export const assignOnboarding = async (applicationId: string, documentLink: string, adminId: string = 'admin') => {
  const docRef = doc(db, 'applications', applicationId);
  await updateDoc(docRef, {
    "onboarding.assigned": true,
    "onboarding.documentLink": documentLink,
    "onboarding.status": "Pending"
  });
  await createAuditLog(applicationId, 'Onboarding Link Assigned', adminId, { documentLink });
};

export const approveOnboarding = async (applicationId: string, adminId: string = 'admin') => {
  const docRef = doc(db, 'applications', applicationId);
  await updateDoc(docRef, {
    "onboarding.status": "Verified",
    status: "Onboarding Complete"
  });
  await createAuditLog(applicationId, 'Onboarding Approved', adminId);
};

export const sendOffer = async (applicationId: string, adminId: string = 'admin') => {
  const docRef = doc(db, 'applications', applicationId);
  await updateDoc(docRef, {
    finalStatus: "Offer Sent"
  });
  await createAuditLog(applicationId, 'Offer Sent', adminId);
};

// Admin methods
export const getCompanies = async (): Promise<Company[]> => {
  const snap = await getDocs(collection(db, 'companies'));
  return snap.docs.map(doc => doc.data() as Company);
};

export const updateCompanyVerification = async (companyId: string, verified: boolean) => {
  const docRef = doc(db, 'companies', companyId);
  await updateDoc(docRef, { verified });
};

export const getAllApplications = async (): Promise<Application[]> => {
  const snap = await getDocs(collection(db, 'applications'));
  return snap.docs.map(doc => doc.data() as Application);
};

// Announcements
export interface Announcement {
  id?: string;
  title: string;
  content: string;
  postedAt: any;
}

export const getAnnouncements = async (): Promise<Announcement[]> => {
  const snap = await getDocs(collection(db, 'announcements'));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
};

export const subscribeToAnnouncements = (callback: (announcements: Announcement[]) => void) => {
  const q = query(collection(db, 'announcements'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
  });
};

export const createAnnouncement = async (data: Omit<Announcement, 'id' | 'postedAt'>) => {
  await addDoc(collection(db, 'announcements'), {
    ...data,
    postedAt: serverTimestamp()
  });
};

// Tickets
export interface Ticket {
  ticketId?: string;
  userId: string;
  message: string;
  status: 'Open' | 'Closed';
  createdAt: any;
  reply?: string;
}

export const createTicket = async (userId: string, message: string) => {
  const ref = await addDoc(collection(db, 'tickets'), {
    userId,
    message,
    status: 'Open',
    createdAt: serverTimestamp()
  });
  await updateDoc(ref, { ticketId: ref.id });
};

export const getTicketsForUser = async (userId: string): Promise<Ticket[]> => {
  const q = query(collection(db, 'tickets'), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as Ticket);
};

export const subscribeToTickets = (userId: string, callback: (tickets: Ticket[]) => void) => {
  const q = query(collection(db, 'tickets'), where("userId", "==", userId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => doc.data() as Ticket));
  });
};

export const getAllTickets = async (): Promise<Ticket[]> => {
  const snap = await getDocs(collection(db, 'tickets'));
  return snap.docs.map(doc => doc.data() as Ticket);
};

export const replyToTicket = async (ticketId: string, reply: string) => {
  const docRef = doc(db, 'tickets', ticketId);
  await updateDoc(docRef, { reply, status: 'Closed' });
};

// Chats
export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  sentAt: any;
}

export const subscribeToChat = (applicationId: string, callback: (messages: ChatMessage[]) => void) => {
  const messagesRef = collection(db, 'chats', applicationId, 'messages');
  const q = query(messagesRef, orderBy('sentAt', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
  });
};

export const sendChatMessage = async (applicationId: string, senderId: string, senderName: string, text: string) => {
  const messagesRef = collection(db, 'chats', applicationId, 'messages');
  await addDoc(messagesRef, {
    senderId,
    senderName,
    text,
    sentAt: serverTimestamp()
  });
};
