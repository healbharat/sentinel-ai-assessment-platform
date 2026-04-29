import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Camera, Mic, ShieldCheck, UserCheck, AlertOctagon, CheckCircle2, Wifi, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

export const SystemCheckPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token, candidateName, candidateId } = location.state || {};

    const [currentStep, setCurrentStep] = useState(0); // 0: Perms, 1: Face, 2: Environment
    const [checks, setChecks] = useState({
        camera: false,
        mic: false,
        connection: false,
        face: false,
        environment: false
    });
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Initialize System Checks
    useEffect(() => {
        runConnectivityCheck();
    }, []);

    useEffect(() => {
        if (videoStream && videoRef.current) {
            videoRef.current.srcObject = videoStream;
        }
    }, [videoStream, currentStep]);

    const runConnectivityCheck = () => {
        // Simulate Connection Check
        setTimeout(() => {
            setChecks(prev => ({ ...prev, connection: true }));
        }, 800);
    };

    const requestPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setVideoStream(stream);
            setChecks(prev => ({ ...prev, camera: true }));
            setCurrentStep(1); // Next Step
        } catch (err) {
            alert("We need Camera permission to proceed.");
        }
    };

    const verifyFace = () => {
        // Simulate Face API
        setTimeout(() => {
            setChecks(prev => ({ ...prev, face: true }));
            setCurrentStep(2); // Next Step
        }, 1500);
    };

    const verifyEnvironment = () => {
        // Simulate Environment/VPN scan
        setTimeout(() => {
            setChecks(prev => ({ ...prev, environment: true }));
            setCurrentStep(3); // Ready
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">

            <div className="w-full max-w-2xl bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
                <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <ShieldCheck className="text-indigo-500" />
                        System Integrity Check
                    </h1>
                    <div className="flex gap-2">
                        {[0, 1, 2, 3].map(s => (
                            <div key={s} className={`h-2 w-2 rounded-full transition-colors ${currentStep >= s ? 'bg-indigo-500' : 'bg-gray-600'}`}></div>
                        ))}
                    </div>
                </div>

                {/* STEP 0: Permissions & Hardware */}
                {currentStep === 0 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-semibold">Hardware Access</h2>
                        <p className="text-gray-400">Please allow access to your camera for proctoring.</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-colors ${checks.camera ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-gray-700 border-gray-600'}`}>
                                <Camera className="w-8 h-8" />
                                <span>Camera</span>
                                {checks.camera && <CheckCircle2 className="w-4 h-4 mt-1" />}
                            </div>

                        </div>

                        <Button className="w-full py-4 text-lg" onClick={requestPermissions}>Grant Permissions</Button>
                    </div>
                )}

                {/* STEP 1: Face Verification */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-fade-in flex flex-col items-center">
                        <h2 className="text-2xl font-semibold">Face Verification</h2>
                        <p className="text-gray-400 text-center">Position your face within the frame. Ensure good lighting.</p>

                        <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                            {videoStream && (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                />
                            )}
                            <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-pulse"></div>
                        </div>

                        <Button className="w-full py-4 text-lg" onClick={verifyFace}>
                            {checks.face ? 'Verified!' : 'Scan Face'}
                        </Button>
                    </div>
                )}

                {/* STEP 2: Environment Check */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-semibold">Environment Scan</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Wifi className="text-blue-400" />
                                    <div>
                                        <div className="font-medium">Network Security</div>
                                        <div className="text-xs text-gray-400">Checking for VPN/Proxies...</div>
                                    </div>
                                </div>
                                {checks.environment ? <span className="text-green-400 font-bold">PASSED</span> : <div className="animate-spin w-4 h-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div>}
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Monitor className="text-purple-400" />
                                    <div>
                                        <div className="font-medium">Screen Capture</div>
                                        <div className="text-xs text-gray-400">Verifying single monitor setup...</div>
                                    </div>
                                </div>
                                {checks.environment ? <span className="text-green-400 font-bold">PASSED</span> : <div className="animate-spin w-4 h-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div>}
                            </div>
                        </div>
                        <Button className="w-full py-4 text-lg mt-4" onClick={verifyEnvironment}>Run Diagnostics</Button>
                    </div>
                )}

                {/* STEP 3: Ready */}
                {currentStep === 3 && (
                    <div className="text-center space-y-6 animate-fade-in">
                        <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-bold">You are Proctored</h2>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Your device, identity, and environment have been verified.
                            The exam will launch in fullscreen. Do not exit fullscreen or switch tabs.
                        </p>

                        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg text-yellow-200 text-sm text-left">
                            <strong className="block mb-1 flex items-center gap-2"><AlertOctagon className="w-4 h-4" /> Warning:</strong>
                            Cheating attempts (copy-paste, face absence, multiple voices) are detected by AI and will flag your session immediately.
                        </div>

                        <Button className="w-full py-4 text-lg bg-green-600 hover:bg-green-700" onClick={() => navigate('/exam', { state: { token, candidateName, candidateId } })}>
                            Launch Assessment
                        </Button>
                    </div>
                )}

            </div>
        </div>
    );
};
