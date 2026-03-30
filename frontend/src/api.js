import axios from 'axios';
import { supabase } from './supabaseClient';

const API = axios.create({
  baseURL: '/api',
});


// Attach JWT token if present
API.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export default API;
