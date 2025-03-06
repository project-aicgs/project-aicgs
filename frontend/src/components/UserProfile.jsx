import React from 'react';
import { LogOut } from 'lucide-react';

const UserProfile = ({ user, onLogout }) => {
  const authBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://project-aicgs.onrender.com';
  if (!user) {
    // Show a login button if no user is authenticated
    return (
      <button
        onClick={() => window.location.href = `${authBaseUrl}/api/auth/discord`}
        style={{
          background: 'rgba(88, 101, 242, 0.2)',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '12px',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(88, 101, 242, 0.3)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(88, 101, 242, 0.2)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        Login with Discord
      </button>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 16px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      margin: '0 12px'
    }}>
      <img
        src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`}
        alt={user.username}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '2px solid rgba(99, 102, 241, 0.5)'
        }}
      />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}>
        <span style={{
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {user.username}
        </span>
        <span style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '12px'
        }}>
          Discord Verified
        </span>
      </div>
      <button
        onClick={onLogout}
        style={{
          background: 'none',
          border: 'none',
          padding: '4px',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.5)',
          marginLeft: '8px',
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
      >
        <LogOut size={16} />
      </button>
    </div>
  );
};

export default UserProfile;