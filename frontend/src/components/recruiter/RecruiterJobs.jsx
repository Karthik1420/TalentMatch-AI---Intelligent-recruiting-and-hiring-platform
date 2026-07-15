import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Briefcase, MapPin, DollarSign, Clock, Users } from 'lucide-react';

const RecruiterJobs = ({ onViewApplications }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    employment_type: 'Full-Time',
    work_mode: 'Remote',
    location_city: '',
    salary_min: '',
    salary_max: '',
    description: ''
  });

  const fetchJobs = async () => {
    try {
      const res = await fetch('http://localhost:8000/recruiter/jobs', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/recruiter/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          ...formData,
          salary_min: parseFloat(formData.salary_min) || null,
          salary_max: parseFloat(formData.salary_max) || null,
        })
      });
      if (res.ok) {
        setIsCreating(false);
        fetchJobs();
        // reset form
        setFormData({
          title: '', employment_type: 'Full-Time', work_mode: 'Remote', location_city: '', salary_min: '', salary_max: '', description: ''
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading jobs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Postings</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your company's open positions</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {isCreating ? 'Cancel' : 'Post New Job'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateJob} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Create Job Posting</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Job Title</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Senior Software Engineer" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location (City)</label>
              <input type="text" value={formData.location_city} onChange={e => setFormData({...formData, location_city: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" placeholder="e.g. San Francisco" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employment Type</label>
              <select value={formData.employment_type} onChange={e => setFormData({...formData, employment_type: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Work Mode</label>
              <select value={formData.work_mode} onChange={e => setFormData({...formData, work_mode: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Min Salary</label>
              <input type="number" value={formData.salary_min} onChange={e => setFormData({...formData, salary_min: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 100000" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Salary</label>
              <input type="number" value={formData.salary_max} onChange={e => setFormData({...formData, salary_max: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 150000" />
            </div>
          </div>
          <div className="space-y-1 pt-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Job Description</label>
            <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" placeholder="Describe the role..."></textarea>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
              Publish Job
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {jobs.length === 0 && !isCreating && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400">
            No jobs posted yet. Click "Post New Job" to get started.
          </div>
        )}
        {jobs.map(job => (
          <div key={job.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{job.title}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.employment_type}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.work_mode} {job.location_city ? `- ${job.location_city}` : ''}</span>
                {(job.salary_min || job.salary_max) && (
                  <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {job.salary_min && `$${job.salary_min.toLocaleString()}`}{job.salary_max ? ` - $${job.salary_max.toLocaleString()}` : ''}</span>
                )}
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium">
                  {job.status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onViewApplications(job.id, job.title)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium transition-colors"
              >
                <Users className="w-4 h-4" /> View Applications
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruiterJobs;
