"use client";

import { useState, useEffect , useMemo } from 'react';
import { decryptData, decryptWithKey, encryptWithKey } from '@/lib/crypto';
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

type VaultDbItem = {
    _id: string;
    encryptedData: string;
    tags: string[];
};

export default function DashboardPage() {
    const [items, setItems] = useState<VaultDbItem[]>([]);
    const [decryptedItems, setDecryptedItems] = useState<Record<string, VaultItem>>({});
    const [masterPassword, setMasterPassword] = useState('');
    const [newMasterPassword, setNewMasterPassword] = useState('');
    const [confirmMasterPassword, setConfirmMasterPassword] = useState('');
    const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
    const [editingItem, setEditingItem] = useState<VaultDbItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showMasterPassword, setShowMasterPassword] = useState(false);
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [vaultKey, setVaultKey] = useState<string | null>(null);
    const [hasMasterPassword, setHasMasterPassword] = useState<boolean | null>(null);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isSettingMasterPassword, setIsSettingMasterPassword] = useState(false);

     const allTags = useMemo(() => {
        const tagsSet = new Set<string>();
        items.forEach(item => {
            item.tags?.forEach(tag => tagsSet.add(tag));
        });
        return Array.from(tagsSet).sort();
    }, [items]);

    const fetchMasterPasswordStatus = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            setHasMasterPassword(false);
            return;
        }

        const res = await fetch('/api/master-password/status', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            setHasMasterPassword(Boolean(data.hasMasterPassword));
        } else {
            setHasMasterPassword(false);
        }
    };

    const fetchItems = async (options?: { vaultKey?: string | null; decrypt?: boolean }) => {
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
            const fetchedItems: VaultDbItem[] = data.items || [];
            setItems(fetchedItems);

            const activeVaultKey = options?.vaultKey || null;
            if (options?.decrypt && activeVaultKey) {
                const decrypted: Record<string, VaultItem> = {};
                fetchedItems.forEach(item => {
                    try {
                        decrypted[item._id] = decryptWithKey<VaultItem>(item.encryptedData, activeVaultKey);
                    } catch {
                        // Ignore items that cannot be decrypted with the current vault key.
                    }
                });
                setDecryptedItems(decrypted);
            }
        } else {
            toast.error("Failed to fetch items.");
        }
    };

    useEffect(() => {
        fetchItems();
        fetchMasterPasswordStatus();
    }, []);


    const handleUnlockVault = async () => {
        if (!masterPassword) {
            toast.error("Please enter your master password to unlock.");
            return;
        }
        if (hasMasterPassword === false) {
            toast.error("Set your master password first.");
            return;
        }
        if (isUnlocking) {
            return;
        }

        setIsUnlocking(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch('/api/master-password/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ masterPassword })
            });

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.error || "Invalid master password.");
                setIsVaultUnlocked(false);
                setVaultKey(null);
                setDecryptedItems({});
                return;
            }

            const data = await res.json();
            const { vaultKey } = decryptData<{ vaultKey: string }>(data.vaultKeyEncrypted, masterPassword);

            if (items.length === 0) {
                setVaultKey(vaultKey);
                setIsVaultUnlocked(true);
                setDecryptedItems({});
                toast.success("Vault unlocked. Add your first item.");
                return;
            }

            const decrypted: Record<string, VaultItem> = {};
            const failedItemIds: string[] = [];

            items.forEach(item => {
                try {
                    decrypted[item._id] = decryptWithKey<VaultItem>(item.encryptedData, vaultKey);
                } catch {
                    failedItemIds.push(item._id);
                }
            });

            if (Object.keys(decrypted).length === 0) {
                setDecryptedItems({});
                setIsVaultUnlocked(false);
                setVaultKey(null);
                toast.error("Decryption failed. Check your master password.");
                return;
            }

            setVaultKey(vaultKey);
            setDecryptedItems(decrypted);
            setIsVaultUnlocked(true);


            if (failedItemIds.length > 0) {
                toast("Vault unlocked, but some items could not be decrypted.");
            } else {
                toast.success("Vault unlocked!");
            }
        } catch {
            toast.error("An error occurred while unlocking the vault.");
        } finally {
            setIsUnlocking(false);
            setMasterPassword('');
            setShowMasterPassword(false);
        }
    };

    const handleSetMasterPassword = async () => {
        if (!newMasterPassword || !confirmMasterPassword) {
            toast.error("Please enter and confirm your master password.");
            return;
        }
        if (newMasterPassword !== confirmMasterPassword) {
            toast.error("Master password confirmation does not match.");
            return;
        }
        if (isSettingMasterPassword) {
            return;
        }

        setIsSettingMasterPassword(true);
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch('/api/master-password/setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ masterPassword: newMasterPassword })
            });

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.error || "Failed to set master password.");
                return;
            }

            const data = await res.json();
            const { vaultKey } = decryptData<{ vaultKey: string }>(data.vaultKeyEncrypted, newMasterPassword);
            setHasMasterPassword(true);
            setVaultKey(vaultKey);
            setIsVaultUnlocked(true);
            setDecryptedItems({});
            toast.success("Master password set. Vault unlocked.");

            setNewMasterPassword('');
            setConfirmMasterPassword('');
            setShowMasterPassword(false);
        } catch {
            toast.error("Failed to set master password.");
        } finally {
            setIsSettingMasterPassword(false);
        }
    };

    const handleMasterPasswordChange = (value: string) => {
        setMasterPassword(value);
        setIsVaultUnlocked(false);
        setVaultKey(null);
        setDecryptedItems({});
        if (editingItem) {
            setEditingItem(null);
        }
    };

     const handleEditClick = (item: VaultDbItem) => {
        if (!vaultKey || !isVaultUnlocked) {
            toast.error("Unlock your vault to edit items.");
            return;
        }
        setEditingItem(item);
    };

    const handleUpdateSuccess = () => {
        fetchItems();
        setDecryptedItems({});
        setIsVaultUnlocked(false);
        setVaultKey(null);
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
            <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 sm:px-6 overflow-x-hidden">
                <div className="mx-auto w-full max-w-6xl">
                    <h1 className="text-3xl font-semibold text-slate-50 mb-6">Dashboard</h1>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-xl">
                                <h2 className="text-xl font-semibold text-slate-50 mb-4">
                                    {hasMasterPassword ? 'Unlock Your Vault' : 'Set Your Master Password'}
                                </h2>

                                {hasMasterPassword === null ? (
                                    <p className="text-sm text-slate-400">Checking vault status...</p>
                                ) : hasMasterPassword ? (
                                    <div>
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                            <div className="relative flex-grow">
                                                <input
                                                    type={showMasterPassword ? 'text' : 'password'}
                                                    placeholder="Enter Your Master Password"
                                                    value={masterPassword}
                                                    onChange={(e) => handleMasterPasswordChange(e.target.value)}
                                                    className="w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowMasterPassword(!showMasterPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-sm text-slate-400 hover:text-slate-100"
                                                >
                                                    {showMasterPassword ? 'Hide' : 'Show'}
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleUnlockVault}
                                                disabled={isUnlocking}
                                                className="rounded-full bg-emerald-400/90 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {isUnlocking ? 'Unlocking...' : 'Unlock Vault'}
                                            </button>
                                        </div>
                                        <p className="mt-3 text-sm text-slate-400">
                                            Use one master password for all items.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <input
                                                type={showMasterPassword ? 'text' : 'password'}
                                                placeholder="Create Master Password"
                                                value={newMasterPassword}
                                                onChange={(e) => setNewMasterPassword(e.target.value)}
                                                className="w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowMasterPassword(!showMasterPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center px-3 text-sm text-slate-400 hover:text-slate-100"
                                            >
                                                {showMasterPassword ? 'Hide' : 'Show'}
                                            </button>
                                        </div>
                                        <input
                                            type={showMasterPassword ? 'text' : 'password'}
                                            placeholder="Confirm Master Password"
                                            value={confirmMasterPassword}
                                            onChange={(e) => setConfirmMasterPassword(e.target.value)}
                                            className="w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
                                        />
                                        <button
                                            onClick={handleSetMasterPassword}
                                            disabled={isSettingMasterPassword}
                                            className="w-full rounded-full bg-emerald-400/90 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isSettingMasterPassword ? 'Saving...' : 'Set Master Password'}
                                        </button>
                                        <p className="text-sm text-slate-400">
                                            This is separate from your login password. Keep it safe.
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            If you already had items, use the master password you used before (even if weak).
                                        </p>
                                    </div>
                                )}
                            </div>

                            <AddItemForm
                                vaultKey={vaultKey}
                                onItemAdded={() => fetchItems({ vaultKey, decrypt: isVaultUnlocked })}
                                canAdd={isVaultUnlocked}
                            />
                        </div>

                        <div className="min-w-0 space-y-4">
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
                                                onDeleted={() => fetchItems({ vaultKey, decrypt: isVaultUnlocked })}
                                                onEdit={() => handleEditClick(item)}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-slate-400">Your vault is empty. Add an item to get started.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                      {editingItem && (
                        <EditModal 
                            item={editingItem}
                            vaultKey={vaultKey}
                            onClose={() => setEditingItem(null)}
                            onSave={handleUpdateSuccess}
                        />
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}