import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Check, X, Terminal, Copy } from 'lucide-react';
import { Button } from './ui/Button';

interface CodeEditorProps {
    initialCode: string;
    language: string;
    onChange: (code: string) => void;
    onRun: () => void;
    onLanguageChange?: (lang: string) => void;
    isRunning: boolean;
    testResults?: { passed: number; total: number; logs: string[] } | null;
}

const HIGHLIGHT_KEYWORDS = [
    'function', 'return', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'console', 'log', '=>', 'import', 'export', 'default'
];

export const CodeEditor: React.FC<CodeEditorProps> = ({ initialCode, language, onChange, onRun, onLanguageChange, isRunning, testResults }) => {
    const [code, setCode] = useState(initialCode);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const overlayRef = useRef<HTMLPreElement>(null);

    useEffect(() => {
        setCode(initialCode);
    }, [initialCode]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setCode(val);
        onChange(val);
    };

    const handleScroll = () => {
        if (textareaRef.current && overlayRef.current) {
            overlayRef.current.scrollTop = textareaRef.current.scrollTop;
            overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    // Basic Syntax Highlighting Logic
    const getHighlightedCode = (input: string) => {
        let escaped = input
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Highlight Keywords
        HIGHLIGHT_KEYWORDS.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            escaped = escaped.replace(regex, `<span class="text-pink-400 font-bold">${keyword}</span>`);
        });

        // Highlight Strings
        escaped = escaped.replace(/('.*?')/g, '<span class="text-yellow-300">$1</span>');
        escaped = escaped.replace(/(".*?")/g, '<span class="text-yellow-300">$1</span>');

        // Highlight Functions
        escaped = escaped.replace(/(\w+)(?=\()/g, '<span class="text-blue-300">$1</span>');

        // Highlight Numbers
        escaped = escaped.replace(/\b(\d+)\b/g, '<span class="text-green-300">$1</span>');

        // Highlight Comments
        escaped = escaped.replace(/(\/\/.*)/g, '<span class="text-gray-500 italic">$1</span>');

        return escaped;
    };

    const lineNumbers = code.split('\n').map((_, i) => i + 1);

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] rounded-lg border border-gray-700 shadow-xl overflow-hidden">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700 select-none">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 mr-3">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>

                    {/* Language Selector */}
                    <div className="relative group">
                        <select
                            value={language}
                            onChange={(e) => onLanguageChange?.(e.target.value)}
                            className="bg-transparent text-gray-300 text-xs font-mono font-medium outline-none cursor-pointer appearance-none pr-6 hover:text-white transition-colors"
                        >
                            <option value="javascript">JavaScript (Node.js)</option>
                            <option value="python">Python 3.10</option>
                            <option value="java">Java (OpenJDK 17)</option>
                            <option value="cpp">C++ (GCC)</option>
                            <option value="csharp">C# (Pro)</option>
                        </select>
                        <Terminal className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-gray-300" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-gray-300 hover:text-white hover:bg-white/10"
                        onClick={() => setCode(initialCode)}
                    >
                        <RotateCcw className="w-3 h-3 mr-1" /> Reset
                    </Button>
                    <Button
                        size="sm"
                        className={`h-7 text-xs ${isRunning ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'} text-white border-none`}
                        onClick={onRun}
                        disabled={isRunning}
                    >
                        {isRunning ? 'Running...' : <><Play className="w-3 h-3 mr-1 fill-white" /> Run Code</>}
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 relative min-h-0 flex text-sm font-mono leading-6">
                {/* Line Numbers */}
                <div className="bg-[#1e1e1e] text-gray-600 px-3 py-4 text-right select-none border-r border-[#333]">
                    {lineNumbers.map(n => (
                        <div key={n} className="leading-6">{n}</div>
                    ))}
                </div>

                {/* Code Container */}
                <div className="relative flex-1 bg-[#1e1e1e]">
                    {/* Syntax Highlight Overlay */}
                    <pre
                        ref={overlayRef}
                        className="absolute inset-0 m-0 p-4 pointer-events-none whitespace-pre overflow-hidden text-gray-300 font-mono leading-6"
                        dangerouslySetInnerHTML={{ __html: getHighlightedCode(code) }}
                    />

                    {/* Transparent Textarea for Input */}
                    <textarea
                        ref={textareaRef}
                        value={code}
                        onChange={handleChange}
                        onScroll={handleScroll}
                        spellCheck={false}
                        className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white outline-none resize-none overflow-auto font-mono leading-6 z-10 selection:bg-blue-500/30"
                    />
                </div>
            </div>

            {/* Terminal / Output Area */}
            <div className="border-t border-gray-700 bg-[#1e1e1e] transition-all duration-300 flex flex-col max-h-[40%]">
                <div className="px-4 py-1 bg-[#252526] border-b border-[#333] flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Console</span>
                    {testResults && (
                        <span className={`text-xs px-2 py-0.5 rounded ${testResults.passed === testResults.total ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                            {testResults.passed}/{testResults.total} Tests Passed
                        </span>
                    )}
                </div>
                <div className="p-4 overflow-y-auto font-mono text-xs space-y-1 h-32">
                    {!testResults && !isRunning && (
                        <div className="text-gray-500 italic">Reference output will appear here after running your code...</div>
                    )}
                    {isRunning && (
                        <div className="flex items-center gap-2 text-yellow-500">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                            Compiling and executing...
                        </div>
                    )}
                    {testResults?.logs.map((log, i) => (
                        <div key={i} className="text-gray-300 font-medium border-b border-gray-800 pb-1 mb-1 last:border-0">
                            {log.startsWith('✓') ? (
                                <span className="text-green-400">{log}</span>
                            ) : log.startsWith('✗') ? (
                                <span className="text-red-400">{log}</span>
                            ) : (
                                <span>{log}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
