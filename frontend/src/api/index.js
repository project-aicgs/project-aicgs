// api/index.js
// Dynamic API URL based on environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://project-aicgs.onrender.com/api';

// Helper for consistent fetch error handling
const fetchWithCredentials = async (url, options = {}) => {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      // Removed Cache-Control header as it's causing CORS issues
    },
  };

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
    
    // Check for redirect response
    if (response.redirected) {
      console.log(`Redirected to: ${response.url}`);
      window.location.href = response.url;
      return null;
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

export const fetchAuthStatus = async () => {
  try {
    const data = await fetchWithCredentials(`${API_URL}/auth/status`);
    console.log("Auth status response:", data);
    return data || { isAuthenticated: false, user: null };
  } catch (error) {
    console.error('Error fetching auth status:', error);
    return { isAuthenticated: false, user: null };
  }
};

export const fetchAgents = async () => {
  try {
    const data = await fetchWithCredentials(`${API_URL}/agents`);
    return data || [];
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

export const fetchRecentActivities = async () => {
  try {
    const data = await fetchWithCredentials(`${API_URL}/activities/recent`);
    return data || [];
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

export const fetchTraitStats = async (agentId) => {
  try {
    const data = await fetchWithCredentials(`${API_URL}/votes/trait-stats/${agentId}`);
    return data || { traitStats: {} };
  } catch (error) {
    console.error('Error fetching trait stats:', error);
    throw error;
  }
};

export const getRemainingVotes = async () => {
  try {
    const data = await fetchWithCredentials(`${API_URL}/votes/remaining`);
    return data || { remainingVotes: 0 };
  } catch (error) {
    // For 401 errors, just return 0 as the user isn't authenticated
    if (error.status === 401) {
      return { remainingVotes: 0 };
    }
    console.error('Error fetching remaining votes:', error);
    throw error;
  }
};

export const fetchStats = async () => {
  try {
    const data = await fetchWithCredentials(`${API_URL}/votes/stats`);
    return data || { totalVotes: 0, uniqueVoters: 0 };
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

export const castVote = async (agentId, selectedTraits) => {
  try {
    const data = await fetchWithCredentials(`${API_URL}/votes`, {
      method: 'POST',
      body: JSON.stringify({
        agentId,
        selectedTraits
      }),
    });
    
    // If we get redirected (for auth), the fetchWithCredentials will handle it
    if (!data) return null;
    
    return data;
  } catch (error) {
    console.error('Error in castVote:', error);
    
    // Handle 401 authentication errors specially
    if (error.status === 401) {
      const authBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : 'https://project-aicgs.onrender.com';
        
      window.location.href = `${authBaseUrl}/api/auth/discord?redirect=https://aicgs.netlify.app/?showVoting=true&t=${Date.now()}`;
      return null;
    }
    
    throw error;
  }
};