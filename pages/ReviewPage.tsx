import React, { useState } from 'react';
import { db } from '../services/db';
import { Review } from '../types';
import { Star, MessageSquare, Check, Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';

export const ReviewPage: React.FC = () => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [name, setName] = useState('');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please provide a rating.");
            return;
        }

        setIsSubmitting(true);
        try {
            const newReview: Review = {
                id: `rev-${Date.now()}`,
                studentName: name || 'Anonymous Student',
                assessmentDate: new Date().toLocaleDateString(),
                rating: rating,
                comment: comment,
                createdAt: new Date().toISOString()
            };

            await db.addReview(newReview);
            setSubmitted(true);
        } catch (error) {
            console.error("Failed to submit review", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md w-full border border-indigo-50"
                >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h2>
                    <p className="text-gray-500 mb-8">Your feedback helps us improve the assessment experience for everyone.</p>
                    <Button onClick={() => window.location.href = '/'} variant="outline">
                        Return to Home
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
            {/* Left Panel - Hero/Info */}
            <div className="hidden md:flex flex-col justify-center p-12 w-1/3 bg-indigo-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop')] bg-cover opacity-10 mix-blend-overlay"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-6">Your Voice Matters</h1>
                    <p className="text-indigo-200 text-lg leading-relaxed mb-8">
                        "Feedback is the breakfast of champions." <br className="hidden lg:block" />
                        Help us understand your experience to build better assessments.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-indigo-300">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full bg-indigo-700 border-2 border-indigo-900 flex items-center justify-center text-xs">
                                    <User className="w-4 h-4" />
                                </div>
                            ))}
                        </div>
                        <span>Join 2,000+ students who shared feedback</span>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-xl w-full"
                >
                    <div className="mb-10">
                        <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-3">
                            Post-Assessment Feedback
                        </span>
                        <h2 className="text-3xl font-bold text-gray-900">How did you perform today?</h2>
                        <p className="text-gray-500 mt-2">Rate your problem-solving experience.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Star Rating */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">Overall Rating</label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="focus:outline-none transition-transform hover:scale-110"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star
                                            className={`w-10 h-10 transition-colors ${star <= (hoverRating || rating)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'fill-gray-100 text-gray-300'
                                                }`}
                                        />
                                    </button>
                                ))}
                                <span className="ml-3 text-sm font-semibold text-indigo-600 w-24">
                                    {hoverRating ? ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoverRating - 1] : (rating ? ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1] : '')}
                                </span>
                            </div>
                        </div>

                        {/* Name (Optional) */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Your Name (Optional)</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Anonymous"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Any comments or suggestions?</label>
                            <div className="relative">
                                <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
                                <textarea
                                    required
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    placeholder="Tell us about the difficulty, clarity of questions, or any technical issues..."
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm resize-none"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting || !comment}
                            className="w-full py-4 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 rounded-xl transition-all"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Submitting...
                                </div>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Submit Feedback <Send className="w-5 h-5" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-xs text-gray-400 text-center">
                        Powered by Sentinel AI • Secure & Private Feedback System
                    </p>
                </motion.div>
            </div>
        </div>
    );
};
