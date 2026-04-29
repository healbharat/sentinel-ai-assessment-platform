import emailjs from '@emailjs/browser';
import { Invitation } from '../types';

// NOTE to USER: Replace these with your actual IDs from https://emailjs.com
// 1. Sign up for free at EmailJS
// 2. Create a generic "Service" (e.g. Gmail) -> Get Service ID
// 3. Create a generic "Template" -> Get Template ID
// 4. Get User ID (Public Key) from Account > General

// 🛑 SET THIS TO 'false' WHEN YOU ARE READY TO GO LIVE
// Currently 'true' to save your EmailJS quota during testing.
const MOCK_MODE = true; 

const SERVICE_ID = 'service_i35fblf';
const TEMPLATE_ID = 'template_00wl177';
const USER_ID = '58EVoeX9ooKMew-v_';

export const sendInvitationEmail = async (invitation: Invitation, recipientEmail?: string) => {
    const toEmail = recipientEmail || invitation.candidateEmail;
    if (MOCK_MODE) {
        console.log(`🛠️ [MOCK EMAIL] Invitation sent to: ${toEmail}`);
        return;
    }

    const link = `${window.location.origin}/start/${invitation.token}`;
    emailjs.init(USER_ID);

    const templateParams = {
        to_email: toEmail,
        email: toEmail, // FIX: Matching the default {{email}} variable in EmailJS templates
        recipient: toEmail,
        reply_to: toEmail,
        to_name: invitation.candidateName,
        name: invitation.candidateName, // Adding common alias
        exam_link: link,
        exam_id: invitation.examId
    };

    try {
        const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);
        console.log('SUCCESS!', response.status, response.text);
    } catch (error: any) {
        console.error('Email send failed:', error);
    }
};

export const sendCandidateResultEmail = async (result: any, recipientEmail: string) => {
    const toEmail = recipientEmail;
    if (MOCK_MODE) {
        console.log(`🛠️ [MOCK EMAIL] Candidate Result sent to: ${toEmail}`);
        return;
    }

    emailjs.init(USER_ID);

    const templateParams = {
        to_email: toEmail,
        email: toEmail,
        to_name: result.candidateName || 'Candidate',
        message: `Your exam ${result.examId} has been completed. Status: ${result.status}. Score: ${result.score}%`,
        score: result.score,
        status: result.status
    };

    try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);
        console.log('Result email sent successfully');
    } catch (error) {
        console.error('Failed to send result email:', error);
    }
};

export const sendAdminSummaryEmail = async (result: any, recipientEmail: string) => {
    if (MOCK_MODE) {
        console.log(`🛠️ [MOCK EMAIL] Admin Summary sent to: ${recipientEmail}`);
        return;
    }

    emailjs.init(USER_ID);

    const templateParams = {
        to_email: recipientEmail,
        email: recipientEmail,
        to_name: 'Admin',
        candidate_name: result.candidateName,
        exam_id: result.examId,
        score: result.score,
        status: result.status,
        message: `New assessment completed by ${result.candidateName}. Score: ${result.score}%`
    };

    try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);
        console.log('Admin summary email sent successfully');
    } catch (error) {
        console.error('Failed to send admin summary email:', error);
    }
};

export const sendInternshipEndNotification = async (submission: any, recipientEmail: string) => {
    if (MOCK_MODE) {
        console.log(`🛠️ [MOCK EMAIL] Internship Closure Notification sent to: ${recipientEmail}`);
        return;
    }

    emailjs.init(USER_ID);

    const templateParams = {
        to_email: recipientEmail,
        email: recipientEmail,
        to_name: 'Admin',
        candidate_name: submission.fullName,
        domain: submission.internshipDomain,
        rating: submission.experienceRating,
        sentiment: submission.aiSentiment,
        message: `Internship completion form submitted by ${submission.fullName} (${submission.internshipDomain}). Rating: ${submission.experienceRating}/5. Sentiment: ${submission.aiSentiment}. AI Summary: ${submission.aiSummary}`
    };

    try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);
        console.log('Internship notification email sent successfully');
    } catch (error) {
        console.error('Failed to send internship notification email:', error);
    }
};
