import axios from 'axios'

const baseUrl = '/api'
let token = null

const setToken = (newToken) => { token = `Bearer ${newToken}` }
const config = () => token ? { headers: { Authorization: token } } : {}

export default {
  setToken,
  login: async (credentials) => (await axios.post(`${baseUrl}/login`, credentials)).data,
  getBlogs: async () => (await axios.get(`${baseUrl}/blogs`)).data,
  getBlog: async (id) => (await axios.get(`${baseUrl}/blogs/${id}`)).data,
  createBlog: async (blog) => (await axios.post(`${baseUrl}/blogs`, blog, config())).data,
  updateBlog: async (blog) => (await axios.put(`${baseUrl}/blogs/${blog.id}`, blog)).data,
  deleteBlog: async (id) => axios.delete(`${baseUrl}/blogs/${id}`, config()),
  getUsers: async () => (await axios.get(`${baseUrl}/users`)).data,
}
