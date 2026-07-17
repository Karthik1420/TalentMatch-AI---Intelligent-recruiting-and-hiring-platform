import { useState, useEffect } from 'react';
import candidateApi from '../../../api/candidateApi';

const BasicInfoSteps = ({ step, initialData, onNext, onBack, isFirstStep, profileId }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    headline: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    alternate_phone: '',
    email: '',
    
    current_company: '',
    current_designation: '',
    current_salary: '',
    expected_salary: '',
    notice_period: '',
    preferred_location: '',
    work_authorization: '',
    summary: '',
    
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    website: '',
    
    address: '',
    city: '',
    state: '',
    country: '',
    country: '',
    postal_code: '',
    tag_ids: []
  });

  const [masterTags, setMasterTags] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await candidateApi.getMasterTags();
        setMasterTags(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    if (initialData) {
      let tag_ids = [];
      if (initialData.career_tags) {
        tag_ids = initialData.career_tags.map(t => t.id);
      } else if (initialData.tag_ids) {
        tag_ids = initialData.tag_ids;
      }
      setFormData(prev => ({ ...prev, ...initialData, tag_ids }));
    }
  }, [initialData]);

  const toggleTag = (id) => {
    setFormData(prev => {
      const current = prev.tag_ids || [];
      if (current.includes(id)) {
        return { ...prev, tag_ids: current.filter(t => t !== id) };
      } else {
        return { ...prev, tag_ids: [...current, id] };
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // We only send the fields related to the current step (or all, since API supports partial update if we use PUT)
    // Actually, backend expects CandidateProfileCreate schema which has many Optional fields. 
    // We can just send the entire formData.
    
    let saveFunc = null;
    if (profileId) {
        saveFunc = () => candidateApi.updateProfile(formData);
    } else {
        saveFunc = () => candidateApi.createProfile(formData);
    }
    
    onNext(formData, saveFunc);
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <div className="flex-1 space-y-6">
        
        {step === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
              <input required type="text" name="first_name" value={formData.first_name || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
              <input required type="text" name="last_name" value={formData.last_name || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
              <input required type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Professional Headline</label>
              <input type="text" name="headline" value={formData.headline || ''} onChange={handleChange} placeholder="e.g. Senior Software Engineer" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
              <input type="date" name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
              <select name="gender" value={formData.gender || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Alternate Phone</label>
              <input type="tel" name="alternate_phone" value={formData.alternate_phone || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Company</label>
              <input type="text" name="current_company" value={formData.current_company || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Designation</label>
              <input type="text" name="current_designation" value={formData.current_designation || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Salary</label>
              <input type="text" name="current_salary" value={formData.current_salary || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expected Salary</label>
              <input type="text" name="expected_salary" value={formData.expected_salary || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notice Period (Days)</label>
              <input type="text" name="notice_period" value={formData.notice_period || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preferred Location</label>
              <input type="text" name="preferred_location" value={formData.preferred_location || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Work Authorization</label>
              <input type="text" name="work_authorization" value={formData.work_authorization || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Professional Summary</label>
              <textarea name="summary" rows={4} value={formData.summary || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"></textarea>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Career Preferences</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Choose the roles and technologies you are interested in to help us recommend the best jobs for you.</p>
            <div className="flex flex-wrap gap-2">
              {masterTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    (formData.tag_ids || []).includes(tag.id)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-indigo-500'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">LinkedIn URL</label>
              <input type="url" name="linkedin_url" value={formData.linkedin_url || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GitHub URL</label>
              <input type="url" name="github_url" value={formData.github_url || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Portfolio URL</label>
              <input type="url" name="portfolio_url" value={formData.portfolio_url || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
              <input type="url" name="website" value={formData.website || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
              <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
              <input type="text" name="city" value={formData.city || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">State/Province</label>
              <input type="text" name="state" value={formData.state || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Country</label>
              <input type="text" name="country" value={formData.country || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Postal Code</label>
              <input type="text" name="postal_code" value={formData.postal_code || ''} onChange={handleChange} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
            </div>
          </div>
        )}

      </div>
      
      <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between">
        {!isFirstStep ? (
          <button type="button" onClick={onBack} className="px-6 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Back
          </button>
        ) : <div></div>}
        <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium">
          Save & Next
        </button>
      </div>
    </form>
  );
};

export default BasicInfoSteps;
