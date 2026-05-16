"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok) {
            toast.success('Login successful!');
            login(data.token);
            router.push('/dashboard');
        } else {
            toast.error(data.message || 'An error occurred.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
            <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-2xl">
                <h1 className="text-2xl font-semibold text-center text-slate-50">Login to SecureVault</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-400">Email Address</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50" />
                    </div>
                    <div>
                        <label htmlFor="password"  className="block text-sm font-medium text-slate-400">Password</label>
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
                    <button type="submit" className="w-full rounded-full bg-emerald-400/90 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300">Login</button>
                </form>
                <p className="text-sm text-center text-slate-400">
                    Don&#39;t have an account?{' '}
                    <Link href="/register" className="font-medium text-emerald-300 hover:text-emerald-200">Register</Link>
                </p>
            </div>
        </div>
    );
}