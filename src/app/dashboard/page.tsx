"use client";

import { useState, useEffect , useMemo } from 'react';
import { decryptData } from '@/lib/crypto';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import toast from 'react-hot-toast';
import { AddItemForm } from '@/components/AddItemForm'
import { VaultItemCard } from '@/components/VaultItemCard';
import { EditModal } from '@/components/EditModal';
import { SearchInput } from '@/components/SearchInput';
import { TagFilter } from '@/components/TagFilter';

type VaultItem = {
    title: string;
    username: string;
    password?: string;
    url?: string;
    notes?: string;
};

export default function DashboardPage() {
    const [items, setItems] = useState<Array<{ _id: string; encryptedData: string; tags:string[] }>>([]);
    const [decryptedItems, setDecryptedItems] = useState<Record<string, VaultItem>>({});
    const [masterPassword, setMasterPassword] = useState('');
    const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
    const [editingItem, setEditingItem] = useState<{ _id: string; encryptedData: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showMasterPassword, setShowMasterPassword] = useState(false);
    const [activeTag, setActiveTag] = useState<string | null>(null);

     const allTags = useMemo(() => {
        const tagsSet = new Set<string>();
        items.forEach(item => {
            item.tags?.forEach(tag => tagsSet.add(tag));
        });
        return Array.from(tagsSet).sort();
    }, [items]);

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
            toast.error("Please enter your master password to unlock.");
            return;
        }

        if (items.length === 0) {
            setIsVaultUnlocked(true);
            setDecryptedItems({});
            toast.success("Vault unlocked. Add your first item.");
            return;
        }

        const decrypted: Record<string, VaultItem> = {};
        const failedItemIds: string[] = [];

        items.forEach(item => {
            try {
                decrypted[item._id] = decryptData<VaultItem>(item.encryptedData, masterPassword);
            } catch {
                failedItemIds.push(item._id);
            }
        });

        if (Object.keys(decrypted).length === 0) {
            setDecryptedItems({});
            setIsVaultUnlocked(false);
            toast.error("Decryption failed. Check your master password.");
            return;
        }

        setDecryptedItems(decrypted);
        setIsVaultUnlocked(true);

        if (failedItemIds.length > 0) {
            toast("Vault unlocked, but some items could not be decrypted. They may use a different master password.");
        } else {
            toast.success("Vault unlocked!");
        }
    };

    const handleMasterPasswordChange = (value: string) => {
        setMasterPassword(value);
        setIsVaultUnlocked(false);
        setDecryptedItems({});
        if (editingItem) {
            setEditingItem(null);
        }
    };

     const handleEditClick = (item: { _id: string; encryptedData: string }) => {
        if (!masterPassword) {
            toast.error("Please enter your master password first.");
            return;
        }
        if (!isVaultUnlocked) {
            toast.error("Unlock your vault to edit items.");
            return;
        }
        setEditingItem(item);
    };

    const handleUpdateSuccess = () => {
        fetchItems();
        setDecryptedItems({});
        setIsVaultUnlocked(false);
        toast('Item updated. Please unlock vault to see changes.');
    };

    const filteredItems = useMemo(() => {
        let filtered = items;

        if (activeTag) {
            filtered = filtered.filter(item => item.tags?.includes(activeTag));
        }

        if (searchTerm) {
            filtered = filtered.filter(item => {
                const decrypted = decryptedItems[item._id];
                if (!decrypted) return false;

                const searchTermLower = searchTerm.toLowerCase();

                return decrypted.title.toLowerCase().includes(searchTermLower) ||
                       decrypted.username.toLowerCase().includes(searchTermLower);
            });
        }
        
        return filtered;
    }, [searchTerm, items, decryptedItems, activeTag]);

    
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-8">
                <div className="mx-auto max-w-6xl">
                    <h1 className="text-3xl font-semibold text-slate-50 mb-6">Dashboard</h1>

                    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 mb-8 shadow-xl">
                        <h2 className="text-xl font-semibold text-slate-50 mb-4">Unlock Your Vault</h2>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="relative flex-grow">
                            <input
                                type={showMasterPassword ? 'text' : 'password'}
                                placeholder="Enter Your Master Password"
                                value={masterPassword}
                                onChange={(e) => handleMasterPasswordChange(e.target.value)}
                                className="w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                            />
                            <button type="button" onClick={() => setShowMasterPassword(!showMasterPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-slate-400 hover:text-slate-100">
                                {showMasterPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <button onClick={handleDecryptAll} className="rounded-full bg-emerald-400/90 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300">Unlock Vault</button>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">
                        Use one master password for all items.
                    </p>
                </div>

                    <AddItemForm
                        masterPassword={masterPassword}
                        onItemAdded={fetchItems}
                        canAdd={isVaultUnlocked || items.length === 0}
                    />
                    <SearchInput searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                    <TagFilter 
                            allTags={allTags}
                            activeTag={activeTag}
                            onTagSelect={setActiveTag}
                        />

                    <div>
                        <h2 className="text-xl font-semibold text-slate-50 mb-4">Your Vault Items</h2>
                        <div className="space-y-4">
                            {filteredItems.length > 0 ? (
                                filteredItems.map(item => (
                                    <VaultItemCard 
                                        key={item._id}
                                        item={item}
                                        decryptedData={decryptedItems[item._id] || null} 
                                        onDeleted={fetchItems}
                                        onEdit={() => handleEditClick(item)}
                                    />
                                ))
                            ) : (
                                <p className="text-slate-400">Your vault is empty. Add an item to get started.</p>
                            )}
                        </div>
                    </div>
                      {editingItem && (
                        <EditModal 
                            item={editingItem}
                            masterPassword={masterPassword}
                            onClose={() => setEditingItem(null)}
                            onSave={handleUpdateSuccess}
                        />
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}