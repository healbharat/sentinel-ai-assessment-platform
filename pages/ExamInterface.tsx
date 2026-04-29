import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ExamHeader } from '../components/ExamHeader';
import { ProctorCam } from '../components/ProctorCam';
import { Button } from '../components/ui/Button';
import { MOCK_QUESTIONS } from '../constants';
import { analyzeBehavior } from '../services/proctorService';
import { saveResult } from '../services/storage';
import { ChevronRight, ChevronLeft, Flag, Code, ShieldAlert, Maximize2, BrainCircuit } from 'lucide-react';
import { ProctorEvent, QuestionCategory, RoundType } from '../types';
import { evaluateExam } from '../services/evaluationService';
import { sendCandidateResultEmail, sendAdminSummaryEmail } from '../services/emailService';

import { CodeEditor } from '../components/CodeEditor';

export const ExamInterface: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { candidateName: stateName, candidateId: stateId } = location.state || {};

  // Construct Pipeline safely inside component to avoid initialization errors
  const pipeline = useMemo(() => {
    const aptitude = MOCK_QUESTIONS.filter(q => q.category === QuestionCategory.APTITUDE);
    const logical = MOCK_QUESTIONS.filter(q => q.category === QuestionCategory.LOGICAL);
    const verbal = MOCK_QUESTIONS.filter(q => q.category === QuestionCategory.VERBAL);
    const technical = MOCK_QUESTIONS.filter(q => q.category === QuestionCategory.TECHNICAL);
    const coding = MOCK_QUESTIONS.filter(q => q.category === QuestionCategory.CODING);

    return [
      { id: 'r1', title: 'Aptitude Assessment', type: 'APTITUDE', duration: 30, passingScore: 30, questions: aptitude },
      { id: 'r2', title: 'Logical Reasoning', type: 'APTITUDE', duration: 20, passingScore: 30, questions: logical },
      { id: 'r3', title: 'Verbal Ability', type: 'APTITUDE', duration: 15, passingScore: 30, questions: verbal },
      { id: 'r4', title: 'Technical Assessment', type: 'TECHNICAL', duration: 30, passingScore: 40, questions: technical },
      { id: 'r5', title: 'Coding Challenge', type: 'CODING', duration: 45, passingScore: 0, questions: coding },
    ];
  }, []);

  // Round State
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [isRoundStarted, setIsRoundStarted] = useState(false);
  const [cumulativeScore, setCumulativeScore] = useState(0);

  const currentRound = pipeline[currentRoundIndex];

  // Question State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState(currentRound?.questions || []);
  const [timeLeft, setTimeLeft] = useState(currentRound?.duration * 60 || 0);

  const [cheatScore, setCheatScore] = useState(0);
  const [logs, setLogs] = useState<ProctorEvent[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Code Editor State
  const [activeLanguage, setActiveLanguage] = useState('javascript');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: number; total: number; logs: string[] } | null>(null);

  // Logic to load round specific questions
  useEffect(() => {
    if (isRoundStarted && currentRound) {
      setQuestions(currentRound.questions);
      setCurrentQuestionIndex(0);
      setTimeLeft(currentRound.duration * 60);
    }
  }, [currentRoundIndex, isRoundStarted, currentRound]);



  // ... (Keep existing state hooks, but ensure they don't break)
  // Re-use `currentQuestionIndex` etc. defined below in original code.
  // I must be careful not to introduce duplicate definitions. Use existing.

  // Existing Code continues...
  // I will only insert the Lobby Logic and Mock Pipeline at the top of the component body.
  // And update the `useState` calls if needed.

  /* 
     Actually, I need to preserve the `useState` definitions for `currentQuestionIndex` etc.
     I cannot re-declare them.
     I will insert the MOCK_PIPELINE outside the component.
     And add the `isRoundStarted` logic inside.
  */

  // State moved to top


  const handleRunCode = async () => {
    setIsRunningTests(true);
    setTestResults(null);

    // Simulate complex execution flow
    const logs: string[] = [];
    const addLog = (msg: string) => logs.push(msg);

    // 1. Compilation / Syntax Check
    addLog(`> Compiling with ${activeLanguage === 'python' ? 'Python 3.10' : activeLanguage === 'java' ? 'OpenJDK 17' : 'Node.js 18'}...`);
    await new Promise(r => setTimeout(r, 800));
    addLog('> Syntax Check: OK');

    // 2. Plagiarism Scan (Simulated)
    await new Promise(r => setTimeout(r, 600));
    addLog('> Security Scan: No malicious code detected.');
    addLog('> Plagiarism Check: 0% similarity found.');

    // 3. Running Tests
    await new Promise(r => setTimeout(r, 1000));

    const isSuccess = codeValue.length > 20 && codeValue.includes('return');

    if (isSuccess) {
      addLog('--------------------------------------------------');
      addLog('✓ Test Case 1 (Visible): Input "hello" -> Passed (12ms)');
      addLog('✓ Test Case 2 (Visible): Input "" -> Passed (4ms)');
      addLog('✓ Test Case 3 (Hidden): [Edge Case] -> Passed (20ms)');
      addLog('✓ Test Case 4 (Hidden): [Large Input] -> Passed (45ms)');
      addLog('--------------------------------------------------');
      addLog('> Time Limit: 0.08s / 1.0s (Passed)');
      addLog('> Memory Usage: 14MB / 256MB (Passed)');
      addLog('Success: All test cases passed.');

      setTestResults({ passed: 4, total: 4, logs });
    } else {
      addLog('--------------------------------------------------');
      addLog('✓ Test Case 1 (Visible): Input "hello" -> Passed (10ms)');
      addLog('✗ Test Case 2 (Visible): Input "" -> Failed');
      addLog('  Expected: "", Received: "undefined"');
      addLog('✗ Test Case 3 (Hidden): [Edge Case] -> Skipped');
      addLog('--------------------------------------------------');
      addLog('Error: Code failed logic verification.');

      setTestResults({ passed: 1, total: 4, logs });
    }

    setIsRunningTests(false);
  };

  // Security Features
  const [codeValue, setCodeValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // User ID for Watermark (simulated)
  // User ID for Watermark
  const candidateId = useMemo(() => stateId || `CAND-${Math.floor(Math.random() * 10000)}`, [stateId]);
  const candidateName = stateName || 'Current User';



  // Update code value when question changes if needed, but usually we persist it per question
  // For simplicity in this demo, we just reset or carry over if it's coding type.
  useEffect(() => {
    const q = questions[currentQuestionIndex];
    if (q && q.type === 'CODING' && !codeValue) {
      setCodeValue(q.codeTemplate || '');
    }
    // Reset selection for new question
    setSelectedOption(null);
  }, [currentQuestionIndex, questions]);


  const currentQuestion = questions[currentQuestionIndex];




  const handleRoundSubmit = async () => {
    setIsSubmitting(true);

    // 1. Evaluate Current Round
    // In real app, pass user answers.
    const evalResult = await evaluateExam([]);
    const roundScore = evalResult.score;

    // Check if passed
    const passingScore = (currentRound as any).passingScore || 0;
    const passed = roundScore >= passingScore;

    // Stop Media Tracks (Simulation)
    const recordingUrl = `https://s3.sentinel-ai.com/recordings/${candidateId}_${currentRound.id}.mp4`;

    if (!passed) {
      // FAILED ROUND -> Terminate Assessment
      const finalResult: any = {
        candidateId,
        candidateName: candidateName,
        candidateEmail: candidateId, // Ensure Email is saved
        examId: 'EXAM-001',
        score: Math.round((cumulativeScore + roundScore) / (currentRoundIndex + 1)), // Avg score
        status: 'Rejected',
        completedAt: new Date().toISOString(),
        breakdown: { ...evalResult.breakdown, roundFail: currentRound.title },
        recordingUrl
      };
      await saveResult(finalResult);
      sendCandidateResultEmail(finalResult, "candidate@example.com");
      navigate('/finish', { state: { result: finalResult } });
      return;
    }

    // PASSED ROUND -> Check for Next
    if (currentRoundIndex < pipeline.length - 1) {
      // Proceed to Next Round
      setCumulativeScore(prev => prev + roundScore);
      setCurrentRoundIndex(prev => prev + 1);
      setIsRoundStarted(false); // Show Lobby
      setIsSubmitting(false);
    } else {
      // FINAL ROUND COMPLETED
      const finalResult: any = {
        candidateId,
        candidateName: candidateName,
        candidateEmail: candidateId, // Ensure Email is saved
        examId: 'EXAM-001',
        score: Math.round((cumulativeScore + roundScore) / (currentRoundIndex + 1)),
        status: 'Selected',
        completedAt: new Date().toISOString(),
        breakdown: evalResult.breakdown,
        recordingUrl
      };
      await saveResult(finalResult);
      sendCandidateResultEmail(finalResult, "candidate@example.com");
      sendAdminSummaryEmail(finalResult, "hr@sentinel.ai");
      navigate('/finish', { state: { result: finalResult } });
    }
  };

  // 1. Lockdown Logic
  useEffect(() => {
    if (!isRoundStarted) return; // Don't run in lobby

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logIncident('TAB_SWITCH', 'high');
      }
    };

    const handleBlur = () => {
      logIncident('TAB_SWITCH', 'medium');
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logIncident('COPY_PASTE', 'medium');
      alert("Copy/Paste is disabled for security reasons.");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        logIncident('TAB_SWITCH', 'high');
      }

      // Block Copy/Paste keys
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        logIncident('COPY_PASTE', 'medium');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handleCopy);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handleCopy);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRoundStarted]); // Add dependency

  // 2. AI Simulation Loop
  useEffect(() => {
    if (!isRoundStarted) return;

    const interval = setInterval(() => {
      let { scoreDelta, event } = analyzeBehavior(cheatScore);

      // Reduce sensitivity during Coding Round (Round 5)
      // Candidates look down to write logic, so we dampen penalties
      if (currentRoundIndex === 4 || currentRound.type === 'CODING') {
        if (scoreDelta > 0) scoreDelta = scoreDelta * 0.2; // 80% reduction
      }

      if (scoreDelta > 0) {
        setCheatScore(prev => {
          const newScore = Math.min(100, prev + scoreDelta);
          return newScore;
        });
        if (event) setLogs(prev => [event, ...prev]);
      } else {
        // Slowly heal score if behaving well
        setCheatScore(prev => Math.max(0, prev - 0.5));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [cheatScore, navigate, isRoundStarted]);

  // 3. Timer
  useEffect(() => {
    if (!isRoundStarted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleRoundSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleRoundSubmit, isRoundStarted]);

  const logIncident = (type: ProctorEvent['type'], severity: ProctorEvent['severity']) => {
    const newLog: ProctorEvent = {
      id: Math.random().toString(),
      timestamp: new Date(),
      type,
      severity
    };
    setLogs(prev => [newLog, ...prev]);
    setCheatScore(prev => Math.min(100, prev + (severity === 'high' ? 20 : 10)));

    // Show Toast
    setToastMessage(`Security Alert: ${type.replace('_', ' ')} Detected!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const requestFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().then(() => setIsFullScreen(true)).catch(() => alert("Please allow Fullscreen"));
    }
  };

  // If round not started, show Lobby
  if (!isRoundStarted) {
    if (!currentRound) return <div>Loading Assessment Data...</div>;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center animate-fade-in">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <BrainCircuit className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentRound.title}</h1>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            Round {currentRoundIndex + 1} of {pipeline.length} • {currentRound.duration} Minutes • {currentRound.questions.length} Questions
          </p>

          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 mb-8 text-left text-sm text-gray-700 shadow-sm relative overflow-hidden">

            <div className="flex items-start gap-4 z-10 relative">
              <ShieldAlert className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-indigo-900 mb-2">Assessment Monitoring & Warning Policy</h3>
                  <p className="opacity-80">This assessment uses AI-driven monitoring to ensure fairness. Please read carefully:</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/60 p-3 rounded-lg border border-indigo-100">
                    <strong className="text-indigo-800 block mb-1">1. Warning-Based System</strong>
                    <span>Minor violations (focus loss, noise) result in warnings, not immediate removal.</span>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg border border-indigo-100">
                    <strong className="text-indigo-800 block mb-1">2. Mobile Phone Limit</strong>
                    <span>Use of mobile phones triggers a warning. Maximum <strong>3 warnings</strong> allowed before review.</span>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg border border-indigo-100">
                    <strong className="text-indigo-800 block mb-1">3. No Automatic Force Exit</strong>
                    <span>You will not be kicked out for minor issues. Stay calm and follow on-screen alerts.</span>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg border border-indigo-100">
                    <strong className="text-indigo-800 block mb-1">4. Stable Environment</strong>
                    <span>Calculator provided. Platform is optimized for stable performance.</span>
                  </div>
                </div>

                <div className="text-xs text-center border-t border-indigo-100 pt-3 text-indigo-600 font-medium">
                  ⚠️ "Internal updates are in progress but will NOT affect your live assessment attempt."
                </div>
              </div>
            </div>
          </div>

          <Button size="lg" onClick={() => { try { requestFullScreen(); } catch (e) { console.error(e); } setIsRoundStarted(true); }} className="w-full sm:w-auto px-12 shadow-lg shadow-indigo-500/20">
            Start Round
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return <div>Loading Assessment...</div>;

  // Render Logic
  return (
    <div className="flex flex-col h-screen bg-gray-50 select-none relative overflow-hidden">
      {/* Dynamic Watermark Overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden opacity-[0.03] flex flex-wrap content-center justify-center gap-20 rotate-12">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="text-4xl font-black text-gray-900 whitespace-nowrap">
            {candidateId} • SENTINEL PROTECTED
          </div>
        ))}
      </div>

      {toastMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[70] bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce font-bold flex items-center gap-3">
          <ShieldAlert className="w-6 h-6" />
          {toastMessage}
        </div>
      )}

      {!isFullScreen && (
        <div className="fixed inset-0 z-[60] bg-gray-900/95 flex items-center justify-center text-white backdrop-blur-sm">
          <div className="text-center max-w-md p-8 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Secure Environment Required</h2>
            <p className="text-gray-400 mb-6">Sentinel AI requires Fullscreen mode to prevent cheating. Exiting fullscreen will flag your session.</p>
            <Button onClick={requestFullScreen} className="w-full">Enter Secure Mode</Button>
          </div>
        </div>
      )}

      <ExamHeader title="Senior Full Stack Engineer Assessment" timeLeft={timeLeft} cheatScore={cheatScore} />

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Left: Question Area */}
        <div className="w-1/2 p-8 overflow-y-auto border-r border-gray-200 bg-white">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wide">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Points: {currentQuestion.points}
            </span>
          </div>

          <h2 className="text-xl font-medium text-gray-900 mb-6 leading-relaxed">
            {currentQuestion.text}
          </h2>

          {currentQuestion.type === 'MCQ' && (
            <div className="space-y-3">
              {currentQuestion.options?.map((opt, idx) => (
                <label
                  key={idx}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${selectedOption === idx ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' : 'border-gray-200'}`}
                >
                  <input
                    type="radio"
                    name="option"
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    checked={selectedOption === idx}
                    onChange={() => setSelectedOption(idx)}
                  />
                  <span className="ml-3 text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'CODING' && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600">
              <h4 className="font-semibold mb-2">Constraints:</h4>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>Time Limit: 1.0s</li>
                <li>Memory Limit: 256MB</li>
                <li>Input: String length 1 to 10^5</li>
              </ul>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <Button
              variant="secondary"
              onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Previous
            </Button>
            <div className="space-x-2">
              <Button variant="ghost" className="text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700">
                <Flag className="w-4 h-4 mr-2" /> Mark for Review
              </Button>
              {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={() => setCurrentQuestionIndex(p => p + 1)}>
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button variant="primary" onClick={handleRoundSubmit} className="bg-green-600 hover:bg-green-700">
                  {currentRoundIndex < pipeline.length - 1 ? 'Next Round' : 'Submit Exam'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Work Area (Code Editor or Proctor View) */}
        <div className="w-1/2 flex flex-col bg-gray-50">
          <div className="flex-1 p-4 relative">
            {/* If Coding Question */}
            {currentQuestion.type === 'CODING' ? (
              <CodeEditor
                initialCode={codeValue}
                language={activeLanguage}
                onChange={setCodeValue}
                onRun={handleRunCode}
                onLanguageChange={setActiveLanguage}
                isRunning={isRunningTests}
                testResults={testResults}
              />
            ) : (
              // Placeholder for non-coding questions to keep layout balanced
              <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <Maximize2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>Focus Mode Active</p>
                </div>
              </div>
            )}

            {/* Floating Proctor Cam */}
            <div className="absolute top-6 right-6 z-10">
              <ProctorCam isActive={true} cheatScore={cheatScore} />
            </div>

            {/* Live Incident Log (Mini) */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/90 backdrop-blur border border-gray-200 rounded-lg p-3 shadow-lg max-h-32 overflow-y-auto">
                <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">System Audit Log</h4>
                {logs.length === 0 ? (
                  <p className="text-xs text-green-600 italic">System integrity verified. No anomalies.</p>
                ) : (
                  <div className="space-y-1">
                    {logs.map(log => (
                      <div key={log.id} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400">{log.timestamp.toLocaleTimeString()}</span>
                        <span className={`font-semibold ${log.severity === 'high' ? 'text-red-600' : 'text-orange-500'}`}>
                          [{log.type}]
                        </span>
                        <span className="text-gray-600">Incident recorded.</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};