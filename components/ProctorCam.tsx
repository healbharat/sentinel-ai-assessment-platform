import React, { useEffect, useRef, useState } from 'react';
import { Camera, AlertTriangle, Eye, UserX } from 'lucide-react';

interface ProctorCamProps {
  isActive: boolean;
  cheatScore: number;
}

export const ProctorCam: React.FC<ProctorCamProps> = ({ isActive, cheatScore }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamError, setStreamError] = useState(false);
  const [status, setStatus] = useState<string>("Analyzing environment...");

  useEffect(() => {
    if (isActive) {
      const startVideo = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera access denied", err);
          setStreamError(true);
        }
      };
      startVideo();
    }
    return () => {
      // Cleanup tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isActive]);

  // Simulate AI Status Updates
  useEffect(() => {
    const statuses = [
      "Tracking eye movement...",
      "Verifying background...",
      "Audio analysis active...",
      "Face detection stable..."
    ];
    const interval = setInterval(() => {
      setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getBorderColor = () => {
    if (cheatScore > 70) return 'border-red-600';
    if (cheatScore > 30) return 'border-yellow-500';
    return 'border-green-500';
  };

  return (
    <div className={`relative w-48 h-36 bg-black rounded-lg overflow-hidden border-4 shadow-lg ${getBorderColor()}`}>
      {streamError ? (
        <div className="flex flex-col items-center justify-center h-full text-white bg-gray-900">
          <Camera className="w-8 h-8 mb-2 text-red-500" />
          <span className="text-xs text-center px-2">Camera Blocked</span>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover transform scale-x-[-1]" 
          />
          {/* AI Overlay HUD */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
             <div className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded text-[10px] text-green-400">
                <Eye size={10} />
                <span>Tracking</span>
             </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
             <div className="flex justify-between items-center">
               <span className="text-[9px] text-gray-300 truncate">{status}</span>
               {cheatScore > 50 && <AlertTriangle size={12} className="text-red-500 animate-pulse" />}
             </div>
          </div>
          
          {/* Facial Mesh Simulation (CSS) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-20 border border-blue-500/30 rounded-full pointer-events-none opacity-50"></div>
          <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-blue-500/20 pointer-events-none"></div>
        </>
      )}
    </div>
  );
};