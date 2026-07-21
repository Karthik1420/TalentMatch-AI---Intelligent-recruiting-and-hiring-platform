import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Atom, Briefcase, ChevronRight, RefreshCw, AlertCircle, FileText, CheckCircle2, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ResumeAnalyzer = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  
  const [selectedJob, setSelectedJob] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://talentmatch-ai-intelligent-recruiting.onrender.com') + '/candidate/applications', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (e) {
      console.error("Failed to fetch apps", e);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleAnalyze = async (jobId, jobTitle) => {
    setSelectedJob({ id: jobId, title: jobTitle });
    setAnalysisData(null);
    setError(null);
    setLoadingAnalysis(true);
    
    try {
      const res = await fetch(`${(import.meta.env.VITE_API_URL || 'https://talentmatch-ai-intelligent-recruiting.onrender.com')}/candidate/jobs/${jobId}/analyze-resume`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAnalysisData(data);
      } else {
        const errData = await res.json();
        setError(errData.detail || "Failed to analyze resume.");
      }
    } catch (e) {
      setError("An unexpected error occurred.");
      console.error(e);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  if (loadingApps) {
    return <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2"><RefreshCw className="w-6 h-6 animate-spin"/> Loading your applications...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Atom className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Resume Match Analyzer</h2>
            <p className="text-indigo-100 max-w-2xl text-sm leading-relaxed">
              Wondering why you didn't get shortlisted, or want to know what the top candidate had that you didn't? 
              Select a job you've applied for, and our AI will compare your profile against the highest-scoring candidate (or the Job Description itself) to give you actionable insights.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Jobs List sidebar */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col max-h-[600px]">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-500" /> Your Applications
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {applications.length === 0 ? (
              <p className="text-sm text-slate-500 p-4 text-center">You haven't applied to any jobs yet.</p>
            ) : (
              applications.map(app => (
                <button
                  key={app.id}
                  onClick={() => handleAnalyze(app.job_id, app.job_title)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${selectedJob?.id === app.job_id ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-sm' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={`font-semibold text-sm truncate pr-2 ${selectedJob?.id === app.job_id ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                      {app.job_title}
                    </h4>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${selectedJob?.id === app.job_id ? 'text-indigo-500' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{app.company_name}</span>
                    <span className="capitalize px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">{app.status}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Analysis Result Area */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm min-h-[400px] flex flex-col">
          {!selectedJob ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Select a job to analyze</h3>
              <p className="max-w-sm text-sm">Choose an application from the list to see how your profile stacks up against the competition.</p>
            </div>
          ) : loadingAnalysis ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900/50 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                <Atom className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mt-6 mb-2">AI is analyzing profiles...</h3>
              <p className="text-slate-500 text-sm max-w-sm">Comparing your skills and experience against the top candidate for {selectedJob.title}.</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Analysis Failed</h3>
              <p className="text-slate-500 text-sm">{error}</p>
              <button onClick={() => handleAnalyze(selectedJob.id, selectedJob.title)} className="mt-6 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-sm font-medium transition-colors">
                Try Again
              </button>
            </div>
          ) : analysisData ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedJob.title}</h3>
                  {analysisData.top_candidate_score ? (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 text-xs font-bold rounded-full border border-purple-200 dark:border-purple-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Top ATS Score: {analysisData.top_candidate_score}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-xs font-medium rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> No other candidates yet
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">Comparative Analysis Report</p>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto prose prose-slate dark:prose-invert prose-indigo max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:leading-relaxed prose-li:my-1">
                <ReactMarkdown>{analysisData.analysis_markdown}</ReactMarkdown>
              </div>
            </div>
          ) : null}
        </div>
        
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
