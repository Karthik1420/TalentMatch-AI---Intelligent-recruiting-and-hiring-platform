import React, { useState, useEffect, useRef } from 'react';
import { Check, Plus, X } from 'lucide-react';

const CreatableSelect = ({ 
    options, 
    value, 
    onChange, 
    onCreateOption, 
    placeholder = "Select or type...",
    name,
    isMulti = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef(null);

    // Get selected option label(s)
    let displayValue = '';
    let selectedOptions = [];
    if (isMulti) {
        const valArray = Array.isArray(value) ? value : [];
        selectedOptions = options.filter(opt => valArray.includes(opt.id));
    } else {
        const selectedOption = options.find(opt => opt.id === value);
        displayValue = selectedOption ? selectedOption.name : '';
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => 
        opt.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (id) => {
        if (isMulti) {
            const valArray = Array.isArray(value) ? value : [];
            let newValue;
            if (valArray.includes(id)) {
                newValue = valArray.filter(v => v !== id);
            } else {
                newValue = [...valArray, id];
            }
            onChange({ target: { name, value: newValue } });
            // Don't close on multi select
        } else {
            onChange({ target: { name, value: id } });
            setIsOpen(false);
        }
        setSearch('');
    };

    const handleCreate = async () => {
        if (!search.trim()) return;
        const newId = await onCreateOption(search.trim(), name);
        if (newId) {
            if (isMulti) {
                const valArray = Array.isArray(value) ? value : [];
                onChange({ target: { name, value: [...valArray, newId] } });
            }
        }
        if (!isMulti) setIsOpen(false);
        setSearch('');
    };

    const removeTag = (e, id) => {
        e.stopPropagation();
        const valArray = Array.isArray(value) ? value : [];
        onChange({ target: { name, value: valArray.filter(v => v !== id) } });
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full min-h-[42px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm cursor-pointer flex flex-wrap gap-2 items-center"
            >
                {isMulti ? (
                    selectedOptions.length > 0 ? (
                        selectedOptions.map(opt => (
                            <span key={opt.id} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-1 rounded-md text-xs font-medium">
                                {opt.name}
                                <X className="w-3 h-3 cursor-pointer hover:text-indigo-900 dark:hover:text-indigo-100" onClick={(e) => removeTag(e, opt.id)} />
                            </span>
                        ))
                    ) : (
                        <span className="text-slate-400">{placeholder}</span>
                    )
                ) : (
                    <span className={displayValue ? "text-slate-900 dark:text-white" : "text-slate-400"}>
                        {displayValue || placeholder}
                    </span>
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 z-10">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                            placeholder="Type to search..."
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>
                    <ul className="py-1 relative z-0">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => {
                                const isSelected = isMulti ? (Array.isArray(value) && value.includes(opt.id)) : (value === opt.id);
                                return (
                                    <li 
                                        key={opt.id}
                                        onClick={() => handleSelect(opt.id)}
                                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between
                                            ${isSelected ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}
                                        `}
                                    >
                                        {opt.name}
                                        {isSelected && <Check className="w-4 h-4" />}
                                    </li>
                                );
                            })
                        ) : (
                            search.trim() ? (
                                <li 
                                    onClick={handleCreate}
                                    className="px-4 py-2 text-sm cursor-pointer text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add "{search}"
                                </li>
                            ) : (
                                <li className="px-4 py-2 text-sm text-slate-500 text-center">
                                    No options found
                                </li>
                            )
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CreatableSelect;
