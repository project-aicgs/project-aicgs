// api/index.js - Updated for Token-based Authentication
// Dynamic API URL based on environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://project-aicgs.onrender.com/api';

// Token storage management
const TOKEN_KEY = 'aicgs_auth_token';

// Store the authentication token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// Get the stored authentication token
export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Check URL for token parameter and store it if present
export const checkURLForToken = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    setAuthToken(token);
    
    // Clean up URL
    const newUrl = window.location.pathname + 
      (urlParams.toString() ? '?' + urlParams.toString().replace(/token=[^&]*(&|$)/, '') : '');
    
    window.history.replaceState({}, document.title, newUrl);
    return true;
  }
  
  return false;
};

// Helper for consistent fetch error handling with token auth
const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  
  const defaultOptions = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  };
  
  // Add authentication token if available
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, fetchOptions);
    
    // Check for unauthorized status
    if (response.status === 401) {
      // Clear invalid token
      setAuthToken(null);
      
      // Get the API base URL
      const authBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : 'https://project-aicgs.onrender.com';
      
      // Create redirect URL with current page as redirect target
      const redirectUrl = `${authBaseUrl}/api/auth/discord?redirect=${encodeURIComponent(window.location.href)}&t=${Date.now()}`;
      
      // Instead of redirecting immediately, return error object so calling function can decide
      return { 
        authError: true, 
        message: 'Authentication required',
        redirectTo: redirectUrl
      };
    }
    
    // If not JSON response, handle differently
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`Non-JSON error response: ${response.status} ${response.statusText}`);
      }
      return { success: true, status: response.status };
    }
    
    // Parse JSON response
    const data = await response.json();
    
    // Handle error responses
    if (!response.ok) {
      const error = new Error(data.message || `Error: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
};

export const verifyToken = async () => {
  const token = getAuthToken();
  
  if (!token) {
    return { isAuthenticated: false, user: null };
  }
  
  try {
    const data = await fetchWithAuth(`${API_URL}/auth/verify-token`, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    
    // Check for auth error response
    if (data.authError) {
      setAuthToken(null);
      return { isAuthenticated: false, user: null };
    }
    
    return data;
  } catch (error) {
    console.error('Error verifying token:', error);
    setAuthToken(null);
    return { isAuthenticated: false, user: null };
  }
};

export const fetchAuthStatus = async () => {
  try {
    // Check URL for token first
    const hasNewToken = checkURLForToken();
    
    // If we just got a new token, verify it
    if (hasNewToken) {
      return await verifyToken();
    }
    
    // Otherwise check current auth status
    const data = await fetchWithAuth(`${API_URL}/auth/status`);
    
    // Check for auth error response
    if (data.authError) {
      return { isAuthenticated: false, user: null };
    }
    
    console.log("Auth status response:", data);
    return data;
  } catch (error) {
    console.error('Error fetching auth status:', error);
    return { isAuthenticated: false, user: null };
  }
};

export const logout = async () => {
  const token = getAuthToken();
  
  try {
    await fetchWithAuth(`${API_URL}/auth/logout`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    // Always clear local token regardless of server response
    setAuthToken(null);
  }
};

export const fetchAgents = async () => {
  try {
    const data = await fetchWithAuth(`${API_URL}/agents`);
    
    // Check for auth error response
    if (data.authError) {
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

export const fetchRecentActivities = async () => {
  try {
    const data = await fetchWithAuth(`${API_URL}/activities/recent`);
    
    // Check for auth error response
    if (data.authError) {
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

export const fetchTraitStats = async (agentId) => {
  try {
    const data = await fetchWithAuth(`${API_URL}/votes/trait-stats/${agentId}`);
    
    // Check for auth error response
    if (data.authError) {
      return { traitStats: {} };
    }
    
    return data || { traitStats: {} };
  } catch (error) {
    console.error('Error fetching trait stats:', error);
    throw error;
  }
};

export const getRemainingVotes = async () => {
  try {
    const data = await fetchWithAuth(`${API_URL}/votes/remaining`);
    
    // Check for auth error response
    if (data.authError) {
      return { remainingVotes: 0 };
    }
    
    return data || { remainingVotes: 0 };
  } catch (error) {
    console.error('Error fetching remaining votes:', error);
    return { remainingVotes: 0 };
  }
};

export const fetchStats = async () => {
  try {
    const data = await fetchWithAuth(`${API_URL}/votes/stats`);
    
    // Check for auth error response
    if (data.authError) {
      return { totalVotes: 0, uniqueVoters: 0 };
    }
    
    return data || { totalVotes: 0, uniqueVoters: 0 };
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

export const castVote = async (agentId, selectedTraits) => {
  try {
    const data = await fetchWithAuth(`${API_URL}/votes`, {
      method: 'POST',
      body: JSON.stringify({
        agentId,
        selectedTraits
      }),
    });
    
    // Check for auth error response
    if (data.authError) {
      // Return without redirecting to let calling code decide how to handle it
      return data;
    }
    
    return data;
  } catch (error) {
    console.error('Error in castVote:', error);
    
    // Rethrow the error to let the caller handle it
    throw error;
  }
};