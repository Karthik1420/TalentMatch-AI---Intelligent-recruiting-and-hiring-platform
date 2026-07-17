import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Plus, LogOut, Moon, Sun, Menu, X, 
  MapPin, Trash2, Edit, CheckCircle2, XCircle, 
  Users, Briefcase, Building, ChevronRight, Shield
} from 'lucide-react';
import logo from '../assets/logo.png';

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <input 
      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200"
      {...props}
    />
  </div>
);

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  
  // UI States
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
           (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create_company' | 'view_company'

  // Data States
  const [companies, setCompanies] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  
  // Modals for Deletion
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'company' | 'recruiter', id: number }
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  // Form States
  const [companyForm, setCompanyForm] = useState({
    name: '', industry: '', website: '', city: '', country: '',
    company_size: '', headquarters: '', founded_year: '', description: '',
    mission: '', culture: '', linkedin_url: '', facebook_url: '', twitter_url: ''
  });
  
  const [recruiterForm, setRecruiterForm] = useState({
    email: '', password: '', designation: '', department: '', phone: '', linkedin_url: ''
  });

  const [editingRecruiter, setEditingRecruiter] = useState(null);
  
  // Feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const api = axios.create({
    baseURL: 'https://talentmatch-ai-intelligent-recruiting.onrender.com',
    headers: { Authorization: `Bearer ${user?.token}` }
  });

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies');
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecruiters = async (companyId) => {
    try {
      const res = await api.get(`/admin/company/${companyId}/recruiters`);
      setRecruiters(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      let logo_url = null;
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        const uploadRes = await api.post('/admin/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        logo_url = uploadRes.data.url;
      }

      const payload = { ...companyForm };
      if (logo_url) payload.logo_url = logo_url;
      if (payload.founded_year) payload.founded_year = parseInt(payload.founded_year);

      await api.post('/admin/company', payload);
      setSuccess('Company created successfully!');
      setCompanyForm({ 
        name: '', industry: '', website: '', city: '', country: '',
        company_size: '', headquarters: '', founded_year: '', description: '',
        mission: '', culture: '', linkedin_url: '', facebook_url: '', twitter_url: ''
      });
      setLogoFile(null);
      fetchCompanies();
      setTimeout(() => { setActiveTab('list'); setSuccess(''); }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create company');
    }
  };

  const handleCreateRecruiter = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/admin/recruiter', { ...recruiterForm, company_id: selectedCompany.id });
      setSuccess('Recruiter credentials generated successfully!');
      setRecruiterForm({ email: '', password: '', designation: '', department: '', phone: '', linkedin_url: '' });
      fetchRecruiters(selectedCompany.id); // Refresh list
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create recruiter');
    }
  };

  const handleEditRecruiterSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.put(`/admin/recruiter/${editingRecruiter.id}`, editingRecruiter);
      setSuccess('Recruiter updated successfully!');
      setEditingRecruiter(null);
      fetchRecruiters(selectedCompany.id); // Refresh list
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update recruiter');
    }
  };

  const handleToggleRecruiter = async (recruiterId) => {
    setError(''); setSuccess('');
    try {
      await api.patch(`/admin/recruiter/${recruiterId}/toggle-active`);
      fetchRecruiters(selectedCompany.id);
    } catch (err) {
      setError('Failed to toggle active status');
    }
  };

  const executeDelete = async (e) => {
    e.preventDefault();
    setDeleteError('');
    try {
      if (deleteTarget.type === 'company') {
        await api.post(`/admin/company/${deleteTarget.id}/delete`, { password: adminPassword });
        setSuccess('Company deleted successfully');
        setActiveTab('list');
        fetchCompanies();
        setTimeout(() => setSuccess(''), 3000);
      } else if (deleteTarget.type === 'recruiter') {
        await api.post(`/admin/recruiter/${deleteTarget.id}/delete`, { password: adminPassword });
        setSuccess('Recruiter deleted successfully');
        fetchRecruiters(selectedCompany.id);
        setTimeout(() => setSuccess(''), 3000);
      }
      setDeleteTarget(null);
      setAdminPassword('');
    } catch (err) {
      setDeleteError(err.response?.data?.detail || 'Incorrect password or delete failed');
    }
  };

  const openCompanyView = (company) => {
    setSelectedCompany(company);
    setActiveTab('view_company');
    setError(''); setSuccess('');
    fetchRecruiters(company.id);
  };



  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-200">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
          <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-semibold text-lg tracking-tight">TalentMatch AI</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button 
            onClick={() => { setActiveTab('list'); setError(''); setSuccess(''); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <Building2 className="w-4 h-4" />
            Manage Companies
          </button>
          <button 
            onClick={() => { setActiveTab('create_company'); setError(''); setSuccess(''); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'create_company' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <Plus className="w-4 h-4" />
            Register Company
          </button>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        
        {/* Navbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold hidden sm:block">
              {activeTab === 'list' && 'Companies'}
              {activeTab === 'create_company' && 'New Company'}
              {activeTab === 'view_company' && 'Company Details'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-sm font-bold">
                A
              </div>
              <span className="text-sm font-medium">Admin</span>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40" 
              />
              <motion.aside 
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="md:hidden fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl"
              >
                <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="font-semibold text-lg">TalentMatch AI</span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                  <button onClick={() => { setActiveTab('list'); setIsSidebarOpen(false); setError(''); setSuccess(''); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'list' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}><Building2 className="w-4 h-4" /> Manage Companies</button>
                  <button onClick={() => { setActiveTab('create_company'); setIsSidebarOpen(false); setError(''); setSuccess(''); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'create_company' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}><Plus className="w-4 h-4" /> Register Company</button>
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
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Global Alerts */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl flex items-center gap-3 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* LIST TAB */}
              {activeTab === 'list' && (
                <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  {loading ? (
                    <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                  ) : companies.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                      <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No Companies Found</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Get started by registering a new company.</p>
                      <button onClick={() => setActiveTab('create_company')} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                        <Plus className="w-4 h-4" /> Register Company
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {companies.map(c => (
                        <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col group relative overflow-hidden">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-2">
                              {c.logo_url ? <img src={c.logo_url} alt="Logo" className="w-full h-full object-contain" /> : <Building className="w-6 h-6 text-slate-400" />}
                            </div>
                            <button onClick={() => openCompanyView(c)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg">
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 truncate">{c.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                            <Briefcase className="w-4 h-4 shrink-0" />
                            <span className="truncate">{c.industry || 'General'}</span>
                            <span>•</span>
                            <span className="truncate">{c.headquarters || c.city || 'Remote'}</span>
                          </div>
                          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button onClick={() => openCompanyView(c)} className="w-full text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                              Manage Recruiters
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* CREATE COMPANY TAB */}
              {activeTab === 'create_company' && (
                <motion.div key="create" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-semibold">Register New Company</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter the details of the company to onboard them to TalentMatch AI.</p>
                  </div>
                  <form onSubmit={handleCreateCompany} className="p-6 sm:p-8 space-y-8">
                    
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Company Name *" required value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} placeholder="e.g. Acme Corp" />
                        <Input label="Industry" value={companyForm.industry} onChange={e => setCompanyForm({...companyForm, industry: e.target.value})} placeholder="e.g. Software Development" />
                        <Input label="Company Size" value={companyForm.company_size} onChange={e => setCompanyForm({...companyForm, company_size: e.target.value})} placeholder="e.g. 50-200" />
                        <Input label="Founded Year" type="number" value={companyForm.founded_year} onChange={e => setCompanyForm({...companyForm, founded_year: e.target.value})} placeholder="e.g. 2010" />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Brand & Online Presence</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Logo</label>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400 dark:hover:file:bg-indigo-900/50 transition-colors" />
                            </div>
                          </div>
                        </div>
                        <Input label="Website" type="url" value={companyForm.website} onChange={e => setCompanyForm({...companyForm, website: e.target.value})} placeholder="https://example.com" />
                        <Input label="Headquarters" value={companyForm.headquarters} onChange={e => setCompanyForm({...companyForm, headquarters: e.target.value})} placeholder="e.g. San Francisco, CA" />
                        <div className="md:col-span-2 flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">About Company</label>
                          <textarea rows="4" value={companyForm.description} onChange={e => setCompanyForm({...companyForm, description: e.target.value})} placeholder="Describe what the company does..." className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-y" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-4 border-t border-slate-200 dark:border-slate-800">
                      <button type="button" onClick={() => setActiveTab('list')} className="px-5 py-2.5 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                      <button type="submit" className="px-5 py-2.5 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors">Register Company</button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* VIEW COMPANY TAB */}
              {activeTab === 'view_company' && selectedCompany && (
                <motion.div key="view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center p-2 shadow-sm">
                          {selectedCompany.logo_url ? <img src={selectedCompany.logo_url} alt="Logo" className="w-full h-full object-contain" /> : <Building className="w-8 h-8 text-slate-400" />}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{selectedCompany.name}</h2>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {selectedCompany.industry || 'N/A'}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {selectedCompany.company_size || 'N/A'}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {selectedCompany.headquarters || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => setDeleteTarget({ type: 'company', id: selectedCompany.id })} className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg font-medium transition-colors">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recruiters List */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Team Members</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{recruiters.length} Recruiters</span>
                      </div>
                      
                      {recruiters.length === 0 ? (
                        <div className="text-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm border-dashed">
                          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-500 dark:text-slate-400 font-medium">No recruiters assigned yet.</p>
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
                          {recruiters.map(r => (
                            <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              {editingRecruiter && editingRecruiter.id === r.id ? (
                                <form onSubmit={handleEditRecruiterSubmit} className="w-full space-y-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input label="Designation" value={editingRecruiter.designation || ''} onChange={e => setEditingRecruiter({...editingRecruiter, designation: e.target.value})} />
                                    <Input label="Department" value={editingRecruiter.department || ''} onChange={e => setEditingRecruiter({...editingRecruiter, department: e.target.value})} />
                                    <Input label="Phone" value={editingRecruiter.phone || ''} onChange={e => setEditingRecruiter({...editingRecruiter, phone: e.target.value})} />
                                    <Input label="LinkedIn" value={editingRecruiter.linkedin_url || ''} onChange={e => setEditingRecruiter({...editingRecruiter, linkedin_url: e.target.value})} />
                                  </div>
                                  <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setEditingRecruiter(null)} className="px-4 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 text-sm shadow-sm">Save Changes</button>
                                  </div>
                                </form>
                              ) : (
                                <>
                                  <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                                      <span className="font-semibold text-slate-600 dark:text-slate-300">{r.email.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold text-slate-900 dark:text-white leading-none">{r.email}</p>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${r.is_active ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                          {r.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                      </div>
                                      <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {r.designation || 'Recruiter'} {r.department ? `• ${r.department}` : ''}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 self-start sm:self-center">
                                    <button onClick={() => handleToggleRecruiter(r.id)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title={r.is_active ? "Deactivate" : "Activate"}>
                                      <Shield className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setEditingRecruiter(r)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors" title="Edit">
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setDeleteTarget({ type: 'recruiter', id: r.id })} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add Recruiter Form */}
                    <div className="lg:col-span-1">
                      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sticky top-6">
                        <h4 className="font-semibold mb-1">Add Team Member</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Generate credentials for a new recruiter.</p>
                        
                        <form onSubmit={handleCreateRecruiter} className="space-y-4">
                          <Input label="Email Address *" type="email" required value={recruiterForm.email} onChange={e => setRecruiterForm({...recruiterForm, email: e.target.value})} placeholder="email@company.com" />
                          <Input label="Temporary Password *" type="password" required value={recruiterForm.password} onChange={e => setRecruiterForm({...recruiterForm, password: e.target.value})} placeholder="••••••••" />
                          <Input label="Designation" value={recruiterForm.designation} onChange={e => setRecruiterForm({...recruiterForm, designation: e.target.value})} placeholder="e.g. Senior Recruiter" />
                          <Input label="Department" value={recruiterForm.department} onChange={e => setRecruiterForm({...recruiterForm, department: e.target.value})} placeholder="e.g. Engineering" />
                          <button type="submit" className="w-full mt-2 px-4 py-2.5 rounded-lg font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm">
                            Create Account
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTarget(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", bounce: 0, duration: 0.3 }} className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Confirm Deletion</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                  You are about to permanently delete this {deleteTarget.type}. This action cannot be undone. Please enter your admin password to confirm.
                </p>
                {deleteError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400 font-medium">
                    {deleteError}
                  </div>
                )}
                <form onSubmit={executeDelete}>
                  <Input type="password" placeholder="Enter admin password" required value={adminPassword} onChange={e => setAdminPassword(e.target.value)} autoFocus />
                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => { setDeleteTarget(null); setAdminPassword(''); setDeleteError(''); }} className="flex-1 px-4 py-2.5 rounded-lg font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors">Delete Permanently</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
