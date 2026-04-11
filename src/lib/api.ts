import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: 'http://localhost:3030'
})

// Add a request interceptor to add the token to every request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('feathers-jwt')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default api
