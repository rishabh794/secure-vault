"use client";

import { useState, useEffect } from 'react';
import { decryptData } from '@/lib/crypto';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';
import { AddItemForm } from '@/components/AddItemForm'
import { VaultItemCard } from '@/components/VaultItemCard';

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

                <AddItemForm masterPassword={masterPassword} onItemAdded={fetchItems} />

                <div>
                    <h2 className="text-xl font-semibold mb-4">Your Vault Items</h2>
                    <div className="space-y-4">
                        {items.length > 0 ? items.map(item => (
                            <VaultItemCard 
                                key={item._id}
                                itemId={item._id}
                                decryptedData={decryptedItems[item._id] || null} 
                                onDeleted={fetchItems}
                            />
                        )) : <p className="text-gray-500">Your vault is empty. Add an item to get started.</p>}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}