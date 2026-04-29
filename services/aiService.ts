import { Question, QuestionType } from '../types';

export const generateAIQuestions = async (prompt: string): Promise<Question[]> => {
    // Simulate AI Latency
    await new Promise(resolve => setTimeout(resolve, 2500));

    const questions: Question[] = [];
    const timestamp = Date.now();

    // Simple keyword based generation logic for DEMO purposes
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('web development')) {
        questions.push(
            {
                id: `ai_${timestamp}_1`,
                text: "What is the specific difference between 'visibility: hidden' and 'display: none' in CSS?",
                type: QuestionType.MCQ,
                options: [
                    "'visibility: hidden' removes the element from layout, while 'display: none' hides it but keeps space.",
                    "'display: none' removes the element from layout, while 'visibility: hidden' hides it but keeps space.",
                    "They are identical in behavior.",
                    "'visibility: hidden' affects accessibility tools, while 'display: none' does not."
                ],
                correctOptionIndex: 1,
                points: 5
            },
            {
                id: `ai_${timestamp}_2`,
                text: "Implement a function `debounce(fn, delay)` that limits the rate at which a function can fire.",
                type: QuestionType.CODING,
                codeTemplate: "function debounce(fn, delay) {\n  // Write your code here\n}",
                points: 20
            },
            {
                id: `ai_${timestamp}_3`,
                text: "Explain the concept of Event Bubbling and Event Capturing in the DOM.",
                type: QuestionType.SUBJECTIVE,
                points: 10
            }
        );
    } else if (lowerPrompt.includes('python')) {
        questions.push(
            {
                id: `ai_${timestamp}_4`,
                text: "What represents a mutable ordered sequence of elements in Python?",
                type: QuestionType.MCQ,
                options: ["Tuple", "List", "Set", "Dictionary"],
                correctOptionIndex: 1,
                points: 5
            }
        );
    } else {
        // Generic fallback
        questions.push(
            {
                id: `ai_${timestamp}_gen_1`,
                text: `Explain the core principles of ${prompt} in your own words.`,
                type: QuestionType.SUBJECTIVE,
                points: 10
            }
        );
    }

    // Add some random variation
    for (let i = 0; i < 3; i++) {
        questions.push({
            id: `ai_${timestamp}_rand_${i}`,
            text: `AI Generated: Advanced analysis question regarding ${prompt} topic - Set #${i + 1}`,
            type: Math.random() > 0.5 ? QuestionType.MCQ : QuestionType.SUBJECTIVE,
            options: Math.random() > 0.5 ? ["True", "False", "Depends", "Unknown"] : undefined,
            correctOptionIndex: 0,
            points: 10
        });
    }

    return questions;
};
export const generateInternshipSummary = async (submission: any): Promise<{ summary: string; sentiment: string }> => {
    // Simulate AI Latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    const sentiment = submission.experienceRating >= 4 ? 'Positive' : submission.experienceRating >= 3 ? 'Neutral' : 'Negative';

    const summary = `The intern ${submission.fullName} has completed their ${submission.internshipDomain} internship. ` +
        `They rated their experience at ${submission.experienceRating}/5 and highlighted learning ${submission.skillsLearned}. ` +
        `They worked on the ${submission.projectWorkedOn} project and found the mentorship to be ${submission.mentorshipRating}/5. ` +
        `The intern faced challenges like ${submission.challengesFaced}, which they solved by ${submission.challengeSolutions}. ` +
        `Overall, they ${submission.recommendAnswer ? 'would' : 'would not'} recommend this internship.`;

    return { summary, sentiment };
};
