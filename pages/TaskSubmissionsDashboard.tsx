import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { TaskSubmission } from '../types';
import { MOCK_SUBMISSIONS } from '../constants';
import { Code, Link as LinkIcon, Phone, Mail, User, Trash2, Calendar, FileText, Copy, CheckCircle } from 'lucide-react';

export const TaskSubmissionsDashboard: React.FC = () => {
    const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const unsubscribe = db.subscribeToTaskSubmissions((data) => {
            setSubmissions(data.length > 0 ? data : MOCK_SUBMISSIONS);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this submission?')) {
            try {
                await db.deleteTaskSubmission(id);
            } catch (err) {
                console.error('Failed to delete submission', err);
                setError('Failed to delete submission');
            }
        }
    };

    const copyLink = () => {
        const link = `${window.location.origin}/submit-task`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <FileText className="w-6 h-6 mr-2 text-indigo-600" />
                        Task Submissions
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        View and manage tasks submitted by candidates.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={copyLink}
                        className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100 font-medium text-sm"
                    >
                        {copied ? (
                            <><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Copied Link!</>
                        ) : (
                            <><Copy className="w-4 h-4 mr-2" /> Share Form Link</>
                        )}
                    </button>
                    <div className="bg-white px-4 py-2 shadow rounded-lg border border-gray-100 flex items-center">
                        <span className="text-sm text-gray-500 mr-2">Total Submissions:</span>
                        <span className="text-lg font-bold text-indigo-600">{submissions.length}</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {submissions.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No submissions yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Wait for candidates to submit their tasks.</p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                    <ul className="divide-y divide-gray-200">
                        {submissions.map((sub) => (
                            <li key={sub.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                {sub.name}
                                            </h3>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(sub.submittedAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Mail className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                <a href={`mailto:${sub.email}`} className="hover:text-indigo-600 truncate">{sub.email}</a>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Phone className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                <a href={`tel:${sub.phone}`} className="hover:text-indigo-600">{sub.phone}</a>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <LinkIcon className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                <a href={sub.liveLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 hover:underline truncate">
                                                    {sub.liveLink}
                                                </a>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Code className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                                                <a href={sub.githubLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 hover:underline truncate">
                                                    {sub.githubLink}
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ml-4 flex-shrink-0 self-start">
                                        <button
                                            onClick={() => sub.id && handleDelete(sub.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            title="Delete Submission"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
