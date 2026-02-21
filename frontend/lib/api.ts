import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
}

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
}

export const itemAPI = {
  getAll: () => api.get('/items'),
  create: (data: any) => api.post('/items', data),
  update: (id: string, data: any) => api.put(`/items/${id}`, data),
  delete: (id: string) => api.delete(`/items/${id}`),
}

export const uploadAPI = {
  uploadFile: (formData: FormData) => api.post('/upload/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}

export default api
