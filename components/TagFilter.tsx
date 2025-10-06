"use client";

interface TagFilterProps {
    allTags: string[];
    activeTag: string | null;
    onTagSelect: (tag: string | null) => void;
}

export function TagFilter({ allTags, activeTag, onTagSelect }: TagFilterProps) {
    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-gray-400">Filter by Tag:</span>
            <button 
                onClick={() => onTagSelect(null)}
                className={`text-xs font-semibold px-2 py-1 rounded-full ${!activeTag ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
            >
                All
            </button>
            {allTags.map(tag => (
                <button 
                    key={tag}
                    onClick={() => onTagSelect(tag)}
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${activeTag === tag ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
                >
                    {tag}
                </button>
            ))}
        </div>
    );
}