import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Briefcase, MapPin, DollarSign, Users, ArrowLeft, ArrowRight, Save, CheckCircle, Edit, Trash2, Power } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Basic Details' },
  { id: 2, title: 'Location & Dept' },
  { id: 3, title: 'Responsibilities' },
  { id: 4, title: 'Qualifications' },
  { id: 5, title: 'Compensation' },
  { id: 6, title: 'Review' }
];

const INITIAL_FORM_DATA = {
  title: '',
  employment_type: 'Full-Time',
  work_mode: 'Remote',
  vacancies: 1,
  department: '',
  location_city: '',
  location_state: '',
  location_country: '',
  description: '',
  responsibilities: '',
  experience_min_years: '',
  experience_max_years: '',
  required_degree: '',
  required_specialization: '',
  minimum_cgpa: '',
  requirements: '',
  preferred_qualifications: '',
  required_skills_text: '',
  salary_min: '',
  salary_max: '',
  currency: 'USD',
  benefits: '',
  application_deadline: '',
  status: 'Open'
};

const RecruiterJobs = ({ onViewApplications }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [editingJobId, setEditingJobId] = useState(null);

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

  const handleCreateJob = async (statusOverride = null) => {
    try {
      const payload = {
        ...formData,
        status: statusOverride || formData.status,
        salary_min: parseFloat(formData.salary_min) || null,
        salary_max: parseFloat(formData.salary_max) || null,
        experience_min_years: parseInt(formData.experience_min_years) || null,
        experience_max_years: parseInt(formData.experience_max_years) || null,
        minimum_cgpa: parseFloat(formData.minimum_cgpa) || null,
        vacancies: parseInt(formData.vacancies) || 1,
        application_deadline: formData.application_deadline ? new Date(formData.application_deadline).toISOString() : null,
      };

      const isEditing = !!editingJobId;
      const url = isEditing 
        ? `http://localhost:8000/recruiter/jobs/${editingJobId}`
        : 'http://localhost:8000/recruiter/jobs';
        
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsCreating(false);
        setCurrentStep(1);
        setFormData(INITIAL_FORM_DATA);
        setEditingJobId(null);
        fetchJobs();
      } else {
        const errData = await res.json();
        console.error("Failed to save job:", errData);
        alert("Failed to save job. Check console for details.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while saving the job.");
    }
  };

  const handleEdit = (job) => {
    // Populate form data with job details, translating nulls to empty strings where needed
    const populatedData = { ...INITIAL_FORM_DATA };
    Object.keys(INITIAL_FORM_DATA).forEach(key => {
      if (job[key] !== undefined && job[key] !== null) {
        if (key === 'application_deadline') {
          // format date for datetime-local input
          populatedData[key] = new Date(job[key]).toISOString().slice(0, 16);
        } else {
          populatedData[key] = job[key];
        }
      }
    });
    setFormData(populatedData);
    setEditingJobId(job.id);
    setIsCreating(true);
    setCurrentStep(1);
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`http://localhost:8000/recruiter/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        fetchJobs();
      } else {
        alert("Failed to delete job.");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting job.");
    }
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
    try {
      const res = await fetch(`http://localhost:8000/recruiter/jobs/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        // We can just send the updated status. Our backend PUT route expects a full JobUpdate,
        // but fields are optional. So sending just status is fine.
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchJobs();
      } else {
        alert("Failed to update status.");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating status.");
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = 'Job Title is required';
      if (!formData.employment_type) newErrors.employment_type = 'Employment Type is required';
      if (!formData.work_mode) newErrors.work_mode = 'Work Mode is required';
      if (formData.vacancies < 1) newErrors.vacancies = 'Vacancies must be at least 1';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleQuillChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderInput = (label, name, type = 'text', placeholder = '', required = false) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-xl border ${errors[name] ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-shadow`}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  const renderSelect = (label, name, options, required = false) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className={`w-full px-4 py-2.5 rounded-xl border ${errors[name] ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-shadow`}
      >
        {options.map(opt => <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>)}
      </select>
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  const renderQuill = (label, name) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <textarea
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
        style={{ minHeight: '150px' }}
      />
    </div>
  );

  if (loading) return <div className="p-8 text-center text-slate-500">Loading jobs...</div>;

  return (
    <div className="space-y-6 pb-12">
      {!isCreating ? (
        <>
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Postings</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your company's open positions</p>
            </div>
            <button 
              onClick={() => { setFormData(INITIAL_FORM_DATA); setEditingJobId(null); setIsCreating(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              Post New Job
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {jobs.length === 0 && (
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
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${job.status === 'Open' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {job.status}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
                  <button 
                    onClick={() => handleToggleStatus(job)}
                    title={job.status === 'Open' ? "Deactivate Job" : "Activate Job"}
                    className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${job.status === 'Open' ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400'}`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleEdit(job)}
                    title="Edit Job"
                    className="flex items-center justify-center w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onViewApplications(job.id, job.title)}
                    className="flex items-center gap-2 px-4 py-2 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium transition-colors text-sm"
                  >
                    <Users className="w-4 h-4" /> Apps
                  </button>
                  <button 
                    onClick={() => handleDelete(job.id)}
                    title="Delete Job"
                    className="flex items-center justify-center w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-slate-900/40">
          
          {/* Stepper Header */}
          <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 p-6 sm:px-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{editingJobId ? 'Edit Job Posting' : 'Create Job Posting'}</h2>
              <button 
                onClick={() => { setIsCreating(false); setCurrentStep(1); setEditingJobId(null); setFormData(INITIAL_FORM_DATA); }}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
            
            <div className="hidden sm:flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-600 transition-all duration-300 z-0" style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}></div>
              
              {STEPS.map((step) => (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${currentStep > step.id ? 'bg-indigo-600 text-white' : currentStep === step.id ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                    {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`text-xs font-medium absolute -bottom-6 whitespace-nowrap ${currentStep >= step.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="sm:hidden text-sm font-medium text-indigo-600 dark:text-indigo-400">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-10 min-h-[400px]">
            
            {/* Step 1: Basic Details */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    {renderInput('Job Title', 'title', 'text', 'e.g. Senior Full Stack Engineer', true)}
                  </div>
                  {renderSelect('Employment Type', 'employment_type', ['Full-Time', 'Part-Time', 'Contract', 'Internship'], true)}
                  {renderSelect('Work Mode', 'work_mode', ['Remote', 'Hybrid', 'Onsite'], true)}
                  {renderInput('Number of Vacancies', 'vacancies', 'number', '1', true)}
                </div>
              </div>
            )}

            {/* Step 2: Location & Dept */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">Location & Department</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput('Department', 'department', 'text', 'e.g. Engineering')}
                  {renderInput('City', 'location_city', 'text', 'e.g. San Francisco')}
                  {renderInput('State / Province', 'location_state', 'text', 'e.g. CA')}
                  {renderInput('Country', 'location_country', 'text', 'e.g. USA')}
                </div>
              </div>
            )}

            {/* Step 3: Responsibilities */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">Roles & Responsibilities</h3>
                {renderQuill('Job Description Overview', 'description')}
                {renderQuill('Key Responsibilities', 'responsibilities')}
              </div>
            )}

            {/* Step 4: Qualifications */}
            {currentStep === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">Qualifications & Experience</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderInput('Min Experience (Years)', 'experience_min_years', 'number', 'e.g. 3')}
                  {renderInput('Max Experience (Years)', 'experience_max_years', 'number', 'e.g. 7')}
                  {renderInput('Required Degree', 'required_degree', 'text', 'e.g. Bachelor of Science')}
                  {renderInput('Specialization', 'required_specialization', 'text', 'e.g. Computer Science')}
                  {renderInput('Minimum CGPA', 'minimum_cgpa', 'number', 'e.g. 3.0')}
                  {renderInput('Required Skills (Comma separated)', 'required_skills_text', 'text', 'e.g. React, Python, AWS')}
                </div>
                {renderQuill('Technical Requirements', 'requirements')}
                {renderQuill('Preferred Qualifications', 'preferred_qualifications')}
              </div>
            )}

            {/* Step 5: Compensation */}
            {currentStep === 5 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">Compensation & Process</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderInput('Min Salary', 'salary_min', 'number', 'e.g. 100000')}
                  {renderInput('Max Salary', 'salary_max', 'number', 'e.g. 150000')}
                  {renderInput('Currency', 'currency', 'text', 'e.g. USD')}
                  <div className="md:col-span-3">
                    {renderInput('Application Deadline', 'application_deadline', 'datetime-local')}
                  </div>
                </div>
                {renderQuill('Benefits & Perks', 'benefits')}
              </div>
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">Review Job Posting</h3>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <h1 className="text-2xl font-bold mb-2">{formData.title || 'Untitled Job'}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4"/> {formData.employment_type}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {formData.work_mode} {formData.location_city ? `- ${formData.location_city}` : ''}</span>
                    {(formData.salary_min || formData.salary_max) && (
                      <span className="flex items-center gap-1"><DollarSign className="w-4 h-4"/> {formData.currency} {formData.salary_min} - {formData.salary_max}</span>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    {formData.description && (
                      <div>
                        <h4 className="font-semibold text-lg mb-2">Overview</h4>
                        <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">{formData.description}</div>
                      </div>
                    )}
                    {formData.required_skills_text && (
                      <div>
                        <h4 className="font-semibold text-lg mb-2">Key Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.required_skills_text.split(',').map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm">{skill.trim()}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
                  <button 
                    onClick={() => handleCreateJob('Draft')}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
                  >
                    <Save className="w-5 h-5" /> Save as Draft
                  </button>
                  <button 
                    onClick={() => handleCreateJob('Open')}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-600/20"
                  >
                    <CheckCircle className="w-5 h-5" /> Publish Job
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Stepper Footer Controls */}
          <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 p-6 sm:px-10 flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${currentStep === 1 ? 'opacity-50 cursor-not-allowed text-slate-400' : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
            
            {currentStep < STEPS.length && (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl font-medium transition-colors shadow-sm"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default RecruiterJobs;
