"use client";

import { useState } from 'react';
import toast from 'react-hot-toast';
import { encryptData } from '@/lib/crypto';
import { PasswordGenerator } from './PasswordGenerator';

interface AddItemFormProps {
    masterPassword: string;
    onItemAdded: () => void; 
}

export function AddItemForm({ masterPassword, onItemAdded }: AddItemFormProps) {
    const [title, setTitle] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [showGenerator, setShowGenerator] = useState(false);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!masterPassword) {
            return toast.error("Please enter your master password to add an item.");
        }
        
        const token = sessionStorage.getItem('token');
        const newItem = { title, username, password, url, notes };
        const encryptedData = encryptData(newItem, masterPassword);

        const res = await fetch('/api/vault', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ encryptedData })
        });
        
        if (res.ok) {
            toast.success("Item added successfully!");
            setTitle(''); setUsername(''); setPassword(''); setUrl(''); setNotes('');
            onItemAdded(); 
        } else {
            toast.error("Failed to add item.");
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
            <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required className="px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                 <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required className="px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                 <div className="flex items-center space-x-2">
                     <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="flex-grow px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" />
                     <button type="button" onClick={() => setShowGenerator(!showGenerator)} className="px-4 py-2 font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500">Generate</button>
                 </div>
                 <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL (optional)" className="px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                 <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" className="md:col-span-2 px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md h-24"></textarea>
                 {showGenerator && (
                     <div className="md:col-span-2">
                         <PasswordGenerator onPasswordGenerated={(newPassword) => { setPassword(newPassword); setShowGenerator(false); }} />
                     </div>
                 )}
                 <button type="submit" className="md:col-span-2 w-full px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700">Add Item</button>
             </form>
        </div>
    );
}