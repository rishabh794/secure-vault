"use client";

import toast from 'react-hot-toast';

// Define the type for the decrypted data
type VaultItem = {
    title: string;
    username: string;
    password?: string;
    url?: string;
    notes?: string;
};

interface VaultItemCardProps {
    decryptedData: VaultItem | null; // Can be null if not decrypted
}

export function VaultItemCard({ decryptedData }: VaultItemCardProps) {
    const handleCopy = (text: string, fieldName: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`${fieldName} copied to clipboard!`);
        setTimeout(() => navigator.clipboard.writeText(' '), 15000);
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="font-bold text-lg mb-2">{decryptedData?.title || 'Encrypted Title'}</h3>
            
            <div className="flex items-center justify-between mb-1">
                <p className="text-gray-400 truncate">
                    <strong>Username:</strong> {decryptedData?.username || 'Encrypted'}
                </p>
                {decryptedData && <button onClick={() => handleCopy(decryptedData.username, 'Username')} className="text-sm text-blue-400 hover:underline ml-4">Copy</button>}
            </div>

            <div className="flex items-center justify-between mb-1">
                <p className="text-gray-400 truncate">
                    <strong>Password:</strong> {decryptedData?.password || 'Encrypted'}
                </p>
                {decryptedData && <button onClick={() => handleCopy(decryptedData.password || '', 'Password')} className="text-sm text-blue-400 hover:underline ml-4">Copy</button>}
            </div>
            
            {decryptedData?.url && <p className="text-gray-400 truncate"><strong>URL:</strong> {decryptedData.url}</p>}
            {decryptedData?.notes && <p className="text-gray-400 mt-2"><strong>Notes:</strong> {decryptedData.notes}</p>}
        </div>
    );
}