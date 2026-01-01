import React, { useState, useCallback, ChangeEvent, useEffect, useRef } from 'react';
import { CompendiumData, Category, categoryDisplayNames, CompendiumItem } from './types';
import { parseCompendium, exportCompendium } from './services/xmlHelper';
import { defaultCompendiumXml } from './services/defaultData';
// FIX: Import DownloadIcon
import { BookOpenIcon, DownloadIcon, HomeIcon, TrashIcon, UploadIcon, XIcon } from './components/icons';
import { CompendiumView } from './components/Compendium';

const emptyCompendium: CompendiumData = {
  items: [], spells: [], monsters: [], classes: [], races: [], feats: [], backgrounds: [],
};

const MergeReplaceModal: React.FC<{
  onMerge: () => void;
  onReplace: () => void;
  onClose: () => void;
}> = ({ onMerge, onReplace, onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-stone-800 border-2 border-amber-800/50 rounded-lg shadow-2xl shadow-black max-w-sm w-full p-6 text-center relative">
      <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-stone-700">
        <XIcon className="w-6 h-6 text-amber-300" />
      </button>
      <h2 className="font-serif text-2xl text-amber-100 mb-4">Upload Compendium</h2>
      <p className="text-amber-300 mb-6">How would you like to add the new content?</p>
      <div className="flex justify-around gap-4">
        <button
          onClick={onMerge}
          className="px-6 py-2 w-full border border-transparent text-base font-medium rounded-md shadow-sm text-stone-900 bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-stone-800 transition-colors"
        >
          Merge
        </button>
        <button
          onClick={onReplace}
          className="px-6 py-2 w-full border border-amber-600 text-base font-medium rounded-md shadow-sm text-amber-200 bg-stone-700 hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-stone-800 transition-colors"
        >
          Replace
        </button>
      </div>
       <p className="text-xs text-stone-400 mt-4">
        <strong>Merge:</strong> Adds new items and overwrites existing items with the same name.
        <br />
        <strong>Replace:</strong> Wipes all current data and loads the new file.
      </p>
    </div>
  </div>
);


const TableOfContents: React.FC<{ data: CompendiumData, onSelectCategory: (category: Category) => void }> = ({ data, onSelectCategory }) => {
    const categories = (Object.keys(data) as Category[]).filter(key => data[key] && data[key].length > 0);

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <header className="text-center pb-6 border-b-2 border-amber-700/50">
                <h1 className="font-serif text-5xl text-amber-100">Compendium</h1>
                <p className="text-amber-300 mt-2">Select a category to begin browsing.</p>
            </header>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
                {categories.length > 0 ? categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => onSelectCategory(cat)}
                        className="p-6 bg-stone-800/50 hover:bg-stone-700/70 border border-amber-800/60 rounded-lg shadow-lg text-center transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                        <h2 className="font-serif text-2xl text-amber-200">{categoryDisplayNames[cat]}</h2>
                        <p className="text-amber-400 mt-1">{data[cat].length} entries</p>
                    </button>
                )) : (
                    <div className="col-span-full text-center py-12 text-amber-400">
                        <BookOpenIcon className="w-16 h-16 mx-auto text-amber-500/50"/>
                        <p className="mt-4 font-serif text-2xl">The Compendium is Empty</p>
                        <p className="mt-2 text-sm">Use the buttons in the footer to upload a new XML file.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [compendiumData, setCompendiumData] = useState<CompendiumData | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [modalState, setModalState] = useState<{ open: boolean; data: CompendiumData | null }>({ open: false, data: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load default data on initial render
    try {
        setCompendiumData(parseCompendium(defaultCompendiumXml));
    } catch (e) {
        console.error("Failed to load default compendium:", e);
    }
  }, []);

  const handleUpdateItem = (item: CompendiumItem, category: Category) => {
    setCompendiumData(prevData => {
        if (!prevData) return null;
        const newCategoryData = prevData[category].map(i => i.name === item.name ? item : i);
        return { ...prevData, [category]: newCategoryData };
    });
  };

  const handleDeleteItem = (itemName: string, category: Category) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}"? This cannot be undone.`)) {
        setCompendiumData(prevData => {
            if (!prevData) return null;
            const newCategoryData = prevData[category].filter(i => i.name !== itemName);
            return { ...prevData, [category]: newCategoryData };
        });
    }
  };

   const handleAddItem = (item: CompendiumItem, category: Category) => {
    setCompendiumData(prevData => {
      if (!prevData) return null;
      if (prevData[category].some(i => i.name.toLowerCase() === item.name.toLowerCase())) {
        alert('An item with this name already exists in this category.');
        return prevData;
      }
      const newCategoryData = [...prevData[category], item].sort((a, b) => a.name.localeCompare(b.name));
      return { ...prevData, [category]: newCategoryData };
    });
  };

  const handleExport = () => {
    if (compendiumData) {
        try {
            const xmlString = exportCompendium(compendiumData);
            const blob = new Blob([xmlString], { type: 'application/xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'compendium.xml';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export data:", error);
            alert("An error occurred while exporting the data.");
        }
    }
  };

  const handleWipe = () => {
    if (window.confirm("Are you sure you want to wipe the entire compendium? This action is irreversible.")) {
        setCompendiumData(emptyCompendium);
        setCurrentCategory(null);
    }
  };
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const xmlString = e.target?.result as string;
                const data = parseCompendium(xmlString);
                setModalState({ open: true, data });
            } catch (err) {
                alert('Failed to parse the XML file. Please ensure it is in the correct format.');
                console.error(err);
            }
        };
        reader.onerror = () => {
            alert('Failed to read the file.');
        };
        reader.readAsText(file);
    }
    // Reset file input
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleMerge = () => {
    if (!modalState.data) return;
    setCompendiumData(prevData => {
        if (!prevData) return modalState.data;

        const newData = { ...prevData };

        for (const category of Object.keys(modalState.data!) as Category[]) {
            const newItems = modalState.data![category];
            if (!newItems || newItems.length === 0) continue;

            // FIX: Cast to CompendiumItem[] to allow access to '.name' property.
            // TypeScript cannot infer the item type when mapping over a union of array types (e.g., Item[] | Spell[]),
            // which causes item to be of type 'unknown'.
            const existingItemsMap = new Map((newData[category] as CompendiumItem[]).map(item => [item.name.toLowerCase(), item]));
            
            (newItems as CompendiumItem[]).forEach(newItem => {
                existingItemsMap.set(newItem.name.toLowerCase(), newItem);
            });
            
            newData[category] = Array.from(existingItemsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
        }
        return newData;
    });
    setModalState({ open: false, data: null });
  };

  const handleReplace = () => {
    if (modalState.data) {
        setCompendiumData(modalState.data);
        setCurrentCategory(null);
    }
    setModalState({ open: false, data: null });
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  if (!compendiumData) {
    return (
        <div className="flex items-center justify-center h-screen text-amber-200">
            <div className="text-center">
                <BookOpenIcon className="w-24 h-24 mx-auto animate-pulse"/>
                <p className="font-serif text-2xl mt-4">Loading Compendium...</p>
            </div>
        </div>
    );
  }
  
  const commonFooter = (
      <footer className="sticky bottom-0 bg-stone-900/80 backdrop-blur-sm p-2 flex justify-center items-center gap-4 rounded-b-lg border-t border-amber-800/50">
        <input id="file-upload" type="file" accept=".xml" className="sr-only" onChange={handleFileChange} ref={fileInputRef} />
        <button onClick={handleWipe} className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-red-900/50 hover:bg-red-800/50 text-red-200 border border-red-700/70 transition-colors">
            <TrashIcon className="w-4 h-4" /> Wipe
        </button>
        <button onClick={triggerFileUpload} className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-amber-600/50 hover:bg-amber-500/50 text-amber-100 border border-amber-600/70 transition-colors">
            <UploadIcon className="w-4 h-4" /> Upload XML
        </button>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-stone-700/80 hover:bg-stone-600/80 text-amber-200 border border-amber-800/70 transition-colors">
            <DownloadIcon className="w-4 h-4" /> Export XML
        </button>
    </footer>
  );

  return (
    <>
      {modalState.open && <MergeReplaceModal onMerge={handleMerge} onReplace={handleReplace} onClose={() => setModalState({open: false, data: null})} />}
      <div className="max-w-7xl mx-auto my-4 sm:my-8 bg-stone-900/70 backdrop-blur-sm shadow-2xl shadow-black border-2 border-amber-900/50 rounded-lg text-amber-50 font-sans min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-4rem)] flex flex-col">
          {currentCategory ? (
              <CompendiumView 
                  key={currentCategory + compendiumData[currentCategory].length}
                  category={currentCategory} 
                  data={compendiumData[currentCategory]}
                  onBack={() => setCurrentCategory(null)}
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem}
                  onAddItem={handleAddItem}
                  footer={commonFooter}
              />
          ) : (
              <div className="flex flex-col flex-grow">
                  <div className="flex-grow">
                    <TableOfContents data={compendiumData} onSelectCategory={setCurrentCategory} />
                  </div>
                  {commonFooter}
              </div>
          )}
      </div>
    </>
  );
};

export default App;