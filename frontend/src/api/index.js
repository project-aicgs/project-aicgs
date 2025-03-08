// api/index.js
// Dynamic API URL based on environment
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://project-aicgs.onrender.com/api';

export const fetchAuthStatus = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/status`, {
      credentials: 'include'
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching auth status:', error);
    return { isAuthenticated: false, user: null };
  }
};

export const fetchAgents = async () => {
  try {
    const response = await fetch(`${API_URL}/agents`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

export const fetchRecentActivities = async () => {
  try {
    const response = await fetch(`${API_URL}/activities/recent`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

export const fetchTraitStats = async (agentId) => {
  try {
    const response = await fetch(`${API_URL}/votes/trait-stats/${agentId}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch trait stats');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching trait stats:', error);
    throw error;
  }
};

export const getRemainingVotes = async () => {
  try {
    const response = await fetch(`${API_URL}/votes/remaining`, {
      credentials: 'include'
    });
    if (!response.ok) {
      if (response.status === 401) {
        return { remainingVotes: 0 };
      }
      throw new Error('Failed to fetch remaining votes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching remaining votes:', error);
    throw error;
  }
};

export const fetchStats = async () => {
  try {
    const response = await fetch(`${API_URL}/votes/stats`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

export const castVote = async (agentId, selectedTraits) => {
  try {
    const response = await fetch(`${API_URL}/votes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        agentId,
        selectedTraits
      }),
    });

    if (response.status === 401) {
      const data = await response.json();
      // Redirect to authentication first, then return to voting
      window.location.href = data.redirectTo || `${API_URL.replace('/api', '')}/api/auth/discord?redirect=https://aicgs.netlify.app/?showVoting=true`;
      return null;
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to cast vote');
    }

    return data;
  } catch (error) {
    console.error('Error in castVote:', error);
    throw error;
  }
};