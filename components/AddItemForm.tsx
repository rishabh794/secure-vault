"use client";

import { useState } from 'react';
import toast from 'react-hot-toast';
import { encryptWithKey, VAULT_ITEM_ENCRYPTION_VERSION } from '@/lib/crypto';
import { PasswordGenerator } from './PasswordGenerator';

interface AddItemFormProps {
    vaultKey: string | null;
    onItemAdded: () => void;
    canAdd: boolean;
}

export function AddItemForm({ vaultKey, onItemAdded, canAdd }: AddItemFormProps) {
    const [title, setTitle] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [showGenerator, setShowGenerator] = useState(false);
    const [tags, setTags] = useState('');

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canAdd) {
            return toast.error("Unlock your vault to add items.");
        }
        if (!vaultKey) {
            return toast.error("Unlock your vault to add items.");
        }
        
        const token = sessionStorage.getItem('token');
        const newItem = { title, username, password, url, notes };
        const encryptedData = encryptWithKey(newItem, vaultKey);
        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

        const res = await fetch('/api/vault', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ encryptedData, tags: tagsArray, encryptionVersion: VAULT_ITEM_ENCRYPTION_VERSION })
        });
        
        if (res.ok) {
            toast.success("Item added successfully!");
            setTitle(''); setUsername(''); setPassword(''); setUrl(''); setNotes(''); setTags('');
            onItemAdded(); 
        } else {
            toast.error("Failed to add item.");
        }
    };

    return (
        <div className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-50">Add New Item</h2>
                {!canAdd && (
                    <span className="text-sm text-amber-300">Unlock your vault to add items.</span>
                )}
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
                <fieldset disabled={!canAdd} className={canAdd ? "" : "opacity-60"}>
                    <div className="grid grid-cols-1 gap-4">
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required className="h-11 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"/>
                        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required className="h-11 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"/>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="h-11 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 sm:flex-1" />
                            <button type="button" onClick={() => setShowGenerator(!showGenerator)} className="h-11 w-full rounded-lg border border-slate-700/70 bg-slate-800/70 px-4 text-sm font-semibold text-slate-100 hover:border-slate-500 sm:w-auto">Generate</button>
                        </div>
                        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL (optional)" className="h-11 w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"/>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" className="min-h-[110px] rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"></textarea>
                        <input 
                            value={tags} 
                            onChange={e => setTags(e.target.value)} 
                            placeholder="Tags (comma-separated)" 
                            className="h-11 rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                        />

                        {showGenerator && (
                            <div>
                                <PasswordGenerator onPasswordGenerated={(newPassword) => { setPassword(newPassword); setShowGenerator(false); }} />
                            </div>
                        )}
                        <button type="submit" className="w-full rounded-full bg-emerald-400/90 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300">Add Item</button>
                    </div>
                </fieldset>
            </form>
        </div>
    );
}