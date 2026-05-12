import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s — generation pipeline takes 10-20s
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

// ── Channels ──────────────────────────────────────────────────────────────────
export const channelsApi = {
  list: () => api.get('/api/channels'),
  get: (id) => api.get(`/api/channels/${id}`),
  create: (data) => api.post('/api/channels', data),
  update: (id, data) => api.patch(`/api/channels/${id}`, data),
  delete: (id) => api.delete(`/api/channels/${id}`),
  stats: (id) => api.get(`/api/channels/${id}/stats`),
}

// ── Generation ────────────────────────────────────────────────────────────────
export const generateApi = {
  run: (data) => api.post('/api/generate', data),
  status: () => api.get('/api/generate/status'),
}

// ── Content Library ───────────────────────────────────────────────────────────
export const contentApi = {
  list: (params = {}) => api.get('/api/content', { params }),
  get: (id) => api.get(`/api/content/${id}`),
  updateStatus: (id, status) => api.patch(`/api/content/${id}/status`, { status }),
  channelSummary: (channelId) => api.get(`/api/content/channel/${channelId}/summary`),
}
