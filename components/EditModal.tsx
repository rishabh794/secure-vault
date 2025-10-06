"use client";

import { useState, useEffect } from "react";
import { encryptData, decryptData } from "@/lib/crypto";
import toast from "react-hot-toast";

type VaultItem = { title: string; username: string; password?: string; url?: string; notes?: string; };

interface EditModalProps {
    item: { _id: string; encryptedData: string };
    masterPassword: string;
    onClose: () => void;
    onSave: () => void;
}

export function EditModal({ item, masterPassword, onClose, onSave }: EditModalProps) {
    const [title, setTitle] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        try {
            const decrypted = decryptData(item.encryptedData, masterPassword) as VaultItem;
            setTitle(decrypted.title);
            setUsername(decrypted.username);
            setPassword(decrypted.password || '');
            setUrl(decrypted.url || '');
            setNotes(decrypted.notes || '');
        } catch {
            toast.error("Failed to decrypt item for editing.");
            onClose();
        }
    }, [item, masterPassword, onClose]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const updatedItem = { title, username, password, url, notes };
        const encryptedData = encryptData(updatedItem, masterPassword);

        const token = sessionStorage.getItem('token');
        const res = await fetch(`/api/vault/${item._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ encryptedData }),
        });

        if (res.ok) {
            toast.success("Item updated successfully!");
            onSave();
            onClose();
        } else {
            toast.error("Failed to update item.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">Edit Item</h2>
                <form onSubmit={handleSave} className="space-y-4">
                     <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required className="w-full px-3 py-2 text-white bg-gray-700 rounded-md"/>
                     <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required className="w-full px-3 py-2 text-white bg-gray-700 rounded-md"/>
                     <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full px-3 py-2 text-white bg-gray-700 rounded-md"/>
                     <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL (optional)" className="w-full px-3 py-2 text-white bg-gray-700 rounded-md"/>
                     <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" className="w-full px-3 py-2 text-white bg-gray-700 rounded-md h-24"></textarea>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-bold text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}