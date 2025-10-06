"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function SecurityPage() {
    const { user , login} = useAuth(); 
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [verifyToken, setVerifyToken] = useState('');
    const [isSetupView, setIsSetupView] = useState(false);

    const handleEnable2FA = async () => {
        const token = sessionStorage.getItem('token');
        const res = await fetch('/api/2fa/setup', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            setQrCodeUrl(data.qrCodeUrl);
            setIsSetupView(true); 
        } else {
            toast.error("Failed to start 2FA setup.");
        }
    };

    const handleVerify2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        const sessionToken = sessionStorage.getItem('token');
        const res = await fetch('/api/2fa/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
            body: JSON.stringify({ token: verifyToken }),
        });

        const data = await res.json();
        if (res.ok) {
            toast.success("2FA enabled successfully!");
            login(data.token); 
            setIsSetupView(false); 
        } else {
            toast.error("Invalid 2FA code. Please try again.");
        }
    };

    return (
        <ProtectedRoute>
            <div className="bg-gray-900 text-white min-h-screen p-8">
                <h1 className="text-3xl font-bold mb-6">Security Settings</h1>
                
                <div className="bg-gray-800 rounded-lg shadow-md p-6 max-w-lg mx-auto">
                    <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication (2FA)</h2>
                    
                    {user && user.isTwoFactorEnabled ? (
                        <p className="text-green-400">2FA is currently enabled on your account.</p>
                    ) : isSetupView ? (
                        <div>
                            <div>
                                <p className="mb-4">1. Scan this QR code with your authenticator app (e.g., Google Authenticator).</p>
                                <Image src={qrCodeUrl} alt="2FA QR Code" width={200} height={200} />
                            </div>
                            <p className="mb-4">2. Enter the 6-digit code from your app to verify and complete the setup.</p>
                            <form onSubmit={handleVerify2FA} className="flex items-center space-x-4">
                                <input 
                                    type="text" 
                                    value={verifyToken}
                                    onChange={(e) => setVerifyToken(e.target.value)}
                                    placeholder="6-digit code"
                                    maxLength={6}
                                    className="flex-grow px-3 py-2 text-white bg-gray-700 rounded-md"
                                />
                                <button type="submit" className="px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700">Verify</button>
                            </form>
                        </div>
                    ) : (
                        <div>
                            <p className="mb-4 text-gray-400">Protect your account with an extra layer of security.</p>
                            <button onClick={handleEnable2FA} className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                Enable 2FA
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}