export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token && token !== 'undefined' && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401 && !endpoint.startsWith('/auth/')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
    throw new Error('Unauthorized');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error || `Request failed with status ${response.status}`);
  }
  
  if (response.status === 204) return null;
  return response.json();
};
