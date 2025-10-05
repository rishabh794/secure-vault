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
    item: { _id: string; encryptedData: string }; 
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
        setTimeout(() => navigator.clipboard.writeText(' '), 15000);
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="font-bold text-lg mb-2">{decryptedData?.title || 'Encrypted Title'}</h3>
            <button onClick={onEdit} className="text-sm text-blue-400 hover:underline">Edit</button>
            <button onClick={handleDelete} className="text-sm text-red-400 hover:underline">Delete</button>
            
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