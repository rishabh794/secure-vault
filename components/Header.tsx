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
        <header className="bg-gray-800 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">
                    SecureVault
                </Link>
                <nav className="flex items-center">
                    {isLoading ? null : user ? ( 
                        <>
                            <span className="mr-4">Welcome, {user.email}</span>
                            <Link href="/dashboard" className="mr-4 hover:text-gray-300">
                                Dashboard
                            </Link>

                            <Link href="/settings" className="mr-4 hover:text-gray-300">
                                Settings
                            </Link>
                            
                            <button onClick={handleLogout} className="hover:text-gray-300">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="mr-4 hover:text-gray-300">
                                Login
                            </Link>
                            <Link href="/register" className="hover:text-gray-300">
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}