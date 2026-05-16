"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function Header() {
    const { user, logout , isLoading  } = useAuth(); 
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const handleCloseMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/75 text-slate-100 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link href="/" className="text-lg font-semibold tracking-tight">
                    SecureVault
                </Link>
                <button
                    type="button"
                    onClick={() => setIsMenuOpen((open) => !open)}
                    aria-expanded={isMenuOpen}
                    aria-controls="primary-navigation"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-800/70 text-slate-200 hover:border-slate-600 md:hidden"
                >
                    <span className="sr-only">Toggle navigation</span>
                    <span className="flex flex-col gap-1">
                        <span className="block h-0.5 w-5 bg-current"></span>
                        <span className="block h-0.5 w-5 bg-current"></span>
                        <span className="block h-0.5 w-5 bg-current"></span>
                    </span>
                </button>
                <nav className="hidden items-center text-sm md:flex">
                    {isLoading ? null : user ? ( 
                        <>
                            <span className="mr-4 max-w-[220px] truncate text-slate-300">Welcome, {user.email}</span>
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
            <div
                id="primary-navigation"
                className={`${isMenuOpen ? 'block' : 'hidden'} border-t border-slate-800/70 bg-slate-950/95 px-6 pb-4 md:hidden`}
            >
                <div className="flex flex-col gap-3 pt-4 text-sm">
                    {isLoading ? null : user ? (
                        <>
                            <span className="text-slate-400">Signed in as {user.email}</span>
                            <Link href="/dashboard" onClick={handleCloseMenu} className="text-slate-200 hover:text-white">
                                Dashboard
                            </Link>
                            <Link href="/settings" onClick={handleCloseMenu} className="text-slate-200 hover:text-white">
                                Settings
                            </Link>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    handleCloseMenu();
                                }}
                                className="text-left text-slate-200 hover:text-white"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" onClick={handleCloseMenu} className="text-slate-200 hover:text-white">
                                Login
                            </Link>
                            <Link href="/register" onClick={handleCloseMenu} className="text-slate-200 hover:text-white">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}