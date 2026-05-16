"use client";

interface TagFilterProps {
    allTags: string[];
    activeTag: string | null;
    onTagSelect: (tag: string | null) => void;
}

export function TagFilter({ allTags, activeTag, onTagSelect }: TagFilterProps) {
    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-slate-400">Filter by Tag:</span>
            <button 
                onClick={() => onTagSelect(null)}
                className={`text-xs font-semibold px-3 py-1 rounded-full ${!activeTag ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
                All
            </button>
            {allTags.map(tag => (
                <button 
                    key={tag}
                    onClick={() => onTagSelect(tag)}
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${activeTag === tag ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                    {tag}
                </button>
            ))}
        </div>
    );
}