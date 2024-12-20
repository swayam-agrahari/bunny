import axios from 'axios';


const baseUrl = import.meta.env.MODE === 'development' ? 'http://localhost:5001/' : 'https://bunny-editor.toolforge.org/';

export const backendApi = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default backendApi;