import React, { useState, useEffect } from 'react';
import { fetchRecentActivities } from '../api/index.js';

const getTimeAgo = (timestamp) => {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);

  if (seconds < 60) {
    if (seconds < 30) {
      return 'just now';
    }
    return `${seconds} seconds ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
};

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);

  const fetchActivities = async () => {
    try {
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
    } catch (err) {
      setError('Failed to load recent activities');
      console.error('Error fetching activities:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchActivities();
  }, []);

  // Poll for updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update time ago strings every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(current => [...current]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div style={{
        padding: '12px',
        background: 'rgba(239, 68, 68, 0.1)',
        borderRadius: '8px',
        color: '#EF4444',
        fontSize: '14px'
      }}>
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
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '2px solid rgba(99, 102, 241, 0.5)'
                }}
              />
            )}
            
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px' }}>
                <span style={{ color: '#818CF8' }}>
                  {activity.userId?.username || 'Unknown User'}
                </span>
                {' voted for '}
                <span style={{ color: '#818CF8' }}>
                  {activity.agentId?.name || 'Unknown Agent'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
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
      `}</style>
    </div>
  );
};

export default RecentActivity;