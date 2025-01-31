// components/TraitVotingStats.jsx
import React, { useState, useEffect } from 'react';

const TraitVotingStats = ({ agent, traitStats = {} }) => {
  const maxVotes = Math.max(...Object.values(traitStats));

  return (
    <div style={{
      marginTop: '12px',
      background: 'rgba(99, 102, 241, 0.1)',
      borderRadius: '8px',
      padding: '12px'
    }}>
      <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>
        Trait Vote Distribution
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {agent.proposedTraits.map((trait) => (
          <div key={trait}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontSize: '12px'
            }}>
              <span>{trait}</span>
              <span>{traitStats[trait] || 0} votes</span>
            </div>
            <div style={{
              height: '4px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div 
                style={{
                  height: '100%',
                  width: `${maxVotes ? ((traitStats[trait] || 0) / maxVotes) * 100 : 0}%`,
                  background: 'rgb(99, 102, 241)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TraitVotingStats;