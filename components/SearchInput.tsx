"use client";

interface SearchInputProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

export function SearchInput({ searchTerm, onSearchChange }: SearchInputProps) {
    return (
        <input
            type="text"
            placeholder="Search by title or username..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 mb-4"
        />
    );
}