import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, User, MessageSquare, Check, X, Clock, ChevronDown, Eye } from 'lucide-react';
import CandidatePortfolio from '../candidate/Portfolio/CandidatePortfolio';

const STATUS_COLORS = {
  Applied: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Screened: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Interview: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Hired: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

const RecruiterApplications = ({ jobId, jobTitle, onBack }) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the status update modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');

  // State for Candidate Portfolio Modal
  const [viewingApp, setViewingApp] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await fetch(`http://localhost:8000/recruiter/jobs/${jobId}/applications`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const handleStatusChangeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp || !newStatus) return;
    
    try {
      const res = await fetch(`http://localhost:8000/recruiter/applications/${selectedApp.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          status: newStatus,
          comment: comment || null
        })
      });
      if (res.ok) {
        // close modal and refresh
        setSelectedApp(null);
        setNewStatus('');
        setComment('');
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewProfile = async (app) => {
    setViewingApp(app);
    setLoadingPortfolio(true);
    setPortfolioData(null);
    try {
      const res = await fetch(`http://localhost:8000/recruiter/candidates/${app.candidate_id}/portfolio`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPortfolioData(data);
      } else {
        alert("Could not load candidate portfolio");
        setViewingApp(null);
      }
    } catch (e) {
      console.error(e);
      alert("Error loading portfolio");
      setViewingApp(null);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading applications...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Applications</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">For <span className="font-semibold text-indigo-600 dark:text-indigo-400">{jobTitle}</span></p>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {applications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            No applications received yet for this position.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {applications.map(app => (
              <div key={app.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {app.candidate?.candidate_profile?.first_name 
                        ? `${app.candidate.candidate_profile.first_name} ${app.candidate.candidate_profile.last_name}`
                        : `Candidate #${app.candidate_id}`}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5" /> Applied on {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status] || STATUS_COLORS.Applied}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleViewProfile(app)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" /> <span className="hidden sm:inline">Profile</span>
                  </button>
                  <select 
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedApp(app);
                        setNewStatus(e.target.value);
                      }
                    }}
                  >
                    <option value="" disabled>Change Status...</option>
                    <option value="Applied">Revert to Applied</option>
                    <option value="Screened">Move to Screened</option>
                    <option value="Interview">Move to Interview</option>
                    <option value="Hired">Mark as Hired</option>
                    <option value="Rejected">Mark as Rejected</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Update Status</h3>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleStatusChangeSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Moving Candidate #{selectedApp.candidate_id} from <strong className="text-slate-900 dark:text-white">{selectedApp.status}</strong> to <strong className="text-indigo-600 dark:text-indigo-400">{newStatus}</strong>.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4"/> Add a comment (Optional)
                </label>
                <textarea 
                  rows="3" 
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="e.g. Cleared the technical round with strong SQL knowledge."
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setSelectedApp(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                  <Check className="w-4 h-4" /> Confirm Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Profile Modal */}
      {viewingApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8">
          <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl w-full max-w-5xl h-full max-h-[90vh] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5" /> Candidate #{viewingApp.candidate_id} Profile
              </h3>
              <button onClick={() => setViewingApp(null)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-6 h-6"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {loadingPortfolio ? (
                <div className="flex items-center justify-center h-full text-slate-500">Loading profile data...</div>
              ) : portfolioData ? (
                <CandidatePortfolio data={portfolioData} readOnly={true} />
              ) : (
                <div className="flex items-center justify-center h-full text-red-500">Failed to load data</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterApplications;
