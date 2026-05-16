"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import Link from "next/link";

export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
                <div className="mx-auto max-w-4xl">
                    <h1 className="text-3xl font-semibold text-slate-50 mb-6">Settings</h1>
                    
                    <div className="space-y-4">
                        <Link href="/settings/security" className="block rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-lg hover:border-slate-600 transition-colors">
                            <h2 className="text-xl font-semibold text-slate-50">Security</h2>
                            <p className="text-slate-400 mt-1">Manage your account security, including Two-Factor Authentication (2FA).</p>
                        </Link>

                        <Link href="/settings/export" className="block rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-lg hover:border-slate-600 transition-colors">
                            <h2 className="text-xl font-semibold text-slate-50">Export Vault</h2>
                            <p className="text-slate-400 mt-1">Create a secure, encrypted backup of your vault data.</p>
                        </Link>

                        <Link href="/settings/import" className="block rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-lg hover:border-slate-600 transition-colors">
                            <h2 className="text-xl font-semibold text-slate-50">Import Vault</h2>
                            <p className="text-slate-400 mt-1">Restore your vault from an encrypted backup file.</p>
                        </Link>

                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}