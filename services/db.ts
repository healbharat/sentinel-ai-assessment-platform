import { db } from './firebase';
import {
    collection, getDocs, addDoc, setDoc, doc, deleteDoc,
    query, where, orderBy, onSnapshot, Timestamp, writeBatch
} from 'firebase/firestore';
import { User, Exam, CandidateResult, CandidateProfile, Invitation, Question, QuestionType, AuditLog, Organization } from '../types';

// Collection Names
const COLS = {
    USERS: 'users',
    EXAMS: 'exams',
    RESULTS: 'results',
    CANDIDATES: 'candidates',
    INVITATIONS: 'invitations',
    QUESTIONS: 'questions',
    LOGS: 'audit_logs',
    ORGS: 'organizations',
    REVIEWS: 'reviews',
    INTERVIEWS: 'interviews',
    INTERVIEW_ACCESS: 'interview_access',
    SELECTED_STUDENTS: 'selected_students',
    TASK_SUBMISSIONS: 'task_submissions',
    INTERNSHIP_SUBMISSIONS: 'internship_submissions'
};
import { Review, InterviewSession, InterviewAccess, SelectedStudent, TaskSubmission, InternshipSubmission } from '../types';

// ... (existing code)

// --- INTERVIEWS ---



// Seed Data (Only used if DB is empty to prevent broken UI)
// Seed Data (Only used if DB is empty to prevent broken UI)
import { FULL_QUESTION_BANK } from '../data/mockQuestions';

const SEED_QUESTIONS: Question[] = [
    // Include some simple defaults just in case
    { id: 'seed-1', text: 'Sample Question', type: QuestionType.MCQ, options: ['A', 'B', 'C'], correctOptionIndex: 0, points: 5 },
    ...FULL_QUESTION_BANK
];

