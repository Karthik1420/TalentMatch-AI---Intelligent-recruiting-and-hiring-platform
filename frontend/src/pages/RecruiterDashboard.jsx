import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, Moon, Sun, Menu, X, 
  Search, Briefcase, Users, UserPlus
} from 'lucide-react';
import logo from '../assets/logo.png';

const RecruiterDashboard = () => {
  const { logout, user } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
           (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('candidates');

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
          <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-semibold text-lg tracking-tight">TalentMatch AI</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button onClick={() => setActiveTab('candidates')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'candidates' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}>
            <Users className="w-4 h-4" /> Candidate Search
          </button>
          <button onClick={() => setActiveTab('jobs')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'jobs' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}>
            <Briefcase className="w-4 h-4" /> Job Postings
          </button>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        
        {/* Navbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold hidden sm:block">
              {activeTab === 'candidates' && 'Find Candidates'}
              {activeTab === 'jobs' && 'Manage Jobs'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Toggle Dark Mode">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-sm font-bold">
                R
              </div>
              <span className="text-sm font-medium">Recruiter</span>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40" />
              <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }} className="md:hidden fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl">
                <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="font-semibold text-lg">TalentMatch AI</span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X className="w-5 h-5" /></button>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  <button onClick={() => { setActiveTab('candidates'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'candidates' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}><Users className="w-4 h-4" /> Candidate Search</button>
                  <button onClick={() => { setActiveTab('jobs'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'jobs' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}><Briefcase className="w-4 h-4" /> Job Postings</button>
                </nav>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                  <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"><LogOut className="w-4 h-4" /> Logout</button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            
            <AnimatePresence mode="wait">
              {activeTab === 'candidates' && (
                <motion.div key="candidates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Recruiter Tools</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">You are logged in as Recruiter <span className="font-semibold text-indigo-600 dark:text-indigo-400">#{user?.id}</span></p>
                    </div>
                    <div className="p-12 text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                        <Search className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Candidate Search Coming Soon</h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                        We are building a powerful AI search engine to help you find the perfect candidates across our talent pool.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'jobs' && (
                <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                      <Briefcase className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Job Postings Module</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Soon you will be able to create, manage, and track job postings to attract top talent.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>
      </div>

    </div>
  );
};

export default RecruiterDashboard;
