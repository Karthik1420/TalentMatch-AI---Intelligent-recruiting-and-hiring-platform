import { useState, useEffect } from 'react';
import { Edit2, ExternalLink, MapPin, Mail, Phone, Calendar, Briefcase, Download, Trash2, Loader2, Upload } from 'lucide-react';
import candidateApi from '../../../api/candidateApi';
import Modal from '../shared/Modal';
import CreatableSelect from '../shared/CreatableSelect';

const SectionCard = ({ title, items, renderItem, onAdd, onEdit, hideAdd = false }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm mb-6 overflow-hidden">
    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
      <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{title}</h3>
      {!hideAdd && onAdd && (
        <button onClick={onAdd} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
          + Add New
        </button>
      )}
    </div>
    <div className="p-5">
      {items && items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="relative group">
              {renderItem(item)}
              {onEdit && (
                <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex">
                  <button onClick={() => onEdit(item)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-4">No {title.toLowerCase()} added yet.</p>
      )}
    </div>
  </div>
);

const CandidatePortfolio = ({ data, refreshData, readOnly = false }) => {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, item: null, title: '' });
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [masterSkills, setMasterSkills] = useState([]);
  const [masterLanguages, setMasterLanguages] = useState([]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [langRes, skillRes] = await Promise.all([
          candidateApi.getMasterLanguages(),
          candidateApi.getMasterSkills()
        ]);
        setMasterLanguages(langRes.data);
        setMasterSkills(skillRes.data);
      } catch (err) {
        console.error("Failed to fetch master data", err);
      }
    };
    fetchMasterData();
  }, []);

  const handleCreateMasterOption = async (name, fieldName) => {
    try {
      if (fieldName === 'skill_id') {
        const res = await candidateApi.createMasterSkill({ name, category: "Custom" });
        setMasterSkills(prev => [...prev, res.data]);
        setFormData(prev => ({ ...prev, [fieldName]: res.data.id }));
      } else if (fieldName === 'language_id') {
        const res = await candidateApi.createMasterLanguage({ name });
        setMasterLanguages(prev => [...prev, res.data]);
        setFormData(prev => ({ ...prev, [fieldName]: res.data.id }));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create option.");
    }
  };

  if (!data || !data.profile) return null;

  const { profile, education, experience, projects, certifications, languages, skills } = data;

  const openModal = (type, title, item = null) => {
    setFormData(item || {});
    setFile(null);
    setModalConfig({ isOpen: true, type, item, title });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, type: null, item: null, title: '' });
    setFormData({});
    setFile(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const handleDelete = async (id, deleteFunc) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteFunc(id);
      refreshData();
    } catch (error) {
      alert("Failed to delete item.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { type, item } = modalConfig;
      
      const apiMap = {
        'profile': { create: null, update: candidateApi.updateProfile },
        'education': { create: candidateApi.addEducation, update: candidateApi.updateEducation },
        'experience': { create: candidateApi.addExperience, update: candidateApi.updateExperience },
        'projects': { create: candidateApi.addProject, update: candidateApi.updateProject },
        'certifications': { create: candidateApi.addCertification, update: candidateApi.updateCertification, hasFile: true },
        'languages': { create: candidateApi.addLanguage, update: null },
        'skills': { create: candidateApi.addSkill, update: null }
      };

      const config = apiMap[type];
      if (item) {
        if (config.hasFile) await config.update(item.id, formData, file);
        else await config.update(item.id, formData);
      } else {
        if (type === 'languages' && Array.isArray(formData.language_id)) {
          const promises = formData.language_id.map(id => 
            config.create({ ...formData, language_id: id, proficiency: formData.proficiency || 'Beginner' })
          );
          await Promise.all(promises);
        } else if (type === 'skills' && Array.isArray(formData.skill_id)) {
          const promises = formData.skill_id.map(id => 
            config.create({ ...formData, skill_id: id, experience_years: formData.experience_years || 0 })
          );
          await Promise.all(promises);
        } else {
          if (config.hasFile) await config.create(formData, file);
          else await config.create(formData);
        }
      }
      
      refreshData();
      closeModal();
    } catch (error) {
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePhoto = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        await candidateApi.uploadProfilePhoto(e.target.files[0]);
        refreshData();
      } catch (error) {
        alert("Failed to upload photo");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end -mt-12 mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-400 relative group">
              {profile.profile_photo ? (
                <img src={profile.profile_photo.startsWith('http') ? profile.profile_photo : `${(import.meta.env.VITE_API_URL || 'https://talentmatch-ai-intelligent-recruiting.onrender.com')}${profile.profile_photo}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile.first_name.charAt(0)
              )}
              {!readOnly && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input type="file" onChange={handleProfilePhoto} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                  <Upload className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            {!readOnly && (
              <button onClick={() => openModal('profile', 'Edit Profile', profile)} className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mt-1">{profile.headline || 'Professional'}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
              {profile.city && profile.country && (
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.city}, {profile.country}</span>
              )}
              {profile.email && (
                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {profile.email}</span>
              )}
              {profile.phone && (
                <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {profile.phone}</span>
              )}
            </div>
            {profile.summary && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">About</h3>
                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{profile.summary}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard 
            title="Experience" 
            items={experience}
            onAdd={!readOnly ? () => openModal('experience', 'Add Experience') : undefined}
            onEdit={!readOnly ? (item) => openModal('experience', 'Edit Experience', item) : undefined}
            renderItem={(exp) => (
              <div className="border-l-2 border-slate-200 dark:border-slate-700 pl-4 py-1 relative before:absolute before:w-3 before:h-3 before:bg-white dark:before:bg-slate-900 before:border-2 before:border-slate-300 dark:before:border-slate-600 before:rounded-full before:-left-[7px] before:top-2">
                <div className="flex justify-between items-start pr-8">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-lg">{exp.designation}</h4>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">{exp.company_name}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-1">{exp.start_date || 'Unknown'} - {exp.currently_working ? 'Present' : (exp.end_date || 'Unknown')}</p>
                {exp.description && <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{exp.description}</p>}
              </div>
            )}
          />

          <SectionCard 
            title="Education" 
            items={education}
            onAdd={!readOnly ? () => openModal('education', 'Add Education') : undefined}
            onEdit={!readOnly ? (item) => openModal('education', 'Edit Education', item) : undefined}
            renderItem={(edu) => (
              <div className="border-l-2 border-slate-200 dark:border-slate-700 pl-4 py-1 relative before:absolute before:w-3 before:h-3 before:bg-white dark:before:bg-slate-900 before:border-2 before:border-slate-300 dark:before:border-slate-600 before:rounded-full before:-left-[7px] before:top-2">
                <h4 className="font-semibold text-slate-900 dark:text-white text-lg pr-8">{edu.degree}</h4>
                <p className="text-slate-600 dark:text-slate-300 font-medium">{edu.institution}</p>
                <p className="text-sm text-slate-500 mt-1">{edu.start_year || 'Unknown'} - {edu.end_year || 'Unknown'}</p>
              </div>
            )}
          />
          
          <SectionCard 
            title="Projects" 
            items={projects}
            onAdd={!readOnly ? () => openModal('projects', 'Add Project') : undefined}
            onEdit={!readOnly ? (item) => openModal('projects', 'Edit Project', item) : undefined}
            renderItem={(proj) => (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-lg pr-8">{proj.title}</h4>
                  <div className="flex gap-2">
                    {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><ExternalLink className="w-4 h-4" /></a>}
                  </div>
                </div>
                {proj.technologies && <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1">{proj.technologies}</p>}
                {proj.description && <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">{proj.description}</p>}
              </div>
            )}
          />
        </div>

        <div className="space-y-6">
          <SectionCard 
            title="Skills" 
            items={skills}
            onAdd={!readOnly ? () => openModal('skills', 'Add Skill') : undefined}
            renderItem={(skill) => (
              <div className="flex justify-between items-center mb-2 group">
                <span className="font-medium text-slate-700 dark:text-slate-300">{skill.skill?.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md font-medium">{skill.experience_years ? `${skill.experience_years} yrs` : skill.proficiency || 'Intermediate'}</span>
                  {!readOnly && (
                    <button onClick={() => handleDelete(skill.id, candidateApi.deleteSkill)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          />

          <SectionCard 
            title="Languages" 
            items={languages}
            onAdd={!readOnly ? () => openModal('languages', 'Add Language') : undefined}
            renderItem={(lang) => (
              <div className="flex justify-between items-center mb-2 group">
                <span className="font-medium text-slate-700 dark:text-slate-300">{lang.language?.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-medium">{lang.proficiency}</span>
                  {!readOnly && (
                    <button onClick={() => handleDelete(lang.id, candidateApi.deleteLanguage)} className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          />
          
          <SectionCard 
            title="Certifications" 
            items={certifications}
            onAdd={!readOnly ? () => openModal('certifications', 'Add Certification') : undefined}
            onEdit={!readOnly ? (item) => openModal('certifications', 'Edit Certification', item) : undefined}
            renderItem={(cert) => (
              <div className="mb-4 last:mb-0 relative pr-8">
                <h4 className="font-medium text-slate-900 dark:text-white">{cert.certificate_name}</h4>
                <p className="text-sm text-slate-500">{cert.issuer}</p>
                {cert.certificate_file_url && (
                  <a href={cert.certificate_file_url.startsWith('http') ? cert.certificate_file_url : `${(import.meta.env.VITE_API_URL || 'https://talentmatch-ai-intelligent-recruiting.onrender.com')}${cert.certificate_file_url}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md transition-colors">
                    <Download className="w-3 h-3" /> View Certificate
                  </a>
                )}
              </div>
            )}
          />
        </div>
      </div>

      {/* Editor Modal */}
      <Modal isOpen={modalConfig.isOpen} onClose={closeModal} title={modalConfig.title}>
        <form onSubmit={handleSave} className="space-y-4">
          
          {modalConfig.type === 'profile' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="first_name" placeholder="First Name *" required value={formData.first_name || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
                <input type="text" name="last_name" placeholder="Last Name *" required value={formData.last_name || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
              <input type="text" name="headline" placeholder="Headline" value={formData.headline || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="city" placeholder="City" value={formData.city || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
                <input type="text" name="country" placeholder="Country" value={formData.country || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
              <textarea name="summary" placeholder="About you..." rows={4} value={formData.summary || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white"></textarea>
            </>
          )}

          {modalConfig.type === 'education' && (
            <>
              <input required type="text" name="degree" placeholder="Degree *" value={formData.degree || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              <input required type="text" name="institution" placeholder="Institution *" value={formData.institution || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" name="start_year" placeholder="Start Year" value={formData.start_year || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
                <input type="number" name="end_year" placeholder="End Year" value={formData.end_year || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
            </>
          )}

          {modalConfig.type === 'experience' && (
            <>
              <input required type="text" name="company_name" placeholder="Company Name *" value={formData.company_name || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              <input required type="text" name="designation" placeholder="Designation *" value={formData.designation || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" name="start_date" value={formData.start_date || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
                <input type="date" name="end_date" value={formData.end_date || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
              <textarea name="description" placeholder="Description" rows={3} value={formData.description || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white"></textarea>
            </>
          )}

          {modalConfig.type === 'projects' && (
            <>
              <input required type="text" name="title" placeholder="Project Title *" value={formData.title || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              <input type="text" name="technologies" placeholder="Technologies" value={formData.technologies || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              <div className="grid grid-cols-2 gap-4">
                <input type="url" name="github_url" placeholder="GitHub URL" value={formData.github_url || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
                <input type="url" name="live_demo_url" placeholder="Live Demo URL" value={formData.live_demo_url || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
              <textarea name="description" placeholder="Description" rows={3} value={formData.description || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white"></textarea>
            </>
          )}

          {modalConfig.type === 'certifications' && (
            <>
              <input required type="text" name="certificate_name" placeholder="Certificate Name *" value={formData.certificate_name || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              <input required type="text" name="issuer" placeholder="Issuer *" value={formData.issuer || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" name="issue_date" value={formData.issue_date || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
                <input type="date" name="expiry_date" value={formData.expiry_date || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
              </div>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative cursor-pointer mt-4">
                <input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.webp" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {file ? file.name : (formData.certificate_file_url ? "Replace existing certificate" : "Upload new certificate")}
                </p>
              </div>
            </>
          )}

          {modalConfig.type === 'languages' && (
            <>
              <CreatableSelect 
                options={masterLanguages} 
                value={formData.language_id ? (!modalConfig.item && Array.isArray(formData.language_id) ? formData.language_id : (Array.isArray(formData.language_id) ? formData.language_id[0] : parseInt(formData.language_id))) : (!modalConfig.item ? [] : '')} 
                onChange={handleChange} 
                onCreateOption={handleCreateMasterOption} 
                name="language_id" 
                placeholder="Select or Type a Language *" 
                isMulti={!modalConfig.item}
              />
              <select name="proficiency" value={formData.proficiency || 'Beginner'} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white h-[42px]">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Professional">Professional</option>
                  <option value="Native">Native</option>
              </select>
            </>
          )}

          {modalConfig.type === 'skills' && (
            <>
              <CreatableSelect 
                options={masterSkills} 
                value={formData.skill_id ? (!modalConfig.item && Array.isArray(formData.skill_id) ? formData.skill_id : (Array.isArray(formData.skill_id) ? formData.skill_id[0] : parseInt(formData.skill_id))) : (!modalConfig.item ? [] : '')} 
                onChange={handleChange} 
                onCreateOption={handleCreateMasterOption} 
                name="skill_id" 
                placeholder="Select or Type a Skill *" 
                isMulti={!modalConfig.item} 
              />
              <input type="number" name="experience_years" placeholder="Years of Experience" value={formData.experience_years || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white h-[42px]" />
            </>
          )}

          <div className="flex justify-between items-center pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
            {modalConfig.item && ['education', 'experience', 'projects', 'certifications', 'languages', 'skills'].includes(modalConfig.type) ? (
              <button type="button" onClick={() => {
                const apiMap = {
                  'education': candidateApi.deleteEducation,
                  'experience': candidateApi.deleteExperience,
                  'projects': candidateApi.deleteProject,
                  'certifications': candidateApi.deleteCertification,
                  'languages': candidateApi.deleteLanguage,
                  'skills': candidateApi.deleteSkill
                };
                handleDelete(modalConfig.item.id, apiMap[modalConfig.type]);
                closeModal();
              }} className="text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium text-sm flex items-center gap-1">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            ) : <div></div>}
            
            <div className="flex gap-3">
              <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CandidatePortfolio;
