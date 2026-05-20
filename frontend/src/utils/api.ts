import axios from 'axios';

const API_BASE_URL =
  (globalThis as any)?.process?.env?.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const signup = async (data: { name: string; email: string; password: string }) => {
  const response = await api.post('/auth/signup', data);
  return response.data;
};

export const login = async (data: { email: string; password: string }) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Profile APIs
export const getProfile = async () => {
  const response = await api.get('/profile');
  return response.data;
};

export const updateProfile = async (data: any) => {
  const response = await api.put('/profile', data);
  return response.data;
};

export const getUserProfile = async (userId: string) => {
  const response = await api.get(`/profile/${userId}`);
  return response.data;
};

export const generateProfileSummary = async () => {
  const response = await api.post('/profile/generate-summary');
  return response.data;
};

// Match APIs
export const findMatches = async (limit: number = 10) => {
  const response = await api.get(`/match/find?limit=${limit}`);
  return response.data;
};

export const getMatchDetails = async (userId: string) => {
  const response = await api.get(`/match/user/${userId}`);
  return response.data;
};

// Team APIs
export const getTeams = async () => {
  const response = await api.get('/team');
  return response.data;
};

export const getTeam = async (teamId: string) => {
  const response = await api.get(`/team/${teamId}`);
  return response.data;
};

export const createTeam = async (data: { name: string; description?: string; memberIds?: string[] }) => {
  const response = await api.post('/team', data);
  return response.data;
};

export const updateTeam = async (teamId: string, data: { name?: string; description?: string }) => {
  const response = await api.put(`/team/${teamId}`, data);
  return response.data;
};

export const deleteTeam = async (teamId: string) => {
  const response = await api.delete(`/team/${teamId}`);
  return response.data;
};

export const addTeamMember = async (teamId: string, userId: string) => {
  const response = await api.post(`/team/${teamId}/members`, { userId });
  return response.data;
};

export const removeTeamMember = async (teamId: string, userId: string) => {
  const response = await api.delete(`/team/${teamId}/members/${userId}`);
  return response.data;
};

// Chat APIs
export const getChatHistory = async (teamId: string, limit: number = 50, offset: number = 0) => {
  const response = await api.get(`/chat/${teamId}?limit=${limit}&offset=${offset}`);
  return response.data;
};

export const deleteMessage = async (messageId: string) => {
  const response = await api.delete(`/chat/${messageId}`);
  return response.data;
};

// AI suggestion APIs
export const generateTeamSuggestion = async (data: {
  competitionDescription: string;
  requiredSkills: string[];
  teamSize: number;
  preferredTechnologies: string[];
}) => {
  const response = await api.post('/ai/generate-team', data);
  return response.data;
};

export const saveSuggestion = async (data: {
  competitionDescription: string;
  generatedResponse: any;
}) => {
  const response = await api.post('/suggestions/save', data);
  return response.data;
};

export const getSuggestions = async () => {
  const response = await api.get('/suggestions');
  return response.data;
};

export default api;