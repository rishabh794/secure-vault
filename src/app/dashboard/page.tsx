"use client";

import { useState, useEffect } from 'react';
import { encryptData, decryptData } from '@/lib/crypto';
import { ProtectedRoute } from '@/components/ProtectedRoute';

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
    const [message, setMessage] = useState('');

    const [title, setTitle] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [url , setUrl] = useState('');
    const [notes, setNotes] = useState('');

    const fetchItems = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            setMessage("You are not logged in.");
            return;
        }

        const res = await fetch('/api/vault', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            setItems(data.items || []);
        } else {
            setMessage("Failed to fetch items.");
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
            setMessage("Vault unlocked!");
        } catch {
            setMessage("Decryption failed. Check your master password.");
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
            setMessage("Item added successfully!");
            setTitle(''); setUsername(''); setPassword(''); setUrl(''); setNotes('');
            fetchItems(); 
        } else {
            setMessage("Failed to add item.");
        }
    };

    return (
        <ProtectedRoute>
            <h1>Dashboard</h1>
            <p>Enter your Master Password to decrypt your vault.</p>
            <input
                type="password"
                placeholder="Master Password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
            />
            <button onClick={handleDecryptAll}>Unlock Vault</button>
            <hr />

            <h2>Add New Item</h2>
            <form onSubmit={handleAddItem}>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="url" />
                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="notes" />

                <button type="submit">Add Item</button>
            </form>
            <hr />
            
            <h2>Your Vault Items</h2>
            {message && <p><strong>{message}</strong></p>}
            <ul>
                {items.map(item => (
                    <li key={item._id} style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '5px' }}>
                        <strong>Title: </strong>
                        {decryptedItems[item._id]?.title || 'Encrypted'}
                        <br />
                        <strong>Username: </strong>
                        {decryptedItems[item._id]?.username || 'Encrypted'}
                        <br />
                        <strong>Password: </strong>
                        {decryptedItems[item._id]?.password || 'Encrypted'}
                        <br />
                        <strong>URL: </strong>
                        {decryptedItems[item._id]?.url || 'Encrypted'}
                        <br />
                        <strong>Notes: </strong>
                        {decryptedItems[item._id]?.notes || 'Encrypted'}
                    </li>
                ))}
            </ul>
        </ProtectedRoute>
    );
}