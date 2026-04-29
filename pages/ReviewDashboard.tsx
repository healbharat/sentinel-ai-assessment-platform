import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { Review } from '../types';
import { MOCK_REVIEWS } from '../constants';
import { Star, MessageSquare, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ReviewDashboard: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState({ avg: 0, total: 0, distribution: [0, 0, 0, 0, 0] });

    useEffect(() => {
        const unsub = db.subscribeToReviews((data) => {
            const displayData = data.length > 0 ? data : MOCK_REVIEWS;
            setReviews(displayData);

            // Calc stats
            const total = displayData.length;
            const sum = displayData.reduce((acc, r) => acc + r.rating, 0);
            const avg = total ? (sum / total).toFixed(1) : '0.0';

            const dist = [0, 0, 0, 0, 0];
            displayData.forEach(r => {
                const idx = Math.max(0, Math.min(4, Math.floor(r.rating) - 1));
                dist[idx]++;
            });

            setStats({ avg: Number(avg), total, distribution: dist });
        });
        return () => unsub();
    }, []);

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Feedback Analytics</h1>
                    <p className="text-gray-500 mt-1">Real-time student sentiment analysis</p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center">
                        <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Average Rating</p>
                        <h3 className="text-4xl font-bold text-gray-900">{stats.avg}</h3>
                        <div className="flex text-yellow-400 text-xs mt-1">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} className={`w-3 h-3 ${s <= Math.round(stats.avg) ? 'fill-current' : 'text-gray-200'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Total Reviews</p>
                        <h3 className="text-4xl font-bold text-gray-900">{stats.total}</h3>
                        <p className="text-xs text-green-600 font-semibold mt-1">+12% vs last week</p>
                    </div>
                </div>

                {/* Rating Distribution Mini Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center gap-2">
                    {[5, 4, 3, 2, 1].map((star, i) => (
                        <div key={star} className="flex items-center gap-2 text-xs">
                            <span className="w-3 text-gray-400 font-medium">{star}</span>
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats.total ? (stats.distribution[star - 1] / stats.total) * 100 : 0}%` }}
                                    className="h-full bg-indigo-500 rounded-full"
                                />
                            </div>
                            <span className="w-6 text-right text-gray-500">{stats.distribution[star - 1]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews Grid */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    Recent Reviews <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-normal">{reviews.length}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {reviews.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No reviews submitted yet.</p>
                            </div>
                        ) : (
                            reviews.map((review, i) => (
                                <motion.div
                                    key={review.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm bg-gradient-to-br ${['from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-orange-400 to-red-500', 'from-purple-400 to-pink-500'][review.studentName?.length % 4 || 0]
                                                }`}>
                                                {(review.studentName || 'A').charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">{review.studentName || 'Anonymous'}</h4>
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {new Date(review.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="px-2 py-1 bg-yellow-50 rounded-lg flex items-center gap-1 text-xs font-bold text-yellow-700">
                                            {review.rating} <Star className="w-3 h-3 fill-current" />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-gray-600 text-sm leading-relaxed italic">"{review.comment}"</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
