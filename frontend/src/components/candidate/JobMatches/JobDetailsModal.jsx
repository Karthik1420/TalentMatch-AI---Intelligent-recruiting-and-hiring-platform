import React, { useState } from 'react';
import { X, MapPin, Briefcase, IndianRupee, Clock, CheckCircle } from 'lucide-react';
import candidateApi from '../../../api/candidateApi';

const JobDetailsModal = ({ job, onClose, applicationStatus, onApplied }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState(null);

  const handleApply = async () => {
    try {
      setIsApplying(true);
      setError(null);
      await candidateApi.applyForJob(job.id);
      onApplied(job.id); // Triggers success notification and status update
    } catch (err) {
      console.error("Apply Error:", err);
      setError(err.response?.data?.detail || "Failed to apply for the job.");
    } finally {
      setIsApplying(false);
    }
  };

  const isAlreadyApplied = !!applicationStatus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            {job.company?.logo_url ? (
              <img src={job.company.logo_url} alt={job.company.name} className="w-16 h-16 rounded-lg object-contain bg-slate-50 dark:bg-slate-800" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-2xl">
                {job.company?.name?.charAt(0) || 'C'}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {job.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                {job.company?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 uppercase font-medium">Location</span>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>{job.location_city || 'Remote'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 uppercase font-medium">Type</span>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                <Briefcase className="w-4 h-4 text-blue-500" />
                <span>{job.employment_type}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 uppercase font-medium">Salary</span>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                <IndianRupee className="w-4 h-4 text-blue-500" />
                <span>
                  {job.salary_min ? `${job.salary_min / 100000}L` : 'NA'} 
                  {job.salary_max ? ` - ${job.salary_max / 100000}L` : ''}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 uppercase font-medium">Vacancies</span>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>{job.vacancies || 1}</span>
              </div>
            </div>
          </div>

          {/* Description Sections */}
          <div className="space-y-6">
            {job.description && (
              <section>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">About the Role</h3>
                <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </div>
              </section>
            )}

            {job.responsibilities && (
              <section>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Responsibilities</h3>
                <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {job.responsibilities}
                </div>
              </section>
            )}

            {job.requirements && (
              <section>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Qualifications & Requirements</h3>
                <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {job.requirements}
                </div>
              </section>
            )}

            {job.preferred_qualifications && (
              <section>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Preferred Qualifications</h3>
                <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {job.preferred_qualifications}
                </div>
              </section>
            )}
            
            {job.benefits && (
              <section>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Benefits</h3>
                <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {job.benefits}
                </div>
              </section>
            )}

            {job.required_skills && job.required_skills.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((req, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-800/50">
                      {req.skill?.name}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            {error ? <span className="text-red-500">{error}</span> : "Your full profile will be submitted securely."}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleApply}
              disabled={isApplying || isAlreadyApplied}
              className={`flex-1 sm:flex-none px-8 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg ${
                isAlreadyApplied
                  ? "bg-green-500 text-white shadow-green-500/25 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 hover:shadow-blue-500/40"
              }`}
            >
              {isApplying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Applying...
                </>
              ) : isAlreadyApplied ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Applied
                </>
              ) : (
                "Apply Now"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
