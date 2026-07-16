import React, { useState, useEffect } from 'react';
import candidateApi from '../../../api/candidateApi';
import JobFilters from './JobFilters';
import JobCard from './JobCard';
import JobDetailsModal from './JobDetailsModal';
import { Briefcase } from 'lucide-react';

const JobMatches = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.all([
        candidateApi.getJobs(filters),
        candidateApi.getApplications()
      ]);
      setJobs(jobsRes.data);
      setApplications(appsRes.data);
    } catch (err) {
      console.error("Error fetching jobs/applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce fetching if needed, but for simplicity we fetch on filter change
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const getApplicationStatus = (jobId) => {
    const app = applications.find(a => a.job_id === jobId);
    return app ? app.status : null;
  };

  const handleApplied = (jobId) => {
    // Re-fetch applications so the status updates on the card
    candidateApi.getApplications().then(res => setApplications(res.data));
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Briefcase className="w-8 h-8" />
            Job Matches
          </h1>
          <p className="text-blue-100 max-w-xl">
            Discover roles that match your skills. Apply with a single click using your Antigravity profile.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      <JobFilters filters={filters} onFilterChange={setFilters} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse p-6">
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <Briefcase className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No jobs found</h3>
          <p className="text-slate-500 dark:text-slate-400">
            Try adjusting your search filters to find more opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              onViewMore={setSelectedJob}
              applicationStatus={getApplicationStatus(job.id)}
            />
          ))}
        </div>
      )}

      {selectedJob && (
        <JobDetailsModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)}
          applicationStatus={getApplicationStatus(selectedJob.id)}
          onApplied={handleApplied}
        />
      )}
    </div>
  );
};

export default JobMatches;
