import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { AuditLog } from '../types';
import { Search, ShieldCheck, AlertOctagon, Info, FileText, Video } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const unsubscribe = db.subscribeToLogs((data) => {
            setLogs(data);
        });
        return () => unsubscribe();
    }, []);

    const filteredLogs = logs.filter(l =>
        l.action.toLowerCase().includes(filter.toLowerCase()) ||
        l.details.toLowerCase().includes(filter.toLowerCase()) ||
        l.actor.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-8 font-sans">
            <div className="max-w-6xl mx-auto w-full space-y-6">

                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-emerald-600" />
                            Audit & Compliance Logs
                        </h1>
                        <p className="text-gray-500 mt-2">Immutable record of all system activities, proctoring events, and automated actions.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search logs by actor, action, or details..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Actor</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4 text-right">Severity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No logs found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">{log.timestamp}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{log.actor}</td>
                                        <td className="px-6 py-4 flex items-center gap-2">
                                            {log.action.includes('Video') ? <Video className="w-4 h-4 text-indigo-500" /> :
                                                log.action.includes('Email') ? <FileText className="w-4 h-4 text-orange-500" /> :
                                                    <Info className="w-4 h-4 text-gray-400" />
                                            }
                                            {log.action}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate" title={log.details}>
                                            {log.details}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${log.severity === 'Critical' ? 'bg-red-50 text-red-700 border-red-100' :
                                                log.severity === 'Warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                    'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                {log.severity === 'Critical' && <AlertOctagon className="w-3 h-3 mr-1" />}
                                                {log.severity}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
