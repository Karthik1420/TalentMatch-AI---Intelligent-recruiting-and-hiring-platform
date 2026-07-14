import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create_company' | 'view_company'
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
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: { Authorization: `Bearer ${user?.token}` }
  });

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
      setTimeout(() => setActiveTab('list'), 1500);
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
      } else if (deleteTarget.type === 'recruiter') {
        await api.post(`/admin/recruiter/${deleteTarget.id}/delete`, { password: adminPassword });
        setSuccess('Recruiter deleted successfully');
        fetchRecruiters(selectedCompany.id);
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
    <div className="dashboard-container">
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel" style={{ width: '400px' }}>
            <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Confirm Deletion</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              You are about to delete this {deleteTarget.type}. This action cannot be undone. Please enter your admin password to confirm.
            </p>
            {deleteError && <div className="error-message">{deleteError}</div>}
            <form onSubmit={executeDelete}>
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder="Admin Password" 
                  required 
                  value={adminPassword} 
                  onChange={e => setAdminPassword(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn" style={{ background: 'var(--danger)', color: 'white' }}>Delete</button>
                <button type="button" onClick={() => { setDeleteTarget(null); setAdminPassword(''); setDeleteError(''); }} className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'white' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <button onClick={logout} className="btn" style={{ background: 'var(--border-color)', color: 'white', width: 'auto' }}>
            Logout
          </button>
        </div>
        
        {/* Navigation */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <button 
            onClick={() => { setActiveTab('list'); setError(''); setSuccess(''); }}
            className="btn" 
            style={{ width: 'auto', background: activeTab === 'list' ? 'var(--primary)' : 'transparent', border: '1px solid var(--primary)' }}>
            Manage Companies
          </button>
          <button 
            onClick={() => { setActiveTab('create_company'); setError(''); setSuccess(''); }}
            className="btn" 
            style={{ width: 'auto', background: activeTab === 'create_company' ? 'var(--primary)' : 'transparent', border: '1px solid var(--primary)' }}>
            Register New Company
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="error-message" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'var(--success)', color: 'var(--success)' }}>{success}</div>}

        {/* Tab: List Companies */}
        {activeTab === 'list' && (
          <div>
            <h3>Registered Companies</h3>
            {loading ? <p>Loading companies...</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                {companies.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No companies registered yet.</p>}
                {companies.map(c => (
                  <div key={c.id} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                    {c.logo_url && <img src={c.logo_url} alt="Logo" style={{ width: '50px', height: '50px', objectFit: 'contain', marginBottom: '1rem', background: 'white', borderRadius: '4px' }} />}
                    <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'white' }}>{c.name}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', flexGrow: 1 }}>{c.industry || 'No industry'} • {c.headquarters || c.city || 'No location'}</p>
                    <button 
                      onClick={() => openCompanyView(c)}
                      className="btn btn-primary" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                      Manage & Add Recruiters
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Create Company */}
        {activeTab === 'create_company' && (
          <div>
            <h3>Register New Company</h3>
            <form onSubmit={handleCreateCompany} style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
              
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Company Logo (Image)</label>
                <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} />
              </div>

              <div className="form-group">
                <label>Company Name *</label>
                <input required value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} placeholder="e.g. Acme Corp" />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <input value={companyForm.industry} onChange={e => setCompanyForm({...companyForm, industry: e.target.value})} placeholder="e.g. Software" />
              </div>
              <div className="form-group">
                <label>Company Size</label>
                <input value={companyForm.company_size} onChange={e => setCompanyForm({...companyForm, company_size: e.target.value})} placeholder="e.g. 100000+" />
              </div>
              <div className="form-group">
                <label>Founded Year</label>
                <input type="number" value={companyForm.founded_year} onChange={e => setCompanyForm({...companyForm, founded_year: e.target.value})} placeholder="e.g. 1998" />
              </div>
              <div className="form-group">
                <label>Headquarters</label>
                <input value={companyForm.headquarters} onChange={e => setCompanyForm({...companyForm, headquarters: e.target.value})} placeholder="e.g. California" />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input type="url" value={companyForm.website} onChange={e => setCompanyForm({...companyForm, website: e.target.value})} placeholder="https://..." />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>About Company (Description)</label>
                <textarea 
                  value={companyForm.description} 
                  onChange={e => setCompanyForm({...companyForm, description: e.target.value})} 
                  placeholder="Describe the company..."
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'white', minHeight: '80px' }}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Mission / Vision</label>
                <input value={companyForm.mission} onChange={e => setCompanyForm({...companyForm, mission: e.target.value})} placeholder="Company mission statement" />
              </div>

              <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>Register Company</button>
            </form>
          </div>
        )}

        {/* Tab: View Company & Add Recruiter */}
        {activeTab === 'view_company' && selectedCompany && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {selectedCompany.logo_url && <img src={selectedCompany.logo_url} alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain', background: 'white', borderRadius: '8px' }} />}
                <div>
                  <h3 style={{ margin: 0 }}>{selectedCompany.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{selectedCompany.industry} | Size: {selectedCompany.company_size}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setDeleteTarget({ type: 'company', id: selectedCompany.id })} className="btn" style={{ width: 'auto', padding: '0.5rem 1rem', background: 'var(--danger)', color: 'white' }}>Delete Company</button>
                <button onClick={() => setActiveTab('list')} className="btn" style={{ width: 'auto', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'white' }}>Back to List</button>
              </div>
            </div>
            
            {/* List Recruiters Section */}
            <div style={{ marginTop: '2rem' }}>
              <h4>Existing Recruiters</h4>
              {recruiters.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>No recruiters found for this company.</p>
              ) : (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recruiters.map(r => (
                    <div key={r.id} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: r.is_active ? '4px solid var(--success)' : '4px solid var(--text-secondary)' }}>
                      {editingRecruiter && editingRecruiter.id === r.id ? (
                        <form onSubmit={handleEditRecruiterSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', width: '100%' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Designation</label>
                            <input value={editingRecruiter.designation || ''} onChange={e => setEditingRecruiter({...editingRecruiter, designation: e.target.value})} />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Department</label>
                            <input value={editingRecruiter.department || ''} onChange={e => setEditingRecruiter({...editingRecruiter, department: e.target.value})} />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Phone</label>
                            <input value={editingRecruiter.phone || ''} onChange={e => setEditingRecruiter({...editingRecruiter, phone: e.target.value})} />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>LinkedIn URL</label>
                            <input value={editingRecruiter.linkedin_url || ''} onChange={e => setEditingRecruiter({...editingRecruiter, linkedin_url: e.target.value})} />
                          </div>
                          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Save</button>
                            <button type="button" onClick={() => setEditingRecruiter(null)} className="btn" style={{ width: 'auto', background: 'transparent', border: '1px solid var(--border-color)', color: 'white' }}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <p style={{ fontWeight: 600, color: 'white', margin: 0 }}>{r.email}</p>
                              <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: r.is_active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.2)', color: r.is_active ? 'var(--success)' : 'var(--text-secondary)' }}>
                                {r.is_active ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                              {r.designation || 'No Designation'} - {r.department || 'No Dept'} | {r.phone || 'No Phone'}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button 
                              onClick={() => handleToggleRecruiter(r.id)} 
                              className="btn" 
                              style={{ width: 'auto', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'white', fontSize: '0.875rem' }}>
                              {r.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button 
                              onClick={() => setEditingRecruiter(r)} 
                              className="btn" 
                              style={{ width: 'auto', padding: '0.5rem 1rem', background: 'var(--primary)', fontSize: '0.875rem' }}>
                              Edit
                            </button>
                            <button 
                              onClick={() => setDeleteTarget({ type: 'recruiter', id: r.id })} 
                              className="btn" 
                              style={{ width: 'auto', padding: '0.5rem 1rem', background: 'var(--danger)', color: 'white', fontSize: '0.875rem' }}>
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Create Recruiter Form */}
            <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem', border: '1px solid var(--border-color)' }}>
              <h4>Add New Recruiter</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Generate an account for a new recruiter belonging to {selectedCompany.name}.</p>
              
              <form onSubmit={handleCreateRecruiter} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label>Recruiter Email *</label>
                  <input type="email" required value={recruiterForm.email} onChange={e => setRecruiterForm({...recruiterForm, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input type="password" required value={recruiterForm.password} onChange={e => setRecruiterForm({...recruiterForm, password: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <input value={recruiterForm.designation} onChange={e => setRecruiterForm({...recruiterForm, designation: e.target.value})} placeholder="e.g. Senior Talent Acquisition" />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input value={recruiterForm.department} onChange={e => setRecruiterForm({...recruiterForm, department: e.target.value})} placeholder="e.g. HR" />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input value={recruiterForm.phone} onChange={e => setRecruiterForm({...recruiterForm, phone: e.target.value})} placeholder="e.g. +1 234 567 8900" />
                </div>
                <div className="form-group">
                  <label>LinkedIn Profile URL</label>
                  <input type="url" value={recruiterForm.linkedin_url} onChange={e => setRecruiterForm({...recruiterForm, linkedin_url: e.target.value})} placeholder="https://linkedin.com/in/..." />
                </div>
                <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>Generate Recruiter Account</button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
