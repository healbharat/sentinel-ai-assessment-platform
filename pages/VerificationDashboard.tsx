import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { SelectedStudent } from '../types';
import { FileText, CheckCircle, XCircle, Search, ExternalLink, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const VerificationDashboard: React.FC = () => {
    const [students, setStudents] = useState<SelectedStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<SelectedStudent | null>(null);

    useEffect(() => {
        const unsub = db.subscribeToSelectedStudents(setStudents);
        setLoading(false);
        return () => unsub();
    }, []);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleVerify = async (id: string) => {
        if (confirm("Are you sure you want to verify these documents?")) {
            await db.updateSelectedStudent(id, { status: 'VERIFIED' });
        }
    };

    const handleRejectDocs = async (id: string) => {
        if (confirm("Are you sure you want to reject these documents?")) {
            await db.updateSelectedStudent(id, { status: 'REJECTED_DOCS' });
        }
    };

    const copyLink = (id: string) => {
        const link = `${window.location.origin}/verify-docs/${id}`;
        navigator.clipboard.writeText(link);
        alert("Verification Link Copied!");
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
                    <p className="text-gray-500">Manage onboarding and verify candidate documents</p>
                </div>
                <Button onClick={() => {
                    const headers = ["Name", "Email", "Status", "Selected At"];
                    const csvContent = "data:text/csv;charset=utf-8,"
                        + headers.join(",") + "\n"
                        + students.map(s => {
                            return `"${s.name}","${s.email}","${s.status}","${new Date(s.selectedAt).toLocaleDateString()}"`;
                        }).join("\n");

                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "onboarding_candidates.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }} variant="outline">
                    <Download className="w-4 h-4 mr-2" /> Download CSV
                </Button>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row h-[700px]">
                {/* List Sidebar */}
                <div className="w-full md:w-1/3 border-r border-gray-100 flex flex-col">
                    <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Search candidates..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredStudents.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">No students found.</div>
                        ) : (
                            filteredStudents.map(student => (
                                <div
                                    key={student.id}
                                    onClick={() => setSelectedStudent(student)}
                                    className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedStudent?.id === student.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{student.name}</h3>
                                            <p className="text-xs text-gray-500">{student.email}</p>
                                        </div>
                                        <StatusBadge status={student.status} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail View */}
                <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
                    {selectedStudent ? (
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start animate-fade-in">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h2>
                                    <p className="text-gray-500">{selectedStudent.email}</p>
                                    <p className="text-xs text-gray-400 mt-1">Selected At: {new Date(selectedStudent.selectedAt).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => copyLink(selectedStudent.id)}>
                                        <ExternalLink className="w-4 h-4 mr-2" /> Copy Verify Link
                                    </Button>
                                </div>
                            </div>

                            {selectedStudent.status === 'PENDING_DOCS' ? (
                                <div className="bg-white p-12 rounded-xl border border-dashed border-gray-200 text-center">
                                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-gray-900 font-medium">Pending Documents</h3>
                                    <p className="text-gray-500 text-sm mt-2 mb-6">The candidate has not uploaded their documents yet.</p>
                                    <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm inline-block">
                                        Share this link with them: <br />
                                        <span className="font-mono mt-1 block select-all bg-white p-1 rounded border border-blue-200">
                                            {window.location.origin}/verify-docs/{selectedStudent.id}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-slide-up">
                                    <h3 className="text-lg font-bold text-gray-900">Uploaded Documents</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <DocCard title="Aadhar Card" url={selectedStudent.documents?.aadharUrl} />
                                        <DocCard title="Marksheet" url={selectedStudent.documents?.marksheetUrl} />
                                        <DocCard title="Passport Photo" url={selectedStudent.documents?.passportPhotoUrl} />
                                    </div>


                                    {(selectedStudent.status === 'DOCS_UPLOADED' || selectedStudent.status === 'REJECTED_DOCS') && (
                                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                                            <Button onClick={() => handleVerify(selectedStudent.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                                                <CheckCircle className="w-5 h-5 mr-2" /> Verify Documents
                                            </Button>
                                            <Button onClick={() => handleRejectDocs(selectedStudent.id)} variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                                                <XCircle className="w-5 h-5 mr-2" /> Reject Documents
                                            </Button>
                                        </div>
                                    )}
                                    {selectedStudent.status === 'VERIFIED' && (
                                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-800 font-medium">
                                            <CheckCircle className="w-6 h-6" /> Verified Successfully
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            Select a student to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'PENDING_DOCS': return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">Pending</span>;
        case 'DOCS_UPLOADED': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending Verification</span>;
        case 'VERIFIED': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Verified</span>;
        case 'REJECTED_DOCS': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Docs Rejected</span>;
        default: return null;
    }
};

const DocCard = ({ title, url }: { title: string, url?: string }) => {
    if (!url) return null;

    // Check if PDF or Image
    const isPdf = url.startsWith('data:application/pdf');

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <span className="font-semibold text-gray-700 text-sm">{title}</span>
                <a href={url} download={`${title}.${isPdf ? 'pdf' : 'png'}`} className="text-indigo-600 hover:text-indigo-800">
                    <Download className="w-4 h-4" />
                </a>
            </div>
            <div className="h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100 relative group">
                {isPdf ? (
                    <div className="text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                        <span className="text-xs text-gray-500 mt-2 block">PDF Document</span>
                    </div>
                ) : (
                    <img src={url} alt={title} className="w-full h-full object-cover" />
                )}

                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-medium transition-opacity"
                >
                    View Full Size
                </a>
            </div>
        </div>
    );
};
