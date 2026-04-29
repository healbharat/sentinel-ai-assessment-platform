import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Button } from '../components/ui/Button';
import { UploadCloud, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { SelectedStudent } from '../types';

export const DocumentVerificationPage: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const [student, setStudent] = useState<SelectedStudent | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [files, setFiles] = useState<{
        aadhar: File | null;
        marksheet: File | null;
        passportPhoto: File | null;
    }>({ aadhar: null, marksheet: null, passportPhoto: null });

    useEffect(() => {
        const fetchStudent = async () => {
            if (!studentId) return;
            const data = await db.getSelectedStudent(studentId);
            if (data) {
                setStudent(data);
            } else {
                setError('Student record not found or link expired.');
            }
            setLoading(false);
        };
        fetchStudent();
    }, [studentId]);

    const handleFileChange = (type: 'aadhar' | 'marksheet' | 'passportPhoto', e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validation
            if (file.size > 50 * 1024) { // 50KB
                alert(`File ${file.name} is too large. Max size is 50KB.`);
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type)) {
                alert(`Invalid file type for ${file.name}. Only JPG, PNG, PDF allowed.`);
                return;
            }

            setFiles(prev => ({ ...prev, [type]: file }));
        }
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;
        if (!files.aadhar || !files.marksheet || !files.passportPhoto) {
            alert("Please upload Aadhar Card, Marksheet and Passport Photo.");
            return;
        }

        setSubmitting(true);
        try {
            // Convert to Base64 (since files are small < 50KB)
            const aadharUrl = await convertToBase64(files.aadhar);
            const marksheetUrl = await convertToBase64(files.marksheet);
            const passportPhotoUrl = await convertToBase64(files.passportPhoto);

            // Construct documents object preventing undefined values which Firestore hates
            const documents: any = { marksheetUrl, aadharUrl, passportPhotoUrl };

            await db.updateSelectedStudent(student.id, {
                status: 'DOCS_UPLOADED',
                documents: documents
            });

            setStudent(prev => prev ? { ...prev, status: 'DOCS_UPLOADED' } : null);
            alert("Documents submitted successfully!");
        } catch (err) {
            console.error(err);
            alert("Error submitting documents.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error || !student) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Student not found"}</div>;

    if (student.status === 'DOCS_UPLOADED' || student.status === 'VERIFIED') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl text-center max-w-lg w-full">
                    <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-white mb-2">Documents Submitted</h1>
                    <p className="text-slate-400 text-lg">
                        Your documents have been received and are pending verification by the admin.
                    </p>
                    {student.status === 'VERIFIED' && (
                        <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-medium">
                            Congratulations! Your documents have been verified.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            <div className="w-full max-w-2xl bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50 transition-all duration-300">
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">Document Verification</h1>
                        <p className="text-indigo-100 mt-2 text-lg font-medium opacity-90">Securely securely submit your required documents.</p>
                    </div>
                </div>

                <div className="p-8 sm:p-10">
                    <div className="mb-8 pb-8 border-b border-slate-700/50">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-400" /> Candidate Details
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-300">
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                <p className="text-sm text-slate-400 mb-1">Full Name</p>
                                <p className="font-semibold text-white truncate">{student.name}</p>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                <p className="text-sm text-slate-400 mb-1">Email Address</p>
                                <p className="font-semibold text-white truncate">{student.email}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-xl flex gap-4 text-amber-200/90 shadow-inner">
                            <AlertCircle className="w-6 h-6 flex-shrink-0 text-amber-500" />
                            <div>
                                <p className="font-bold text-amber-400 mb-2">Upload Requirements</p>
                                <ul className="list-disc ml-5 space-y-1 text-sm font-medium">
                                    <li>Max file size: <span className="text-amber-100">50KB per file</span></li>
                                    <li>Supported formats: <span className="text-amber-100">JPG, PNG, PDF</span></li>
                                    <li>Required: <span className="text-amber-100">Aadhar, Marksheet & Passport Photo</span></li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Aadhar */}
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-300 mb-3 ml-1 uppercase tracking-wider">Aadhar Card</label>
                                <div className={`relative border-2 border-dashed ${files.aadhar ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-600 hover:border-indigo-400 hover:bg-slate-800/50'} rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer`}>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => handleFileChange('aadhar', e)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {files.aadhar ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-6 h-6 text-emerald-400" />
                                            </div>
                                            <span className="text-emerald-400 font-medium">{files.aadhar.name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <UploadCloud className="w-7 h-7 text-indigo-400" />
                                            </div>
                                            <span className="text-slate-400 font-medium">Click to browse or drag & drop</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Marksheet */}
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-300 mb-3 ml-1 uppercase tracking-wider">Current Year Marksheet</label>
                                <div className={`relative border-2 border-dashed ${files.marksheet ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-600 hover:border-indigo-400 hover:bg-slate-800/50'} rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer`}>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => handleFileChange('marksheet', e)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {files.marksheet ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-6 h-6 text-emerald-400" />
                                            </div>
                                            <span className="text-emerald-400 font-medium">{files.marksheet.name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <UploadCloud className="w-7 h-7 text-indigo-400" />
                                            </div>
                                            <span className="text-slate-400 font-medium">Click to browse or drag & drop</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Passport Photo */}
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-300 mb-3 ml-1 uppercase tracking-wider">Passport Size Photograph</label>
                                <div className={`relative border-2 border-dashed ${files.passportPhoto ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-600 hover:border-indigo-400 hover:bg-slate-800/50'} rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer`}>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => handleFileChange('passportPhoto', e)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {files.passportPhoto ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-6 h-6 text-emerald-400" />
                                            </div>
                                            <span className="text-emerald-400 font-medium">{files.passportPhoto.name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <UploadCloud className="w-7 h-7 text-indigo-400" />
                                            </div>
                                            <span className="text-slate-400 font-medium">Click to browse or drag & drop</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting || !files.aadhar || !files.marksheet || !files.passportPhoto}
                                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform active:scale-[0.98] ${submitting || !files.aadhar || !files.marksheet || !files.passportPhoto
                                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)]'
                                    }`}
                            >
                                {submitting ? 'Uploading Documents securely...' : 'Submit Documents'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
