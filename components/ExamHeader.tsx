import React from 'react';
import { Timer, AlertOctagon } from 'lucide-react';

interface ExamHeaderProps {
  title: string;
  timeLeft: number; // in seconds
  cheatScore: number;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({ title, timeLeft, cheatScore }) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-50 sticky top-0">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">
          S
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-800">{title}</h1>
          <p className="text-xs text-gray-500">Candidate ID: #883492</p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-1.5 rounded-full">
          <Timer className="w-4 h-4 text-gray-600" />
          <span className={`font-mono font-medium ${timeLeft < 300 ? 'text-red-600' : 'text-gray-700'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="flex items-center gap-2" title="Real-time Integrity Score">
          <AlertOctagon className={`w-4 h-4 ${cheatScore > 50 ? 'text-red-500' : 'text-green-500'}`} />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">Integrity</span>
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
               <div 
                 className={`h-full transition-all duration-500 ${cheatScore > 50 ? 'bg-red-500' : 'bg-green-500'}`} 
                 style={{ width: `${100 - cheatScore}%` }}
               ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};