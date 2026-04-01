import api from '../lib/axios';

export const loginOperator = async (credentials) => {
  // credentials = { email, password }
  const response = await api.post('https://secure.itecony.net/api/v1/auth/login', credentials);
  return response.data; 
};