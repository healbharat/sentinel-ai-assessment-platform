import { startTransition } from 'react';

// Mock Scoring Service
export const evaluateExam = async (responses: any[]) => {
    // Simulate Evaluation Delay
    await new Promise(r => setTimeout(r, 1500));

    let score = 0;
    let totalPossible = 0;

    // Simulate grading 10 MCQs + 1 Coding Question
    // Logic: Randomize for demo purposes, but in real app would match keys
    const mockScore = Math.floor(Math.random() * 30) + 60; // 60-90 range usually

    // Plagiarism Check (Simulated)
    const plagiarismScore = Math.floor(Math.random() * 10); // 0-10% usually safe

    return {
        score: mockScore,
        plagiarismScore: plagiarismScore,
        passed: mockScore > 70,
        breakdown: {
            mcq: Math.floor(mockScore * 0.4),
            coding: Math.floor(mockScore * 0.6)
        }
    };
};
