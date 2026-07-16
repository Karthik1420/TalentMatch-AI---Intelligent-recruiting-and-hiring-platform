import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const getMultipartHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  };
};

const candidateApi = {
  // Portfolio
  getPortfolio: () => axios.get(`${API_BASE_URL}/candidate/portfolio`, getAuthHeaders()),
  
  // Profile
  createProfile: (data) => axios.post(`${API_BASE_URL}/candidate/profile`, data, getAuthHeaders()),
  updateProfile: (data) => axios.put(`${API_BASE_URL}/candidate/profile`, data, getAuthHeaders()),
  uploadProfilePhoto: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_BASE_URL}/candidate/profile/photo`, formData, getMultipartHeaders());
  },

  // Master Data
  getMasterSkills: () => axios.get(`${API_BASE_URL}/candidate/master/skills`, getAuthHeaders()),
  createMasterSkill: (data) => axios.post(`${API_BASE_URL}/candidate/master/skills`, data, getAuthHeaders()),
  getMasterLanguages: () => axios.get(`${API_BASE_URL}/candidate/master/languages`, getAuthHeaders()),
  createMasterLanguage: (data) => axios.post(`${API_BASE_URL}/candidate/master/languages`, data, getAuthHeaders()),

  // Education
  addEducation: (data) => axios.post(`${API_BASE_URL}/candidate/education`, data, getAuthHeaders()),
  updateEducation: (id, data) => axios.put(`${API_BASE_URL}/candidate/education/${id}`, data, getAuthHeaders()),
  deleteEducation: (id) => axios.delete(`${API_BASE_URL}/candidate/education/${id}`, getAuthHeaders()),

  // Experience
  addExperience: (data) => axios.post(`${API_BASE_URL}/candidate/experience`, data, getAuthHeaders()),
  updateExperience: (id, data) => axios.put(`${API_BASE_URL}/candidate/experience/${id}`, data, getAuthHeaders()),
  deleteExperience: (id) => axios.delete(`${API_BASE_URL}/candidate/experience/${id}`, getAuthHeaders()),

  // Projects
  addProject: (data) => axios.post(`${API_BASE_URL}/candidate/projects`, data, getAuthHeaders()),
  updateProject: (id, data) => axios.put(`${API_BASE_URL}/candidate/projects/${id}`, data, getAuthHeaders()),
  deleteProject: (id) => axios.delete(`${API_BASE_URL}/candidate/projects/${id}`, getAuthHeaders()),

  // Certifications
  addCertification: (data, file) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key]) formData.append(key, data[key]);
    });
    if (file) formData.append('file', file);
    return axios.post(`${API_BASE_URL}/candidate/certifications`, formData, getMultipartHeaders());
  },
  updateCertification: (id, data, file) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key]) formData.append(key, data[key]);
    });
    if (file) formData.append('file', file);
    return axios.put(`${API_BASE_URL}/candidate/certifications/${id}`, formData, getMultipartHeaders());
  },
  deleteCertification: (id) => axios.delete(`${API_BASE_URL}/candidate/certifications/${id}`, getAuthHeaders()),

  // Languages
  addLanguage: (data) => axios.post(`${API_BASE_URL}/candidate/languages`, data, getAuthHeaders()),
  deleteLanguage: (id) => axios.delete(`${API_BASE_URL}/candidate/languages/${id}`, getAuthHeaders()),

  // Skills
  addSkill: (data) => axios.post(`${API_BASE_URL}/candidate/skills`, data, getAuthHeaders()),
  deleteSkill: (id) => axios.delete(`${API_BASE_URL}/candidate/skills/${id}`, getAuthHeaders()),
  
  // Job Matches
  getJobs: (params) => axios.get(`${API_BASE_URL}/candidate/jobs`, { ...getAuthHeaders(), params }),
  getJobDetails: (id) => axios.get(`${API_BASE_URL}/candidate/jobs/${id}`, getAuthHeaders()),
  applyForJob: (id) => axios.post(`${API_BASE_URL}/candidate/jobs/${id}/apply`, {}, getAuthHeaders()),
  getApplications: () => axios.get(`${API_BASE_URL}/candidate/applications`, getAuthHeaders())
};

export default candidateApi;
