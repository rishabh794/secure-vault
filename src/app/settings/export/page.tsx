"use client";

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { encryptData, decryptData } from '@/lib/crypto';
import toast from 'react-hot-toast';

type VaultItem = { title: string; username: string; password?: string; url?: string; notes?: string; tags?: string[] };

interface VaultDbItem {
    encryptedData: string;
    tags?: string[];
}

export default function ExportPage() {
    const [masterPassword, setMasterPassword] = useState('');

    const handleExport = async () => {
        if (!masterPassword) {
            return toast.error("Please enter your master password to export.");
        }
        
        const token = sessionStorage.getItem('token');
        const res = await fetch('/api/vault', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) { return toast.error("Failed to fetch vault data."); }

        const data = await res.json();
        
        if (!data.items || data.items.length === 0) {
            return toast.error("Your vault is empty. Nothing to export.");
        }

        try {
            const plaintextItems = data.items.map((item: VaultDbItem) => {
                const decrypted = decryptData<VaultItem>(item.encryptedData, masterPassword);
                return { ...decrypted, tags: item.tags };
            });

            const encryptedVault = encryptData(plaintextItems, masterPassword);
            
            const blob = new Blob([encryptedVault], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `secure-vault-backup-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Vault exported successfully!");
            setMasterPassword(''); 
        } catch  {
            toast.error("Export failed. Check your master password.");
        }
    };

    return (
        <ProtectedRoute>
            <div className="bg-gray-900 text-white min-h-screen p-8">
                <h1 className="text-3xl font-bold mb-6">Export Vault</h1>
                <div className="bg-gray-800 rounded-lg shadow-md p-6 max-w-lg mx-auto">
                    <h2 className="text-xl font-semibold mb-2">Create Encrypted Backup</h2>
                    <p className="text-gray-400 mb-4">
                        This will download your entire vault as a single, encrypted text file. 
                        You will need your master password to create the backup and to restore it later.
                    </p>

                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md relative mb-4" role="alert">
                        <strong className="font-bold">Important: </strong>
                        <span className="block sm:inline">Remember the master password used for this export. You will need it to decrypt this backup file in future while importing.</span>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <input
                            type="password"
                            placeholder="Enter Master Password to confirm"
                            value={masterPassword}
                            onChange={(e) => setMasterPassword(e.target.value)}
                            className="flex-grow px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md"
                        />
                        <button onClick={handleExport} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                            Download Encrypted Vault
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}