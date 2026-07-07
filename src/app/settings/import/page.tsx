"use client";

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { decryptData, encryptWithKey } from '@/lib/crypto';
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

                const verifyRes = await fetch('/api/master-password/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ masterPassword: currentMasterPassword })
                });

                if (!verifyRes.ok) {
                    const data = await verifyRes.json();
                    toast.error(data.error || "Invalid master password.");
                    return;
                }

                const verifyData = await verifyRes.json();
                const { vaultKey } = decryptData<{ vaultKey: string }>(verifyData.vaultKeyEncrypted, currentMasterPassword);
                
                for (const item of plaintextItems) {
                    const newEncryptedData = encryptWithKey(item, vaultKey);
                    
                    const res = await fetch('/api/vault', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({
                            encryptedData: newEncryptedData,
                            tags: item.tags || []
                        }),
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
            <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
                <div className="mx-auto max-w-4xl">
                    <h1 className="text-3xl font-semibold text-slate-50 mb-6">Import Vault</h1>
                    <div className="max-w-lg rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl">
                        <h2 className="text-xl font-semibold text-slate-50 mb-2">Restore from Backup</h2>
                        <p className="text-slate-300 mb-4">
                        To migrate a vault, provide the backup file and the two required passwords.
                        </p>
                        <div className="flex flex-col space-y-4">
                            <input
                                type="file"
                                accept=".txt"
                                onChange={handleFileChange}
                                className="w-full text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-200 hover:file:bg-slate-700"
                            />
                            <input
                                type="password"
                                placeholder="Enter Password for Backup File"
                                value={backupPassword}
                                onChange={(e) => setBackupPassword(e.target.value)}
                                className="h-11 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                            />
                            <input
                                type="password"
                                placeholder="Enter Master Password to unlock"
                                value={currentMasterPassword}
                                onChange={(e) => setCurrentMasterPassword(e.target.value)}
                                className="h-11 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                            />
                            <button onClick={handleImport} disabled={isImporting} className="w-full rounded-full bg-emerald-400/90 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:bg-slate-700 disabled:text-slate-300">
                                {isImporting ? 'Importing...' : 'Import Vault'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}