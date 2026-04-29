import { db } from './db';
import { CandidateProfile, Invitation } from '../types';

export const getCandidates = async (): Promise<CandidateProfile[]> => {
    return await db.getCandidates();
};

export const addCandidate = async (candidate: Omit<CandidateProfile, 'id' | 'status'>) => {
    const newCandidate: CandidateProfile = {
        ...candidate,
        id: `cand-${Date.now()}`,
        status: 'Idle'
    };
    await db.addCandidate(newCandidate);
    return newCandidate;
};

export const generateInvitation = async (candidateEmail: string, candidateName: string, examId: string): Promise<Invitation> => {
    const token = `sentinel_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;
    const invite: Invitation = {
        token,
        examId,
        candidateEmail,
        candidateName,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        used: false
    };

    await db.addInvitation(invite);
    return invite;
};

export const getInvitations = async (): Promise<Invitation[]> => {
    return await db.getInvitations();
};

export const validateToken = async (token: string): Promise<Invitation | null> => {
    const invite = await db.getInvitation(token);

    if (!invite) return null;
    if (new Date(invite.expiresAt) < new Date()) return null; // Expired

    return invite;
};

export const sendMockEmail = async (invite: Invitation) => {
    // Simulate API call
    console.log(`Sending email to ${invite.candidateEmail} with link: /start/${invite.token}`);
    await new Promise(r => setTimeout(r, 800));
    return true;
};