class DatabaseService {
    // --- HELPER GENERIC METHODS ---
    private async getAll<T>(colName: string): Promise<T[]> {
        try {
            const snap = await getDocs(collection(db, colName));
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as T));
        } catch (e) {
            console.error(`Error get ${colName}`, e);
            return [];
        }
    }

    private async add<T>(colName: string, data: any, customId?: string) {
        try {
            if (customId) {
                await setDoc(doc(db, colName, customId), data);
                return { id: customId, ...data };
            } else {
                const docRef = await addDoc(collection(db, colName), data);
                return { id: docRef.id, ...data };
            }
        } catch (e) {
            console.error(`Error add ${colName}`, e);
            throw e;
        }
    }

    // --- INTERVIEWS ---
    subscribeToInterviewSessions(callback: (data: InterviewSession[]) => void) {
        const q = query(collection(db, COLS.INTERVIEWS), orderBy('date', 'desc'));
        return onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as InterviewSession));
            callback(list);
        }, (err) => {
            console.error("Error subscribing to interviews:", err);
            callback([]);
        });
    }

    async addInterviewSession(session: InterviewSession) {
        return this.add(COLS.INTERVIEWS, session, session.id);
    }

    async getInterviewSession(id: string) {
        try {
            const snap = await import('firebase/firestore').then(mod => mod.getDoc(mod.doc(db, COLS.INTERVIEWS, id)));
            if (snap.exists()) return { id: snap.id, ...snap.data() } as InterviewSession;
        } catch (e) {
            console.error(e);
        }
        return null;
    }

    async updateInterviewSession(id: string, updates: Partial<InterviewSession>) {
        try {
            await setDoc(doc(db, COLS.INTERVIEWS, id), updates, { merge: true });
        } catch (e) {
            console.error("Error update session", e);
        }
    }

    async deleteInterviewSession(id: string) {
        try {
            await deleteDoc(doc(db, COLS.INTERVIEWS, id));
        } catch (e) {
            console.error("Error delete session", e);
        }
    }

    async createInterviewAccess(access: InterviewAccess) {
        return this.add(COLS.INTERVIEW_ACCESS, access, access.id);
    }

    async getInterviewAccess(id: string) {
        try {
            const snap = await import('firebase/firestore').then(mod => mod.getDoc(mod.doc(db, COLS.INTERVIEW_ACCESS, id)));
            if (snap.exists()) return { id: snap.id, ...snap.data() } as InterviewAccess;
        } catch (e) {
            console.error(e);
        }
        return null;
    }

    // --- SELECTED STUDENTS ---
    async addSelectedStudent(student: SelectedStudent) {
        // Upsert by ID usually, but here ID might be derived or random. 
        // We prefer keeping one record per student. Let's assume ID is passed in student object.
        return this.add(COLS.SELECTED_STUDENTS, student, student.id);
    }

    async updateSelectedStudent(id: string, updates: Partial<SelectedStudent>) {
        try {
            await setDoc(doc(db, COLS.SELECTED_STUDENTS, id), updates, { merge: true });
        } catch (e) {
            console.error("Error update selected student", e);
        }
    }

    async getSelectedStudent(id: string) {
        try {
            const snap = await import('firebase/firestore').then(mod => mod.getDoc(mod.doc(db, COLS.SELECTED_STUDENTS, id)));
            if (snap.exists()) return { id: snap.id, ...snap.data() } as SelectedStudent;
        } catch (e) {
            console.error(e);
        }
        return null;
    }

    subscribeToSelectedStudents(callback: (data: SelectedStudent[]) => void) {
        const q = query(collection(db, COLS.SELECTED_STUDENTS));
        return onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as SelectedStudent));
            callback(list);
        }, (err) => {
            console.error("Error subscribing to selected students:", err);
            callback([]);
        });
    }

    async deleteSelectedStudent(id: string) {
        try {
            await deleteDoc(doc(db, COLS.SELECTED_STUDENTS, id));
        } catch (e) {
            console.error("Error delete selected student", e);
        }
    }

    // --- REALTIME LISTENERS ---
    subscribeToCandidates(callback: (data: CandidateProfile[]) => void) {
        const q = query(collection(db, COLS.CANDIDATES));
        return onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as CandidateProfile));
            callback(list);
        }, (err) => {
            console.error("Error subscribing to candidates:", err);
            callback([]);
        });
    }

    subscribeToResults(callback: (data: CandidateResult[]) => void) {
        const q = query(collection(db, COLS.RESULTS));
        return onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as CandidateResult));
            callback(list);
        }, (err) => {
            console.error("Error subscribing to results:", err);
            callback([]);
        });
    }

    subscribeToReviews(callback: (data: Review[]) => void) {
        const q = query(collection(db, COLS.REVIEWS), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Review));
            callback(list);
        }, (err) => {
            console.error("Error subscribing to reviews:", err);
            callback([]);
        });
    }

    async addReview(review: Review) {
        return this.add(COLS.REVIEWS, review);
    }

    subscribeToQuestions(callback: (data: Question[]) => void) {
        const q = query(collection(db, COLS.QUESTIONS));
        return onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as Question));
            callback(list);
        }, (err) => {
            console.error("Error subscribing to questions:", err);
            callback([]);
        });
    }

    // --- USERS ---
    async getUsers() { return this.getAll<User>(COLS.USERS); }
    async addUser(user: User) { return this.add(COLS.USERS, user, user.id); }

    // --- EXAMS ---
    async getExams() { return this.getAll<Exam>(COLS.EXAMS); }
    async saveExam(exam: Exam) { return this.add(COLS.EXAMS, exam, exam.id); }
    async getExamById(id: string) {
        const list = await this.getExams();
        return list.find(e => e.id === id);
    }

    // --- QUESTIONS ---
    async getQuestions() {
        const qs = await this.getAll<Question>(COLS.QUESTIONS);
        if (qs.length === 0) return SEED_QUESTIONS;
        return qs;
    }
    async addQuestion(q: Question) { return this.add(COLS.QUESTIONS, q, q.id); }
    async deleteQuestion(id: string) {
        try {
            await deleteDoc(doc(db, COLS.QUESTIONS, id));
        } catch (e) {
            console.error("Error delete question", e);
        }
    }

    // --- CANDIDATES ---
    async getCandidates() { return this.getAll<CandidateProfile>(COLS.CANDIDATES); }
    async addCandidate(c: CandidateProfile) {
        // Use the provided ID if it exists, otherwise let Firestore generate one
        return this.add(COLS.CANDIDATES, c, c.id);
    }

    async deleteCandidate(id: string) {
        try {
            await deleteDoc(doc(db, COLS.CANDIDATES, id));
        } catch (e) {
            console.error("Error delete candidate", e);
        }
    }

    async clearAllCandidates() {
        try {
            const snap = await getDocs(collection(db, COLS.CANDIDATES));
            if (snap.empty) return;

            // Firestore batches allow 500 ops
            let batch = writeBatch(db);
            let count = 0;

            for (const doc of snap.docs) {
                batch.delete(doc.ref);
                count++;
                if (count >= 400) {
                    await batch.commit();
                    batch = writeBatch(db);
                    count = 0;
                }
            }
            if (count > 0) {
                await batch.commit();
            }
        } catch (e) {
            console.error("Error clearing candidates", e);
            throw e;
        }
    }

    // --- INVITATIONS ---
    async getInvitations() { return this.getAll<Invitation>(COLS.INVITATIONS); }
    async addInvitation(inv: Invitation) { return this.add(COLS.INVITATIONS, inv); }
    async getInvitation(token: string) {
        // Query by token field
        const q = query(collection(db, COLS.INVITATIONS), where('token', '==', token));
        const snap = await getDocs(q);
        if (snap.empty) return undefined;
        return { id: snap.docs[0].id, ...snap.docs[0].data() } as unknown as Invitation;
    }

    // --- RESULTS ---
    async getResults() { return this.getAll<CandidateResult>(COLS.RESULTS); }
    async saveResult(res: CandidateResult) { return this.add(COLS.RESULTS, res); }
    async deleteResult(id: string) {
        try {
            await deleteDoc(doc(db, COLS.RESULTS, id));
        } catch (e) {
            console.error("Error delete result", e);
        }
    }

    // --- LOGS ---
    async getLogs() { return this.getAll<AuditLog>(COLS.LOGS); }
    async addLog(log: any) {
        const newLog = {
            ...log,
            timestamp: new Date().toLocaleString(), // Store pretty string or ISO
            createdAt: Timestamp.now() // For sorting 
        };
        return this.add(COLS.LOGS, newLog);
    }

    subscribeToLogs(callback: (data: AuditLog[]) => void) {
        const q = query(collection(db, COLS.LOGS), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as AuditLog));
            callback(list);
        }, (err) => {
            console.error("Error subscribing to logs:", err);
            callback([]);
        });
    }

    // --- ORGANIZATIONS ---
    async getOrganizations() { return this.getAll<Organization>(COLS.ORGS); }
    async addOrganization(org: Organization) { return this.add(COLS.ORGS, org); }
    async getOrganizationById(id: string) {
        const list = await this.getOrganizations();
        return list.find(o => o.id === id);
    }

    // --- TASK SUBMISSIONS ---
    async addTaskSubmission(submission: TaskSubmission) {
        return this.add(COLS.TASK_SUBMISSIONS, submission);
    }

    subscribeToTaskSubmissions(callback: (data: TaskSubmission[]) => void) {
        const q = query(collection(db, COLS.TASK_SUBMISSIONS), orderBy('submittedAt', 'desc'));
        return onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as TaskSubmission));
            callback(list);
        }, (err) => {
            console.error("Error subscribing to tasks:", err);
            callback([]);
        });
    }

    async deleteTaskSubmission(id: string) {
        try {
            await deleteDoc(doc(db, COLS.TASK_SUBMISSIONS, id));
        } catch (e) {
            console.error("Error delete task submission", e);
        }
    }

    // --- INTERNSHIP SUBMISSIONS ---
    async addInternshipSubmission(submission: InternshipSubmission) {
        return this.add(COLS.INTERNSHIP_SUBMISSIONS, submission);
    }

    subscribeToInternshipSubmissions(callback: (data: InternshipSubmission[]) => void) {
        const q = query(collection(db, COLS.INTERNSHIP_SUBMISSIONS), orderBy('submittedAt', 'desc'));
        return onSnapshot(q, (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as InternshipSubmission));
            callback(list);
        }, (err) => {
            console.error("Error subscribing to internship submissions:", err);
            callback([]);
        });
    }

    async deleteInternshipSubmission(id: string) {
        try {
            await deleteDoc(doc(db, COLS.INTERNSHIP_SUBMISSIONS, id));
        } catch (e) {
            console.error("Error delete internship submission", e);
        }
    }
}

const dbService = new DatabaseService();
export { dbService as db };
