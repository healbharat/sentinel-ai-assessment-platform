import React, { useState } from 'react';
import { db } from '../services/db';
import { CheckCircle, AlertCircle, Send, Code, Link as LinkIcon, Phone, Mail, User } from 'lucide-react';
import { TaskSubmission } from '../types';

export const TaskSubmissionPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        liveLink: '',
        githubLink: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const submission: TaskSubmission = {
                ...formData,
                submittedAt: new Date().toISOString()
            };
            await db.addTaskSubmission(submission);
            setSuccess(true);
            setFormData({ name: '', email: '', phone: '', liveLink: '', githubLink: '' });
        } catch (err: any) {
            console.error(err);
            setError('Failed to submit task. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Code className="h-6 w-6 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Task Submission
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Submit your completed task below
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-indigo-100 sm:rounded-2xl sm:px-10 border border-gray-100">
                    {success ? (
                        <div className="rounded-xl bg-green-50 p-6 flex flex-col items-center justify-center text-center space-y-4">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                            <div>
                                <h3 className="text-lg font-medium text-green-800">Submission Successful!</h3>
                                <p className="text-sm text-green-600 mt-2">Your task has been successfully submitted and is under review.</p>
                            </div>
                            <button
                                onClick={() => setSuccess(false)}
                                className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                            >
                                Submit Another
                            </button>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <div className="flex">
                                        <AlertCircle className="h-5 w-5 text-red-400" />
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="liveLink" className="block text-sm font-medium text-gray-700">
                                    Live Project Link
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LinkIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="liveLink"
                                        name="liveLink"
                                        type="url"
                                        required
                                        value={formData.liveLink}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                        placeholder="https://my-project.vercel.app"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="githubLink" className="block text-sm font-medium text-gray-700">
                                    GitHub Repository Link
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Code className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="githubLink"
                                        name="githubLink"
                                        type="url"
                                        required
                                        value={formData.githubLink}
                                        onChange={handleChange}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                        placeholder="https://github.com/username/repo"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Submitting...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <Send className="h-4 w-4" />
                                            <span>Submit Task</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
