"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
     const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const [passwordValidity, setPasswordValidity] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSymbol: false,
    });

    useEffect(() => {
        setPasswordValidity({
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSymbol: /[@$!%*?&]/.test(password),
        });
    }, [password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok) {
            toast.success('Registration successful! Redirecting to login...');
            setTimeout(() => router.push('/login'), 2000);
        } else {
            toast.error(data.message || 'An error occurred.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Create Your Account</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email Address</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="password"  className="block text-sm font-medium text-gray-400">Master Password</label>
                         <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-gray-400 hover:text-white">
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    <ul className="text-sm text-gray-400 space-y-1">
                        <li className={passwordValidity.minLength ? 'text-green-400' : ''}>At least 8 characters</li>
                        <li className={passwordValidity.hasLowercase ? 'text-green-400' : ''}>Contains a lowercase letter</li>
                        <li className={passwordValidity.hasUppercase ? 'text-green-400' : ''}>Contains an uppercase letter</li>
                        <li className={passwordValidity.hasNumber ? 'text-green-400' : ''}>Contains a number</li>
                        <li className={passwordValidity.hasSymbol ? 'text-green-400' : ''}>Contains a special character (@$!%*?&)</li>
                    </ul>

                    <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500">Register</button>
                </form>
                 <p className="text-sm text-center text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-blue-400 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}