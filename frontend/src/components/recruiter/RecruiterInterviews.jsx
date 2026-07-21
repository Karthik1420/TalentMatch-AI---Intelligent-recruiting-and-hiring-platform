import React, { useState, useEffect } from 'react';
import { Calendar, Video, Clock, User, Briefcase, ExternalLink, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const RecruiterInterviews = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInterviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://talentmatch-ai-intelligent-recruiting.onrender.com') + '/recruiter/interviews', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setInterviews(data);
      } else {
        setError('Failed to fetch interviews');
      }
    } catch (e) {
      setError('An error occurred while fetching interviews');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchInterviews();
    }
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2"><RefreshCw className="w-6 h-6 animate-spin"/> Loading interviews...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-500"/> Scheduled Interviews
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your upcoming and past candidate interviews</p>
        </div>
        <button onClick={fetchInterviews} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Refresh">
          <RefreshCw className="w-5 h-5"/>
        </button>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
            <Calendar className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">No Interviews Scheduled</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You haven't scheduled any interviews yet. When you move an application to the "Interview" stage, you can schedule one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((interview) => (
            <div key={interview.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent -mr-12 -mt-12 rounded-full transition-transform group-hover:scale-150"></div>
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg">
                  <Calendar className="w-5 h-5"/>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${new Date(interview.scheduled_time) > new Date() ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}>
                  {new Date(interview.scheduled_time) > new Date() ? 'Upcoming' : 'Completed'}
                </span>
              </div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                  <User className="w-4 h-4 text-slate-400"/>
                  {interview.candidate_name}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Briefcase className="w-4 h-4"/>
                  {interview.job_title}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4"/>
                  {format(new Date(interview.scheduled_time + 'Z'), 'PPp')} ({interview.duration_minutes} mins)
                </div>

                {interview.meet_link && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                    <a href={interview.meet_link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium transition-colors">
                      <Video className="w-4 h-4"/> Join Google Meet
                      <ExternalLink className="w-3 h-3 ml-1"/>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterInterviews;
