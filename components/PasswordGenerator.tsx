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
        
        let allChars = lower;
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
        <div className="bg-gray-700 p-4 rounded-md space-y-4">
            <div className="flex items-center bg-gray-800 p-2 rounded">
                <input
                    type="text"
                    value={password}
                    readOnly
                    className="flex-grow bg-transparent text-white font-mono focus:outline-none"
                />
                <button onClick={handleCopy} className="ml-2 p-1 text-gray-400 hover:text-white">Copy</button>
            </div>
            
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label>Length: {length}</label>
                    <input
                        type="range"
                        min="8"
                        max="64"
                        value={length}
                        onChange={(e) => setLength(Number(e.target.value))}
                        className="w-48"
                    />
                </div>
                <div className="flex items-center space-x-4">
                    <label><input type="checkbox" checked={includeLowerCase} onChange={() => setIncludeLowerCase(!includeLowerCase)} /> Lowercase</label>
                    <label><input type="checkbox" checked={includeUppercase} onChange={() => setIncludeUppercase(!includeUppercase)} /> Uppercase</label>
                    <label><input type="checkbox" checked={includeNumbers} onChange={() => setIncludeNumbers(!includeNumbers)} /> Numbers</label>
                    <label><input type="checkbox" checked={includeSymbols} onChange={() => setIncludeSymbols(!includeSymbols)} /> Symbols</label>
                </div>
            </div>

            <div className="flex space-x-2">
                 <button onClick={generatePassword} type="button" className="w-full px-4 py-2 font-bold text-white bg-gray-600 rounded-md hover:bg-gray-500">Generate New</button>
                <button onClick={() => onPasswordGenerated(password)} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">Use Password</button>
            </div>
        </div>
    );
}