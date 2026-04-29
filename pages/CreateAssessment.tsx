import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Button } from '../components/ui/Button';
import { RoundConfig, RoundType, Exam } from '../types';
import { Plus, Trash2, GripVertical, Settings as SettingsIcon, Save, ArrowRight, BrainCircuit, Code, MessagesSquare, FlaskConical, Loader2 } from 'lucide-react';

const DEFAULT_ROUNDS: RoundConfig[] = [
    { id: 'r1', order: 1, title: 'Aptitude & Logic', type: RoundType.APTITUDE, isEnabled: true, durationMinutes: 30, passingScore: 60, totalMarks: 50, weightage: 30 },
    { id: 'r2', order: 2, title: 'Technical Core', type: RoundType.TECHNICAL, isEnabled: true, durationMinutes: 45, passingScore: 60, totalMarks: 50, weightage: 30 },
    { id: 'r3', order: 3, title: 'Advanced Coding', type: RoundType.CODING, isEnabled: true, durationMinutes: 60, passingScore: 50, totalMarks: 100, weightage: 40 },
    { id: 'r4', order: 4, title: 'HR & Behavioral', type: RoundType.BEHAVIORAL, isEnabled: false, durationMinutes: 15, passingScore: 0, totalMarks: 0, weightage: 0 },
];

export const CreateAssessment: React.FC = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [rounds, setRounds] = useState<RoundConfig[]>(DEFAULT_ROUNDS);
    const [isSaving, setIsSaving] = useState(false);
    const [activeRoundId, setActiveRoundId] = useState<string | null>(null);

    const activeRound = rounds.find(r => r.id === activeRoundId);

    const toggleRound = (id: string) => {
        setRounds(prev => prev.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
    };

    const updateRoundConfig = (id: string, updates: Partial<RoundConfig>) => {
        setRounds(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const getRoundIcon = (type: RoundType) => {
        switch (type) {
            case RoundType.APTITUDE: return <BrainCircuit className="w-5 h-5 text-indigo-500" />;
            case RoundType.TECHNICAL: return <FlaskConical className="w-5 h-5 text-blue-500" />;
            case RoundType.CODING: return <Code className="w-5 h-5 text-purple-500" />;
            case RoundType.BEHAVIORAL: return <MessagesSquare className="w-5 h-5 text-pink-500" />;
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            alert("Please enter an assessment title.");
            return;
        }

        setIsSaving(true);
        try {
            const activeRounds = rounds.filter(r => r.isEnabled);
            const totalDuration = activeRounds.reduce((acc, r) => acc + r.durationMinutes, 0);

            const newExam: Exam = {
                id: `exam-${Date.now()}`,
                title: title,
                description: `${activeRounds.length} Rounds Evaluation Process`,
                durationMinutes: totalDuration,
                questionCount: activeRounds.length * 10, // Approximate
                status: 'PUBLISHED',
                rounds: activeRounds
            };

            await db.saveExam(newExam);

            // Log the action
            await db.addLog({
                actor: 'Admin',
                action: 'Assessment Created',
                details: `Created "${title}" with ${activeRounds.length} rounds.`,
                severity: 'Info'
            });

            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert("Failed to save assessment.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-full p-8 font-sans relative">
            {/* Modal Overlay */}
            {activeRound && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Configure {activeRound.title}</h3>
                            <Button size="sm" variant="ghost" onClick={() => setActiveRoundId(null)}>
                                <Loader2 className="w-4 h-4 hidden" /> {/* Dummy to keep imports valid if removed */}
                                ✕
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={activeRound.durationMinutes}
                                    onChange={(e) => updateRoundConfig(activeRound.id, { durationMinutes: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                                <input
                                    type="number"
                                    value={activeRound.passingScore}
                                    onChange={(e) => updateRoundConfig(activeRound.id, { passingScore: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Weightage (%)</label>
                                <input
                                    type="number"
                                    value={activeRound.weightage}
                                    onChange={(e) => updateRoundConfig(activeRound.id, { weightage: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setActiveRoundId(null)}>Done</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Assessment Pipeline</h1>
                        <p className="text-gray-500 mt-1">Design a multi-stage evaluation process.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => navigate('/dashboard')}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30">
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Publish Pipeline
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Configuration */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Basic Info */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Assessment Title</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Senior Full Stack Engineer Hiring 2024"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-medium"
                            />
                        </div>

                        {/* Rounds Pipeline */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <GripVertical className="w-4 h-4 text-gray-400" /> Evaluation Stages
                                </h3>
                                <Button size="sm" variant="ghost" className="text-indigo-600">
                                    <Plus className="w-4 h-4 mr-1" /> Add Round
                                </Button>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {rounds.map((round, index) => (
                                    <div key={round.id} className={`p-5 transition-all ${!round.isEnabled ? 'opacity-50 bg-gray-50' : 'bg-white hover:bg-gray-50/50'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded text-gray-400 font-bold text-sm">
                                                {index + 1}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    {getRoundIcon(round.type)}
                                                    <h4 className="font-bold text-gray-900 text-lg">{round.title}</h4>
                                                    {!round.isEnabled && <span className="bg-gray-200 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Disabled</span>}
                                                </div>
                                                <div className="text-sm text-gray-500 flex gap-4">
                                                    <span>{round.durationMinutes} mins</span>
                                                    <span>•</span>
                                                    <span>Pass Score: {round.passingScore}%</span>
                                                    <span>•</span>
                                                    <span>Weightage: {round.weightage}%</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Toggle Switch */}
                                                <button
                                                    onClick={() => toggleRound(round.id)}
                                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${round.isEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${round.isEnabled ? 'translate-x-6' : ''}`} />
                                                </button>

                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-gray-400 hover:text-gray-900"
                                                    title="Configure Round"
                                                    onClick={() => setActiveRoundId(round.id)}
                                                >
                                                    <SettingsIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Preview & Summary */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
                            <h3 className="font-bold text-gray-900 mb-4">Pipeline Summary</h3>

                            <div className="space-y-4 relative">
                                {rounds.filter(r => r.isEnabled).map((r, i, arr) => (
                                    <div key={r.id} className="relative z-10">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            {getRoundIcon(r.type)}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm truncate">{r.title}</div>
                                                <div className="text-xs text-gray-500">{r.durationMinutes}m</div>
                                            </div>
                                        </div>
                                        {i < arr.length - 1 && (
                                            <div className="flex justify-center py-1">
                                                <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {rounds.filter(r => r.isEnabled).length === 0 && (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        No active rounds selected.
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">Total Duration</span>
                                    <span className="font-bold">{rounds.filter(r => r.isEnabled).reduce((acc, r) => acc + r.durationMinutes, 0)} mins</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Total Rounds</span>
                                    <span className="font-bold">{rounds.filter(r => r.isEnabled).length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
