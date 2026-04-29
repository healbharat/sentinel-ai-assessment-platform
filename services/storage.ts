import { db } from './db';

const STORAGE_KEY = 'sentinel_results'; // Keep if referenced elsewhere or remove if safe

export const saveResult = async (result: any) => {
    // Adapter to match db expected type if needed, or just pass through
    // db.saveResult expects CandidateResult
    await db.saveResult(result);
};

export const getResults = async (): Promise<any[]> => {
    return await db.getResults();
};

export const getAllCandidates = async () => {
    // Import MOCK_CANDIDATES dynamically or fallback if circular dependency
    // For now we assume MOCK_CANDIDATES are available or we reproduce them
    const mocks = [
        {
            candidateId: 'c-101',
            candidateName: 'John Doe',
            score: 88,
            cheatScore: 2,
            status: 'Selected',
            completedAt: 'Oct 12, 2023'
        },
        {
            candidateId: 'c-102',
            candidateName: 'Sarah Smith',
            score: 64,
            cheatScore: 45,
            status: 'Rejected',
            completedAt: 'Oct 11, 2023'
        },
        {
            candidateId: 'c-103',
            candidateName: 'Mike Johnson',
            score: 92,
            cheatScore: 0,
            status: 'Selected',
            completedAt: 'Oct 10, 2023'
        },
    ];
    return [...(await getResults()), ...mocks];
}
