"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
     const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
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
        } catch {
            toast.error('An error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
            <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-2xl">
                <h1 className="text-2xl font-semibold text-center text-slate-50">Create Your Account</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-400">Email Address</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50" />
                    </div>
                    <div>
                        <label htmlFor="password"  className="block text-sm font-medium text-slate-400">Master Password</label>
                         <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-slate-400 hover:text-slate-100">
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    <ul className="text-sm text-slate-400 space-y-1">
                        <li className={passwordValidity.minLength ? 'text-emerald-300' : ''}>At least 8 characters</li>
                        <li className={passwordValidity.hasLowercase ? 'text-emerald-300' : ''}>Contains a lowercase letter</li>
                        <li className={passwordValidity.hasUppercase ? 'text-emerald-300' : ''}>Contains an uppercase letter</li>
                        <li className={passwordValidity.hasNumber ? 'text-emerald-300' : ''}>Contains a number</li>
                        <li className={passwordValidity.hasSymbol ? 'text-emerald-300' : ''}>Contains a special character (@$!%*?&)</li>
                    </ul>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-full bg-emerald-400/90 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? 'Creating account...' : 'Register'}
                    </button>
                </form>
                 <p className="text-sm text-center text-slate-400">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-emerald-300 hover:text-emerald-200">Login</Link>
                </p>
            </div>
        </div>
    );
}