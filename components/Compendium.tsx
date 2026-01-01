import React, { useState, useMemo, useEffect } from 'react';
import { CompendiumItem, Category, categoryDisplayNames } from '../types';
import { SearchIcon, HomeIcon, PlusIcon } from './icons';
import { DetailCard } from './DetailCards';

const Sidebar: React.FC<{
    items: CompendiumItem[],
    selectedItem: CompendiumItem | null,
    onSelectItem: (item: CompendiumItem) => void,
}> = ({ items, selectedItem, onSelectItem }) => {
    return (
        <aside className="h-full overflow-y-auto bg-stone-900/30 md:rounded-l-lg border-b md:border-b-0 md:border-r border-amber-800/50">
            <ul className="divide-y divide-amber-900/30">
                {items.map(item => (
                    <li key={item.name}>
                        <button
                            onClick={() => onSelectItem(item)}
                            className={`w-full text-left p-3 text-sm transition-colors duration-200 ${
                                selectedItem?.name === item.name
                                ? 'bg-amber-800/50 text-amber-50'
                                : 'text-amber-200 hover:bg-amber-900/40'
                            }`}
                        >
                            {item.name}
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export const CompendiumView: React.FC<{
    category: Category;
    data: CompendiumItem[];
    onBack: () => void;
    onUpdateItem: (item: CompendiumItem, category: Category) => void;
    onDeleteItem: (itemName: string, category: Category) => void;
    onAddItem: (item: CompendiumItem, category: Category) => void;
    footer: React.ReactNode;
}> = ({ category, data, onBack, onUpdateItem, onDeleteItem, onAddItem, footer }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<CompendiumItem | null>(data[0] || null);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return data;
        const lowercasedTerm = searchTerm.toLowerCase();
        return data.filter(item => 
            item.name.toLowerCase().includes(lowercasedTerm) ||
            (item.text && item.text.toLowerCase().includes(lowercasedTerm))
        );
    }, [data, searchTerm]);
    
    useEffect(() => {
        // When the search term filters the list, ensure the selection is valid.
        // If the selected item is no longer in the list, select the first one.
        // If the list becomes empty, clear the selection.
        if (filteredItems.length > 0) {
            const isSelectedInList = filteredItems.some(item => item.name === selectedItem?.name);
            if (!isSelectedInList) {
                setSelectedItem(filteredItems[0]);
            }
        } else {
            setSelectedItem(null);
        }
    }, [filteredItems, selectedItem]);

    const handleSelectItem = (item: CompendiumItem) => {
        setSelectedItem(item);
    }
    
    const handleDelete = () => {
        if (selectedItem) {
            onDeleteItem(selectedItem.name, category);
            const currentIndex = filteredItems.findIndex(i => i.name === selectedItem.name);
            setSelectedItem(filteredItems[currentIndex - 1] || filteredItems[0] || null);
        }
    };

    return (
        <div className="flex flex-col flex-grow">
            <header className="flex items-center p-3 border-b border-amber-800/50 flex-shrink-0">
                <button onClick={onBack} title="Table of Contents" className="p-2 rounded-full hover:bg-amber-900/50 transition-colors">
                    <HomeIcon className="w-6 h-6 text-amber-300" />
                </button>
                <h1 className="font-serif text-3xl text-amber-100 mx-4">{categoryDisplayNames[category]}</h1>
                <div className="relative flex-grow ml-auto max-w-xs">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-stone-800/60 border border-amber-800/50 rounded-full py-2 pl-10 pr-4 text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </div>
                 <button onClick={() => alert('Add new item functionality coming soon!')} title="Add New" className="ml-4 p-2 rounded-full hover:bg-amber-900/50 transition-colors">
                    <PlusIcon className="w-6 h-6 text-amber-300" />
                </button>
            </header>
            
            <main className="flex-grow md:grid md:grid-cols-12 overflow-hidden">
                <div className="md:col-span-4 lg:col-span-3 h-full overflow-hidden">
                    <Sidebar items={filteredItems} selectedItem={selectedItem} onSelectItem={handleSelectItem} />
                </div>
                <div className="md:col-span-8 lg:col-span-9 h-[calc(100vh-265px)] md:h-full overflow-y-auto p-4 sm:p-6">
                    {selectedItem ? (
                        <DetailCard item={selectedItem} category={category} onDelete={handleDelete}/>
                    ) : (
                        <div className="flex items-center justify-center h-full text-center">
                            <div>
                                <h2 className="font-serif text-2xl text-amber-300">
                                    {data.length > 0 ? 'No Item Selected' : `No ${categoryDisplayNames[category]} Found`}
                                </h2>
                                <p className="text-amber-400 mt-2">
                                    {filteredItems.length > 0 ? 'Select an item from the list to view its details.' : 'No items match your search.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {footer}
        </div>
    );
};