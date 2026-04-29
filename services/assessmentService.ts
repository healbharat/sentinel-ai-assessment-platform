import { db } from './db';
import { Exam, QuestionType } from '../types';
import { MOCK_EXAMS } from '../constants';

export const getAssessments = async (): Promise<Exam[]> => {
    const exams = await db.getExams();
    return exams.length > 0 ? exams : MOCK_EXAMS;
};

export const createAssessment = async (data: any): Promise<Exam> => {
    // Simulate AI Generation Delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get Questions from DB randomly based on criteria (Simulation)
    const allQuestions = await db.getQuestions();
    // Filter by type if implemented, for now just shuffle and slice
    const selectedQuestions = allQuestions
        .filter(q => q.type === (data.type === 'Coding' ? QuestionType.CODING : QuestionType.MCQ) || data.type === 'Mixed')
        .sort(() => 0.5 - Math.random())
        .slice(0, data.questionCount);

    // If we ran out of seeded questions, just reuse them for demo purposes
    const finalQuestions = selectedQuestions.length > 0 ? selectedQuestions : allQuestions.slice(0, data.questionCount);

    const newExam: Exam = {
        id: `exam-${Date.now()}`,
        title: data.title,
        description: data.description,
        type: data.type,
        difficulty: data.difficulty,
        durationMinutes: data.duration,
        questions: finalQuestions,
        status: 'active',
        securityLevel: data.securityLevel,
        passingScore: data.passingScore,
        questionCount: data.questionCount,
        createdAt: new Date().toISOString()
    };

    await db.saveExam(newExam);
    return newExam;
};
