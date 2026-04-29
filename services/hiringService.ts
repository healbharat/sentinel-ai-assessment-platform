import { db } from './db';
import { CandidateResult } from '../types';

export const runAutoHiringPipeline = async (minScore: number = 70, maxCheatScore: number = 20) => {
    console.log("Starting Auto-Hiring Pipeline...");
    db.addLog({
        actor: 'System (Auto-Hire)',
        action: 'Pipeline Started',
        details: `Criteria: Score >= ${minScore}, Cheat <= ${maxCheatScore}`,
        severity: 'Info'
    });

    const results = await db.getResults();
    let processedCount = 0;
    let shortlistedCount = 0;
    let rejectedCount = 0;

    // Simulate batch processing delay
    await new Promise(r => setTimeout(r, 1500));

    results.forEach((res) => {
        // Only process if status is pending or we are re-evaluating
        // For this demo, we re-evaluate purely based on scores to show the effect

        let newStatus: CandidateResult['status'] = 'Rejected';
        let action = '';

        if (res.score >= minScore && res.cheatScore <= maxCheatScore) {
            newStatus = 'Selected';
            action = 'Offer Letter Generated';
            shortlistedCount++;
        } else {
            newStatus = 'Rejected';
            action = 'Rejection Email Sent';
            rejectedCount++;
        }

        // In a real app we'd update the DB record if changed.
        // Here we just log the "Action" taken by the pipeline

        db.addLog({
            actor: 'System (Auto-Hire)',
            action: action,
            details: `Candidate: ${res.candidateName}. Score: ${res.score}, Risk: ${res.cheatScore}%`,
            severity: newStatus === 'Selected' ? 'Info' : 'Warning'
        });

        processedCount++;
    });

    db.addLog({
        actor: 'System (Auto-Hire)',
        action: 'Pipeline Completed',
        details: `Processed ${processedCount}. Shortlisted: ${shortlistedCount}, Rejected: ${rejectedCount}`,
        severity: 'Info'
    });

    return { Processed: processedCount, Shortlisted: shortlistedCount, Rejected: rejectedCount };
};
