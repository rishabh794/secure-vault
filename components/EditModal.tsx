"use client";

import { useState, useEffect } from "react";
import { encryptData, decryptData } from "@/lib/crypto";
import toast from "react-hot-toast";

type VaultItem = { title: string; username: string; password?: string; url?: string; notes?: string };

interface EditModalProps {
    item: { _id: string; encryptedData: string; tags?: string[]};
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
    const [tags, setTags] = useState('');

    useEffect(() => {
        try {
            const decrypted = decryptData<VaultItem>(item.encryptedData, masterPassword);
            setTitle(decrypted.title);
            setUsername(decrypted.username);
            setPassword(decrypted.password || '');
            setUrl(decrypted.url || '');
            setNotes(decrypted.notes || '');
            setTags(item.tags?.join(', ') || '');
        } catch {
            toast.error("Failed to decrypt item for editing.");
            onClose();
        }
    }, [item, masterPassword, onClose]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const updatedItem = { title, username, password, url, notes };
        const encryptedData = encryptData(updatedItem, masterPassword);
        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

        const token = sessionStorage.getItem('token');
        const res = await fetch(`/api/vault/${item._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ encryptedData , tags: tagsArray }),
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
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50">
            <div className="w-full max-w-lg rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 shadow-2xl">
                <h2 className="text-xl font-semibold text-slate-50 mb-4">Edit Item</h2>
                <form onSubmit={handleSave} className="space-y-4">
                     <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required className="h-11 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"/>
                     <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required className="h-11 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"/>
                     <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="h-11 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"/>
                     <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL (optional)" className="h-11 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"/>
                     <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" className="min-h-[110px] w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"></textarea>
                     <input 
                        value={tags} 
                        onChange={e => setTags(e.target.value)} 
                        placeholder="Tags (comma-separated)" 
                        className="h-11 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                     />
                    
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="rounded-full border border-slate-700/70 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500">Cancel</button>
                        <button type="submit" className="rounded-full bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}