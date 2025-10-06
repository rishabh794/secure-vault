"use client";

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { encryptData, decryptData } from '@/lib/crypto';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type VaultItem = { title: string; username: string; password?: string; url?: string; notes?: string; tags?: string[] };

export default function ImportPage() {
    const [backupPassword, setBackupPassword] = useState('');
    const [currentMasterPassword, setCurrentMasterPassword] = useState('');
    const [backupFile, setBackupFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setBackupFile(e.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!backupFile) { return toast.error("Please select a backup file."); }
        if (!backupPassword) { return toast.error("Please enter the backup file's password."); }
        if (!currentMasterPassword) { return toast.error("Please enter your current account's master password."); }

        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            const encryptedContent = e.target?.result as string;
            try {
                const plaintextItems = decryptData<VaultItem[]>(encryptedContent, backupPassword);

                if (!Array.isArray(plaintextItems)) { throw new Error("Invalid backup file format."); }

                const token = sessionStorage.getItem('token');
                
                for (const item of plaintextItems) {
                    const newEncryptedData = encryptData(item, currentMasterPassword);
                    
                    const res = await fetch('/api/vault', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ encryptedData: newEncryptedData, tags: item.tags || [] }),
                    });

                    if (!res.ok) { throw new Error("An error occurred while saving an item."); }
                }
                
                toast.success(`${plaintextItems.length} items imported successfully! Redirecting...`);
                setTimeout(() => router.push('/dashboard'), 2000);

            } catch {
                toast.error("Import failed. Check your file and passwords.");
            } finally {
                setIsImporting(false);
            }
        };

        reader.readAsText(backupFile);
    };

    return (
        <ProtectedRoute>
            <div className="bg-gray-900 text-white min-h-screen p-8">
                <h1 className="text-3xl font-bold mb-6">Import Vault</h1>
                <div className="bg-gray-800 rounded-lg shadow-md p-6 max-w-lg mx-auto">
                    <h2 className="text-xl font-semibold mb-2">Restore from Backup</h2>
                    <p className="text-gray-400 mb-4">
                        To migrate a vault, provide the backup file and the two required passwords.
                    </p>
                    <div className="flex flex-col space-y-4">
                        <input
                            type="file"
                            accept=".txt"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <input
                            type="password"
                            placeholder="Enter Password for Backup File"
                            value={backupPassword}
                            onChange={(e) => setBackupPassword(e.target.value)}
                            className="flex-grow px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md"
                        />
                        <input
                            type="password"
                            placeholder="Enter Your Current Master Password"
                            value={currentMasterPassword}
                            onChange={(e) => setCurrentMasterPassword(e.target.value)}
                            className="flex-grow px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md"
                        />
                        <button onClick={handleImport} disabled={isImporting} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500">
                            {isImporting ? 'Importing...' : 'Import Vault'}
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}