"use client";

import { useState, useEffect } from 'react';
import { encryptData, decryptData } from '@/lib/crypto';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';
import { PasswordGenerator } from '@/components/PasswordGenerator';

type VaultItem = {
    title: string;
    username: string;
    password?: string;
    url?: string;
    notes?: string;
};

export default function DashboardPage() {
    const [items, setItems] = useState<Array<{ _id: string; encryptedData: string }>>([]);
    const [decryptedItems, setDecryptedItems] = useState<Record<string, VaultItem>>({});
    const [masterPassword, setMasterPassword] = useState('');
    const [showGenerator, setShowGenerator] = useState(false);

    const [title, setTitle] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [url , setUrl] = useState('');
    const [notes, setNotes] = useState('');

    const fetchItems = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            toast.error("You are not logged in.");
            return;
        }

        const res = await fetch('/api/vault', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            setItems(data.items || []);
        } else {
            toast.error("Failed to fetch items.");
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleDecryptAll = () => {
        if (!masterPassword) {
            alert("Please enter your master password to decrypt.");
            return;
        }
        try {
            const decrypted: Record<string, VaultItem> = {};
            items.forEach(item => {
                decrypted[item._id] = decryptData(item.encryptedData, masterPassword) as VaultItem;
            });
            setDecryptedItems(decrypted);
            toast.success("Vault unlocked!");
        } catch {
            toast.error("Decryption failed. Check your master password.");
        }
    };
    
    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!masterPassword) {
            alert("Please enter your master password to add an item.");
            return;
        }

        const token = sessionStorage.getItem('token');
        const newItem: VaultItem = { title, username, password , url , notes };
        const encryptedData = encryptData(newItem, masterPassword);

        const res = await fetch('/api/vault', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ encryptedData })
        });
        
        if(res.ok) {
            toast.success("Item added successfully!");
            setTitle(''); setUsername(''); setPassword(''); setUrl(''); setNotes('');
            fetchItems(); 
        } else {
            toast.error("Failed to add item.");
        }
    };

    return (
        <ProtectedRoute>
            <div className="bg-gray-900 text-white min-h-screen p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

                <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Unlock Your Vault</h2>
                    <div className="flex items-center space-x-4">
                        <input
                            type="password"
                            placeholder="Enter Your Master Password"
                            value={masterPassword}
                            onChange={(e) => setMasterPassword(e.target.value)}
                            className="flex-grow px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button onClick={handleDecryptAll} className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">Unlock Vault</button>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Add New Item</h2>
                    <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required className="px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required className="px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                        <div className="flex items-center space-x-2">
                            <input 
                                type="text" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                placeholder="Password" 
                                required 
                                className="flex-grow px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowGenerator(!showGenerator)} 
                                className="px-4 py-2 font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500"
                            >
                                Generate
                            </button>
                        </div>
                        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL (optional)" className="px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md"/>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" className="md:col-span-2 px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md h-24"></textarea>
                        {showGenerator && (
                            <div className="md:col-span-2">
                                <PasswordGenerator onPasswordGenerated={(newPassword) => {
                                    setPassword(newPassword);
                                    setShowGenerator(false); 
                                }} />
                            </div>
                        )}
                        <button type="submit" className="md:col-span-2 w-full px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700">Add Item</button>
                    </form>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">Your Vault Items</h2>
                    <div className="space-y-4">
                        {items.length > 0 ? items.map(item => (
                            <div key={item._id} className="bg-gray-800 rounded-lg shadow-md p-4">
                                <h3 className="font-bold text-lg">{decryptedItems[item._id]?.title || 'Encrypted Title'}</h3>
                                <p className="text-gray-400"><strong>Username:</strong> {decryptedItems[item._id]?.username || 'Encrypted'}</p>
                                <p className="text-gray-400"><strong>Password:</strong> {decryptedItems[item._id]?.password || 'Encrypted'}</p>
                                {decryptedItems[item._id]?.url && <p className="text-gray-400"><strong>URL:</strong> {decryptedItems[item._id]?.url}</p>}
                                {decryptedItems[item._id]?.notes && <p className="text-gray-400 mt-2"><strong>Notes:</strong> {decryptedItems[item._id]?.notes}</p>}
                            </div>
                        )) : <p className="text-gray-500">Your vault is empty. Add an item to get started.</p>}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}