"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function Header() {
    const { user, logout , isLoading  } = useAuth(); 
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/75 text-slate-100 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link href="/" className="text-lg font-semibold tracking-tight">
                    SecureVault
                </Link>
                <nav className="flex items-center text-sm">
                    {isLoading ? null : user ? ( 
                        <>
                            <span className="mr-4 text-slate-300">Welcome, {user.email}</span>
                            <Link href="/dashboard" className="mr-4 text-slate-200 hover:text-white">
                                Dashboard
                            </Link>

                            <Link href="/settings" className="mr-4 text-slate-200 hover:text-white">
                                Settings
                            </Link>
                            
                            <button onClick={handleLogout} className="text-slate-200 hover:text-white">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="mr-4 text-slate-200 hover:text-white">
                                Login
                            </Link>
                            <Link href="/register" className="text-slate-200 hover:text-white">
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}