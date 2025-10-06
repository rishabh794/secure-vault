"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import Link from "next/link";

export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <div className="bg-gray-900 text-white min-h-screen p-8">
                <h1 className="text-3xl font-bold mb-6">Settings</h1>
                
                <div className="max-w-lg mx-auto space-y-4">
                    <Link href="/settings/security" className="block p-6 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-colors">
                        <h2 className="text-xl font-semibold">Security</h2>
                        <p className="text-gray-400 mt-1">Manage your account security, including Two-Factor Authentication (2FA).</p>
                    </Link>

                    <Link href="/settings/export" className="block p-6 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-colors">
                        <h2 className="text-xl font-semibold">Export Vault</h2>
                        <p className="text-gray-400 mt-1">Create a secure, encrypted backup of your vault data.</p>
                    </Link>

                    <Link href="/settings/import" className="block p-6 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-colors">
                        <h2 className="text-xl font-semibold">Import Vault</h2>
                        <p className="text-gray-400 mt-1">Restore your vault from an encrypted backup file.</p>
                    </Link>

                </div>
            </div>
        </ProtectedRoute>
    );
}