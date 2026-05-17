"use client";

import toast from 'react-hot-toast';

type VaultItem = {
    title: string;
    username: string;
    password?: string;
    url?: string;
    notes?: string;
};

interface VaultItemCardProps {
    decryptedData: VaultItem | null;
    item: { _id: string; encryptedData: string; tags: string[]}; 
    onDeleted: (id: string) => void;
    onEdit: () => void; 
}

export function VaultItemCard({ decryptedData, item, onDeleted , onEdit}: VaultItemCardProps) {

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this item?")) {
            return;
        }

        const token = sessionStorage.getItem('token');
        const res = await fetch(`/api/vault/${item._id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            toast.success("Item deleted successfully!");
            onDeleted(item._id); 
        } else {
            toast.error("Failed to delete item.");
        }
    };

    const handleCopy = (text: string, fieldName: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success(`${fieldName} copied to clipboard!`);
        setTimeout(() => {
            if (document.hasFocus()) {
                navigator.clipboard.writeText(' ');
            }
        }, 15000);
    };

    return (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-lg">
            <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 flex-1 text-lg font-semibold text-slate-50 break-words">
                    {decryptedData?.title || 'Encrypted Title'}
                </h3>
                <div className="flex shrink-0 items-center gap-2">
                    <button onClick={onEdit} className="text-sm text-emerald-300 hover:text-emerald-200">Edit</button>
                    <button onClick={handleDelete} className="text-sm text-rose-300 hover:text-rose-200">Delete</button>
                </div>
            </div>

            <div className="mt-2 flex items-center gap-3">
                <p className="min-w-0 flex-1 truncate text-slate-400">
                    <span className="font-semibold text-slate-300">Username:</span> {decryptedData?.username || 'Encrypted'}
                </p>
                {decryptedData && (
                    <button
                        onClick={() => handleCopy(decryptedData.username, 'Username')}
                        className="shrink-0 text-sm text-emerald-300 hover:text-emerald-200"
                    >
                        Copy
                    </button>
                )}
            </div>

            <div className="flex items-center gap-3">
                <p className="min-w-0 flex-1 truncate text-slate-400">
                    <span className="font-semibold text-slate-300">Password:</span> {decryptedData?.password || 'Encrypted'}
                </p>
                {decryptedData && (
                    <button
                        onClick={() => handleCopy(decryptedData.password || '', 'Password')}
                        className="shrink-0 text-sm text-emerald-300 hover:text-emerald-200"
                    >
                        Copy
                    </button>
                )}
            </div>

            {decryptedData?.url && (
                <p className="text-slate-400 break-all">
                    <span className="font-semibold text-slate-300">URL:</span> {decryptedData.url}
                </p>
            )}
            {decryptedData?.notes && (
                <p className="mt-2 text-slate-400 break-words">
                    <span className="font-semibold text-slate-300">Notes:</span> {decryptedData.notes}
                </p>
            )}
            {item.tags && item.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                        <span key={tag} className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}