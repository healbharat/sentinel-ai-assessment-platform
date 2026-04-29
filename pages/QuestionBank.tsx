import React, { useState, useMemo, useEffect, useRef } from 'react';
import { db } from '../services/db';
import { Question, QuestionType, QuestionCategory, QuestionDifficulty } from '../types';
import { Button } from '../components/ui/Button';
import { Plus, Upload, Search, Database, Shuffle, Sparkles, Filter, Bot, Loader2, Tag, BarChart3, Hash, Trash2 } from 'lucide-react';
import { generateAIQuestions } from '../services/aiService';
import { FULL_QUESTION_BANK } from '../data/mockQuestions';

export const QuestionBank: React.FC = () => {
    // State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');

    // AI State
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // File Input Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Real-time Data Sync
    useEffect(() => {
        // Subscribe to real-time updates
        const unsubscribe = db.subscribeToQuestions((data) => {
            setQuestions(data);
        });
        return () => unsubscribe();
    }, []);

    // Handlers
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            // Handle both Windows (\r\n) and Unix (\n) line endings
            const lines = text.split(/\r?\n/).slice(1); // Skip header
            let count = 0;
            let skipped = 0;

            console.log(`[CSV Import] Found ${lines.length} lines (excluding header)`);

            for (const line of lines) {
                if (!line.trim()) continue;

                // Robust CSV split: Handles content in quotes, e.g., "Question, with comma",Type,...
                const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                // Fallback if regex doesn't match expected structure, usually simple split works for simple cases, 
                // but let's try a better approach:
                // This regex splits by comma but respects quotes: 
                const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || line.split(',');

                // Clean up values (remove surrounding quotes)
                const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

                if (cleanValues.length < 1) {
                    skipped++;
                    continue;
                }

                // Expected: Text, Type, Difficulty, Points, Options(A|B|C|D), CorrectIndex
                const qText = cleanValues[0];
                const qTypeRaw = cleanValues[1];
                const qDiffRaw = cleanValues[2];
                const qPoints = cleanValues[3];
                // Optional: Allow pipe-separated options in 5th column: "Opt1|Opt2|Opt3"
                const qOptionsRaw = cleanValues[4];
                const qCorrectIdx = cleanValues[5];

                if (qText) {
                    const type = (qTypeRaw?.trim().toUpperCase() as QuestionType);
                    const validTypes = Object.values(QuestionType);
                    const finalType = validTypes.includes(type) ? type : QuestionType.MCQ;

                    const diff = (qDiffRaw?.trim().toUpperCase() as QuestionDifficulty);
                    const validDiffs = Object.values(QuestionDifficulty);
                    const finalDiff = validDiffs.includes(diff) ? diff : QuestionDifficulty.MEDIUM;

                    // Parse Options
                    let options = ['Option A', 'Option B', 'Option C', 'Option D'];
                    if (finalType === QuestionType.MCQ && qOptionsRaw) {
                        const parsedOpts = qOptionsRaw.split('|').map(o => o.trim());
                        if (parsedOpts.length >= 2) options = parsedOpts;
                    }

                    const newQ: Question = {
                        id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        text: qText,
                        type: finalType,
                        difficulty: finalDiff,
                        points: Number(qPoints) || 10,
                        category: QuestionCategory.TECHNICAL, // Default
                        options: finalType === QuestionType.MCQ ? options : undefined,
                        correctOptionIndex: Number(qCorrectIdx) || 0
                    };

                    try {
                        await db.addQuestion(newQ);
                        count++;
                    } catch (err) {
                        console.error("Failed to add question:", newQ, err);
                        skipped++;
                    }
                } else {
                    skipped++;
                }
            }
            alert(`Import Report:\n✅ Successfully imported: ${count}\n⚠️ Skipped/Failed: ${skipped}\n\nCheck console for details if needed.`);
        };
        reader.readAsText(file);
        // Reset input to allow selecting the same file again
        event.target.value = '';
    };

    const handleCreateQuestion = async () => {
        const text = prompt("Enter Question Text:");
        if (!text) return;

        const newQ: Question = {
            id: `q-${Date.now()}`,
            text: text,
            type: QuestionType.MCQ,
            category: QuestionCategory.TECHNICAL,
            difficulty: QuestionDifficulty.MEDIUM,
            points: 10,
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            correctOptionIndex: 0
        };
        await db.addQuestion(newQ);
    };

    const handleDeleteQuestion = async (id: string) => {
        if (confirm("Are you sure you want to delete this question?")) {
            await db.deleteQuestion(id);
        }
    };

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        try {
            const newQuestions = await generateAIQuestions(aiPrompt);
            // Save to DB
            for (const q of newQuestions) {
                await db.addQuestion({ ...q, id: `ai-${Date.now()}-${Math.random()}` });
            }
            setAiPrompt('');
        } catch (error) {
            console.error(error);
            alert("Failed to generate questions via AI.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSeedData = async () => {
        if (!confirm("This will add 87 default questions to your database. Continue?")) return;

        try {
            let added = 0;
            // Batch this in real app, but loop is fine here for <100
            for (const q of FULL_QUESTION_BANK) {
                // Check uniqueness optionally, or just add
                await db.addQuestion({ ...q, id: `seed-${q.id}-${Date.now()}` }); // Unique ID to prevent overwrites if re-seeded
                added++;
            }
            alert(`Database populated successfully with ${added} questions!`);
        } catch (e) {
            console.error(e);
            alert("Failed to seed database.");
        }
    };

    // Filter Logic
    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            const matchesCategory = activeCategory === 'All' || q.category === activeCategory;
            const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
            const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesCategory && matchesDifficulty && matchesSearch;
        });
    }, [questions, activeCategory, difficultyFilter, searchQuery]);

    const getDifficultyColor = (diff?: QuestionDifficulty) => {
        switch (diff) {
            case QuestionDifficulty.EASY: return 'bg-green-100 text-green-700 border-green-200';
            case QuestionDifficulty.MEDIUM: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case QuestionDifficulty.HARD: return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="bg-[#F8FAFC] min-h-full flex flex-col font-sans text-gray-900">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Database className="text-indigo-600" />
                            Question Bank
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Manage, organize, and generate assessment content.</p>
                    </div>
                    <div className="flex gap-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".csv"
                            onChange={handleFileChange}
                        />
                        <Button variant="secondary" onClick={handleImportClick}>
                            <Upload className="w-4 h-4 mr-2" /> Import CSV
                        </Button>
                        <Button onClick={handleCreateQuestion} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 text-white">
                            <Plus className="w-4 h-4 mr-2" /> Create Question
                        </Button>
                    </div>
                </div>

                {/* AI Generator Section - Compact */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 mb-6 relative overflow-hidden flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-lg shadow-sm text-indigo-600">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-gray-800">AI Generator</span>
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold tracking-wide">BETA</span>
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="Generate specific questions (e.g. '5 Hard React MCQs' or 'Python Coding Challenge')"
                                className="flex-1 border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white/60 shadow-inner"
                                onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
                            />
                            <Button
                                onClick={handleAIGenerate}
                                disabled={isGenerating || !aiPrompt.trim()}
                                size="sm"
                                className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50"
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
                                Generate
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    {/* Categories Tabs */}
                    <div className="flex bg-gray-100/80 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
                        {['All', ...Object.values(QuestionCategory)].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                                    ${activeCategory === cat
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search topic, content, tags..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                        </div>

                        {/* Difficulty Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                            <select
                                value={difficultyFilter}
                                onChange={(e) => setDifficultyFilter(e.target.value)}
                                className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer hover:border-gray-300"
                            >
                                <option value="All">All Levels</option>
                                <option value={QuestionDifficulty.EASY}>Easy</option>
                                <option value={QuestionDifficulty.MEDIUM}>Medium</option>
                                <option value={QuestionDifficulty.HARD}>Hard</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Content */}
            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">

                {/* Stats Summary (Optional) */}
                <div className="flex gap-4 mb-6">
                    <div className="bg-white border border-gray-200 p-3 rounded-lg flex items-center gap-3 shadow-sm px-5">
                        <span className="text-gray-500 text-sm font-medium">Available Questions</span>
                        <span className="text-xl font-bold text-gray-900">{filteredQuestions.length}</span>
                    </div>
                </div>

                <div className="grid gap-4">
                    {filteredQuestions.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                            <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                <Search className="w-6 h-6 text-gray-300" />
                            </div>
                            <h3 className="text-gray-900 font-medium">No questions found</h3>
                            <p className="text-gray-500 text-sm mt-1 mb-4">Try adjusting your filters or populate the database.</p>

                            <Button variant="outline" onClick={handleSeedData}>
                                <Database className="w-4 h-4 mr-2" /> Load Default Questions
                            </Button>
                        </div>
                    ) : (filteredQuestions.map((q) => (
                        <div key={q.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group animate-slide-up hover:border-indigo-200">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Difficulty Badge */}
                                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getDifficultyColor(q.difficulty)}`}>
                                        {q.difficulty || 'Unrated'}
                                    </span>

                                    {/* Type Badge */}
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold border border-gray-200 uppercase">
                                        {q.type}
                                    </span>

                                    {/* Topic Badge */}
                                    {q.topic && (
                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-semibold flex items-center gap-1 border border-indigo-100">
                                            <Hash className="w-3 h-3" /> {q.topic}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Usage Stat */}
                                    <div className="hidden group-hover:flex items-center gap-1.5 text-xs text-gray-400">
                                        <BarChart3 className="w-3.5 h-3.5" />
                                        Used {q.usageCount || 0} times
                                    </div>

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <button className="text-gray-400 hover:text-indigo-600 text-xs font-semibold px-2 py-1 hover:bg-indigo-50 rounded">Edit</button>
                                        <button onClick={() => handleDeleteQuestion(q.id)} className="text-gray-400 hover:text-red-600 text-xs font-semibold px-2 py-1 hover:bg-red-50 rounded flex items-center gap-1">
                                            <Trash2 className="w-3 h-3" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h3 className="text-gray-800 font-medium text-base mb-2 leading-relaxed">{q.text}</h3>

                                    {/* Tags */}
                                    {q.tags && q.tags.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            {q.tags.map(tag => (
                                                <span key={tag} className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                                                    <Tag className="w-3 h-3" /> {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xl font-bold text-gray-900 min-w-[3rem] text-right">{q.points} <span className="text-xs font-normal text-gray-400 block">pts</span></span>
                            </div>

                            {/* Question Details Preview */}
                            <div className="mt-4 pt-4 border-t border-gray-50">
                                {q.type === QuestionType.MCQ && q.options && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {q.options.map((opt, i) => (
                                            <div key={i} className={`text-sm px-3 py-2 rounded-lg flex items-center gap-2 ${i === q.correctOptionIndex ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-500'}`}>
                                                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${i === q.correctOptionIndex ? 'bg-green-200 text-green-800' : 'bg-gray-200'}`}>
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {q.type === QuestionType.CODING && (
                                    <div className="bg-[#1e1e1e] rounded-lg p-3 font-mono text-xs text-gray-300 border border-gray-700">
                                        {q.codeTemplate}
                                    </div>
                                )}
                            </div>
                        </div>
                    )))}
                </div>
            </main>
        </div>
    );
};
