import React from 'react';
import { MapPin, Briefcase, IndianRupee, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const JobCard = ({ job, onViewMore, applicationStatus }) => {
  const isApplied = !!applicationStatus;
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full transition-all hover:shadow-lg hover:border-blue-500/30">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {job.company?.logo_url ? (
            <img src={job.company.logo_url} alt={job.company.name} className="w-12 h-12 rounded-lg object-contain bg-slate-50 dark:bg-slate-800" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
              {job.company?.name?.charAt(0) || 'C'}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1">
              {job.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {job.company?.name}
            </p>
          </div>
        </div>
        {isApplied && (
          <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 rounded-full">
            {applicationStatus}
          </span>
        )}
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{job.location_city || 'Remote'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-4 h-4" />
          <span className="truncate">{job.employment_type}</span>
        </div>
        {(job.salary_min || job.salary_max) && (
          <div className="flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4" />
            <span className="truncate">
              {job.salary_min ? `${job.salary_min / 100000}L` : ''} 
              {job.salary_max ? ` - ${job.salary_max / 100000}L` : ''}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span className="truncate">{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Skills Preview */}
      {job.required_skills && job.required_skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 mt-auto">
          {job.required_skills.slice(0, 4).map((req, idx) => (
            <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs">
              {req.skill?.name}
            </span>
          ))}
          {job.required_skills.length > 4 && (
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs">
              +{job.required_skills.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Preview text */}
      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-5">
        {job.description || "No description provided."}
      </p>

      {/* Action */}
      <div className="mt-auto">
        <button
          onClick={() => onViewMore(job)}
          className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors text-sm"
        >
          View More
        </button>
      </div>
    </div>
  );
};

export default JobCard;
