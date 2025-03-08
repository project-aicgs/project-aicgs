import React, { useState, useEffect } from 'react';
import { fetchRecentActivities } from '../api/index.js';

const getTimeAgo = (timestamp) => {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);

  if (seconds < 60) {
    if (seconds < 30) {
      return 'just now';
    }
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days}d ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months}mo ago`;
  }

  const years = Math.floor(days / 365);
  return `${years}y ago`;
};

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if device is mobile
  const isMobile = window.innerWidth <= 768;

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await fetchRecentActivities();
      // Filter out any activities with missing data
      const validActivities = data.filter(activity => 
        activity.userId && 
        activity.agentId && 
        activity.userId.username && 
        activity.userId.avatar && 
        activity.userId.discordId && 
        activity.agentId.name
      );
      setActivities(validActivities);
      setError(null);
    } catch (err) {
      setError('Failed to load recent activities');
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchActivities();
  }, []);

  // Poll for updates every 10 seconds instead of 5 - better for battery life
  useEffect(() => {
    const interval = setInterval(fetchActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update time ago strings every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(current => [...current]);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && activities.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        height: '100%'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: '2px solid rgba(99, 102, 241, 0.3)',
          borderTopColor: 'rgba(99, 102, 241, 1)',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '12px',
        background: 'rgba(239, 68, 68, 0.1)',
        borderRadius: '8px',
        color: '#EF4444',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        {error}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {activities.length > 0 ? (
        activities.map((activity) => (
          <div
            key={activity._id}
            style={{
              padding: '12px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            {activity.userId && activity.userId.avatar && (
              <img
                src={`https://cdn.discordapp.com/avatars/${activity.userId.discordId}/${activity.userId.avatar}.png`}
                alt={activity.userId.username}
                style={{
                  width: isMobile ? '28px' : '32px',
                  height: isMobile ? '28px' : '32px',
                  borderRadius: '50%',
                  border: '2px solid rgba(99, 102, 241, 0.5)',
                  flexShrink: 0
                }}
                onError={(e) => {
                  // Fallback if avatar doesn't load
                  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>';
                }}
              />
            )}
            
            <div style={{ flex: 1, minWidth: 0 }}> {/* minWidth: 0 helps with text overflow */}
              <div style={{ 
                fontSize: isMobile ? '13px' : '14px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                <span style={{ color: '#818CF8' }}>
                  {activity.userId?.username || 'Unknown User'}
                </span>
                {' voted for '}
                <span style={{ color: '#818CF8' }}>
                  {activity.agentId?.name || 'Unknown Agent'}
                </span>
              </div>
              <div style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                color: 'rgba(255,255,255,0.5)'
              }}>
                {getTimeAgo(activity.timestamp)}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div style={{
          padding: '12px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '8px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '14px'
        }}>
          No recent activity
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RecentActivity;