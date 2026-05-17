"use client";

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

interface PasswordGeneratorProps {
    onPasswordGenerated: (password: string) => void;
}

export function PasswordGenerator({ onPasswordGenerated }: PasswordGeneratorProps) {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [includeLowerCase, setIncludeLowerCase] = useState(true);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);

    const generatePassword = useCallback(() => {
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
        
        let allChars = '';
        if (includeLowerCase) allChars += lower;
        if (includeUppercase) allChars += upper;
        if (includeNumbers) allChars += numbers;
        if (includeSymbols) allChars += symbols;

        let generatedPassword = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * allChars.length);
            generatedPassword += allChars[randomIndex];
        }
        setPassword(generatedPassword);
    }, [length,includeLowerCase, includeUppercase, includeNumbers, includeSymbols]);

    useEffect(() => {
        generatePassword();
    }, [generatePassword]);

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        toast.success('Password copied to clipboard!');
    };

    return (
        <div className="rounded-xl border border-slate-800/70 bg-slate-900/70 p-4 space-y-4">
            <div className="flex items-center rounded-lg border border-slate-800/70 bg-slate-950/60 p-2">
                <input
                    type="text"
                    value={password}
                    readOnly
                    className="min-w-0 flex-grow bg-transparent font-mono text-slate-100 focus:outline-none"
                />
                <button onClick={handleCopy} className="ml-2 p-1 text-slate-400 hover:text-slate-100">Copy</button>
            </div>
            
            <div className="space-y-2">
                <div className="flex flex-col gap-2 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                    <label>Length: {length}</label>
                    <input
                        type="range"
                        min="8"
                        max="64"
                        value={length}
                        onChange={(e) => setLength(Number(e.target.value))}
                        className="w-full sm:w-48"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                    <label><input type="checkbox" checked={includeLowerCase} onChange={() => setIncludeLowerCase(!includeLowerCase)} /> Lowercase</label>
                    <label><input type="checkbox" checked={includeUppercase} onChange={() => setIncludeUppercase(!includeUppercase)} /> Uppercase</label>
                    <label><input type="checkbox" checked={includeNumbers} onChange={() => setIncludeNumbers(!includeNumbers)} /> Numbers</label>
                    <label><input type="checkbox" checked={includeSymbols} onChange={() => setIncludeSymbols(!includeSymbols)} /> Symbols</label>
                </div>
            </div>

            <div className="flex space-x-2">
                 <button onClick={generatePassword} type="button" className="w-full rounded-full border border-slate-700/70 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500">Generate New</button>
                <button onClick={() => onPasswordGenerated(password)} className="w-full rounded-full bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300">Use Password</button>
            </div>
        </div>
    );
}