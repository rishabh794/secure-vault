"use client";

import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { decryptData, decryptWithKey, encryptData } from '@/lib/crypto';
import toast from 'react-hot-toast';

type VaultItem = { title: string; username: string; password?: string; url?: string; notes?: string; tags?: string[] };

interface VaultDbItem {
    encryptedData: string;
    tags?: string[];
}

export default function ExportPage() {
    const [masterPassword, setMasterPassword] = useState('');
    const [backupPassword, setBackupPassword] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!masterPassword) {
            return toast.error("Please enter your master password to unlock the vault.");
        }
        if (!backupPassword) {
            return toast.error("Please enter a backup password for the export file.");
        }

        if (isExporting) {
            return;
        }

        setIsExporting(true);
        const token = sessionStorage.getItem('token');
        const verifyRes = await fetch('/api/master-password/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ masterPassword })
        });

        if (!verifyRes.ok) {
            const data = await verifyRes.json();
            toast.error(data.error || "Invalid master password.");
            setIsExporting(false);
            return;
        }

        const verifyData = await verifyRes.json();
        const { vaultKey } = decryptData<{ vaultKey: string }>(verifyData.vaultKeyEncrypted, masterPassword);
        
        const res = await fetch('/api/vault', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            toast.error("Failed to fetch vault data.");
            setIsExporting(false);
            return;
        }

        const data = await res.json();
        
        if (!data.items || data.items.length === 0) {
            return toast.error("Your vault is empty. Nothing to export.");
        }

        try {
            const plaintextItems = data.items.map((item: VaultDbItem) => {
                const decrypted = decryptWithKey<VaultItem>(item.encryptedData, vaultKey);
                return { ...decrypted, tags: item.tags };
            });

            const encryptedVault = encryptData(plaintextItems, backupPassword);
            
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
            setBackupPassword('');
        } catch  {
            toast.error("Export failed. Check your passwords.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
                <div className="mx-auto max-w-4xl">
                    <h1 className="text-3xl font-semibold text-slate-50 mb-6">Export Vault</h1>
                    <div className="max-w-lg rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl">
                        <h2 className="text-xl font-semibold text-slate-50 mb-2">Create Encrypted Backup</h2>
                        <p className="text-slate-300 mb-4">
                        This will download your entire vault as a single, encrypted text file.
                        You will use your master password to unlock the vault and a separate backup password to protect the file.
                        </p>

                        <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-amber-200 mb-4" role="alert">
                            <strong className="font-semibold">Important: </strong>
                            <span className="block sm:inline">Remember the backup password used for this export. You will need it to decrypt this backup file in future while importing.</span>
                        </div>

                        <div className="flex flex-col space-y-4">
                            <input
                                type="password"
                                placeholder="Enter Master Password to unlock"
                                value={masterPassword}
                                onChange={(e) => setMasterPassword(e.target.value)}
                                className="h-11 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                            />
                            <input
                                type="password"
                                placeholder="Enter Backup Password for file"
                                value={backupPassword}
                                onChange={(e) => setBackupPassword(e.target.value)}
                                className="h-11 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                            />
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="w-full rounded-full bg-emerald-400/90 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isExporting ? 'Exporting...' : 'Download Encrypted Vault'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}