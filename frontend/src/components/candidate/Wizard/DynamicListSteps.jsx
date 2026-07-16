import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Loader2, Upload } from 'lucide-react';
import candidateApi from '../../../api/candidateApi';
import CreatableSelect from '../shared/CreatableSelect';

const DynamicListSteps = ({ step, initialData, onNext, onBack, isLastStep }) => {
  // Map step index (4 to 9) to entity types
  const stepMap = {
    4: { key: 'education', title: 'Education', api: candidateApi.addEducation, del: candidateApi.deleteEducation },
    5: { key: 'experience', title: 'Experience', api: candidateApi.addExperience, del: candidateApi.deleteExperience },
    6: { key: 'projects', title: 'Projects', api: candidateApi.addProject, del: candidateApi.deleteProject },
    7: { key: 'certifications', title: 'Certifications', api: candidateApi.addCertification, del: candidateApi.deleteCertification },
    8: { key: 'languages', title: 'Languages', api: candidateApi.addLanguage, del: candidateApi.deleteLanguage },
    9: { key: 'skills', title: 'Skills', api: candidateApi.addSkill, del: candidateApi.deleteSkill }
  };

  const currentConfig = stepMap[step];
  
  const [items, setItems] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (initialData && currentConfig) {
      setItems(initialData[currentConfig.key] || []);
    }
  }, [step, initialData, currentConfig?.key]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const [masterSkills, setMasterSkills] = useState([]);
  const [masterLanguages, setMasterLanguages] = useState([]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        if (step === 8) {
          const res = await candidateApi.getMasterLanguages();
          setMasterLanguages(res.data);
        } else if (step === 9) {
          const res = await candidateApi.getMasterSkills();
          setMasterSkills(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch master data", err);
      }
    };
    fetchMasterData();
  }, [step]);

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

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentConfig.key === 'languages' && Array.isArray(formData.language_id)) {
        const promises = formData.language_id.map(id => 
          currentConfig.api({ ...formData, language_id: id, proficiency: formData.proficiency || 'Beginner' })
        );
        const responses = await Promise.all(promises);
        setItems(prev => [...prev, ...responses.map(r => r.data)]);
      } else if (currentConfig.key === 'skills' && Array.isArray(formData.skill_id)) {
        const promises = formData.skill_id.map(id => 
          currentConfig.api({ ...formData, skill_id: id, experience_years: formData.experience_years || 0 })
        );
        const responses = await Promise.all(promises);
        setItems(prev => [...prev, ...responses.map(r => r.data)]);
      } else {
        let response;
        if (currentConfig.key === 'certifications') {
          response = await currentConfig.api(formData, file);
        } else {
          response = await currentConfig.api(formData);
        }
        setItems(prev => [...prev, response.data]);
      }
      setIsAdding(false);
      setFormData({});
      setFile(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Failed to save item.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await currentConfig.del(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete item.");
    }
  };

  const renderFormFields = () => {
    switch (currentConfig.key) {
      case 'education':
        return (
          <>
            <input required type="text" name="degree" placeholder="Degree *" onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
            <input required type="text" name="institution" placeholder="Institution *" onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
            <input type="number" name="start_year" placeholder="Start Year" onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
            <input type="number" name="end_year" placeholder="End Year" onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
          </>
        );
      case 'experience':
        return (
          <>
            <input required type="text" name="company_name" placeholder="Company Name *" onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
            <input required type="text" name="designation" placeholder="Designation *" onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
            <input type="date" name="start_date" placeholder="Start Date" onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
            <input type="date" name="end_date" placeholder="End Date" onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
            <textarea name="description" placeholder="Description" onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white col-span-2"></textarea>
          </>
        );
      case 'projects':
        return (
          <>
            <input required type="text" name="title" placeholder="Project Title *" onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
            <input type="text" name="technologies" placeholder="Technologies" onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
            <input type="url" name="github_url" placeholder="GitHub URL" onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
            <input type="url" name="live_demo_url" placeholder="Live Demo URL" onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
          </>
        );
      case 'certifications':
        return (
          <>
            <input required type="text" name="certificate_name" placeholder="Certificate Name *" onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
            <input required type="text" name="issuer" placeholder="Issuer *" onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
            <input type="date" name="issue_date" placeholder="Issue Date" onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white" />
            <div className="col-span-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative">
              <input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.webp" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {file ? file.name : "Drag & drop or click to upload certificate"}
              </p>
              <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 5MB</p>
            </div>
          </>
        );
      case 'languages':
        return (
          <>
            <CreatableSelect 
              options={masterLanguages} 
              value={formData.language_id ? (Array.isArray(formData.language_id) ? formData.language_id : [parseInt(formData.language_id)]) : []} 
              onChange={handleChange} 
              onCreateOption={handleCreateMasterOption} 
              name="language_id" 
              placeholder="Select or Type a Language *" 
              isMulti={true}
            />
            <select name="proficiency" value={formData.proficiency || 'Beginner'} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white h-[42px]">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Professional">Professional</option>
                <option value="Native">Native</option>
            </select>
          </>
        );
      case 'skills':
        return (
          <>
            <CreatableSelect 
              options={masterSkills} 
              value={formData.skill_id ? (Array.isArray(formData.skill_id) ? formData.skill_id : [parseInt(formData.skill_id)]) : []} 
              onChange={handleChange} 
              onCreateOption={handleCreateMasterOption} 
              name="skill_id" 
              placeholder="Select or Type a Skill *" 
              isMulti={true}
            />
            <input type="number" name="experience_years" placeholder="Years of Experience" value={formData.experience_years || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-slate-900 dark:text-white h-[42px]" />
          </>
        );
      default:
        return null;
    }
  };

  const renderItem = (item) => {
    const title = item.degree || item.company_name || item.title || item.certificate_name || item.language?.name || item.skill?.name || "Item";
    const subtitle = item.institution || item.designation || item.issuer || item.proficiency || "";
    
    return (
      <div key={item.id} className="flex justify-between items-center p-4 border border-slate-200 dark:border-slate-800 rounded-xl mb-3 bg-white dark:bg-slate-900 shadow-sm">
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white">{title}</h4>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (!currentConfig) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pr-2">
        
        {items.length === 0 && !isAdding && (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-slate-500 dark:text-slate-400 mb-4">No {currentConfig.title.toLowerCase()} added yet.</p>
            <button onClick={() => setIsAdding(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" /> Add {currentConfig.title}
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div className="mb-6">
            {items.map(renderItem)}
            {!isAdding && (
              <button onClick={() => setIsAdding(true)} className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center justify-center gap-2 transition-colors text-sm font-medium">
                <Plus className="w-4 h-4" /> Add Another {currentConfig.title}
              </button>
            )}
          </div>
        )}

        {isAdding && (
          <form onSubmit={handleSave} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-medium text-slate-900 dark:text-white mb-4">Add {currentConfig.title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {renderFormFields()}
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setIsAdding(false); setFormData({}); setFile(null); }} className="px-4 py-2 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </button>
            </div>
          </form>
        )}

      </div>
      
      <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between">
        <button type="button" onClick={onBack} className="px-6 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          Back
        </button>
        <button type="button" onClick={() => onNext(null, null)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium">
          {isLastStep ? "Complete" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default DynamicListSteps;
