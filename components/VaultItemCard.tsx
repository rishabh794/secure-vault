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
            <h3 className="font-semibold text-lg text-slate-50 mb-2">{decryptedData?.title || 'Encrypted Title'}</h3>
            <button onClick={onEdit} className="text-sm text-emerald-300 hover:text-emerald-200 pr-2">Edit</button>
            <button onClick={handleDelete} className="text-sm text-rose-300 hover:text-rose-200">Delete</button>
            
            <div className="flex items-center justify-between mb-1">
                <p className="text-slate-400 truncate">
                    <strong>Username:</strong> {decryptedData?.username || 'Encrypted'}
                </p>
                {decryptedData && <button onClick={() => handleCopy(decryptedData.username, 'Username')} className="text-sm text-emerald-300 hover:text-emerald-200 ml-4">Copy</button>}
            </div>

            <div className="flex items-center justify-between mb-1">
                <p className="text-slate-400 truncate">
                    <strong>Password:</strong> {decryptedData?.password || 'Encrypted'}
                </p>
                {decryptedData && <button onClick={() => handleCopy(decryptedData.password || '', 'Password')} className="text-sm text-emerald-300 hover:text-emerald-200 ml-4">Copy</button>}
            </div>
            
            {decryptedData?.url && <p className="text-slate-400 truncate"><strong>URL:</strong> {decryptedData.url}</p>}
            {decryptedData?.notes && <p className="text-slate-400 mt-2"><strong>Notes:</strong> {decryptedData.notes}</p>}
            {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {item.tags.map(tag => (
                        <span key={tag} className="bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-1 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        
        </div>
    );
}