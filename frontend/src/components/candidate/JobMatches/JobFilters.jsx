import React from 'react';
import { Search, Filter } from 'lucide-react';

const JobFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 mb-8 shadow-sm">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Job Title..."
          value={filters.title || ''}
          onChange={(e) => onFilterChange({ ...filters, title: e.target.value })}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
        />
      </div>
      
      <div className="flex gap-4">
        <select
          value={filters.employment_type || ''}
          onChange={(e) => onFilterChange({ ...filters, employment_type: e.target.value })}
          className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white min-w-[150px]"
        >
          <option value="">Any Type</option>
          <option value="Full-Time">Full-Time</option>
          <option value="Part-Time">Part-Time</option>
          <option value="Internship">Internship</option>
          <option value="Contract">Contract</option>
          <option value="Freelance">Freelance</option>
        </select>
        
        <input
          type="text"
          placeholder="Location (City/State)..."
          value={filters.location || ''}
          onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
          className="w-full md:w-auto px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
        />
      </div>
    </div>
  );
};

export default JobFilters;
