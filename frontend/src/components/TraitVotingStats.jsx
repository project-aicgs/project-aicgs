// components/TraitVotingStats.jsx
import React from 'react';

const TraitVotingStats = ({ agent, traitStats = {} }) => {
  // Check if device is mobile
  const isMobile = window.innerWidth <= 768;
  
  const maxVotes = Object.values(traitStats).length > 0 
    ? Math.max(...Object.values(traitStats))
    : 1; // Avoid division by zero
  
  const getTotalVotes = () => {
    return Object.values(traitStats).reduce((sum, votes) => sum + votes, 0);
  };
  
  const totalVotes = getTotalVotes();

  return (
    <div style={{
      marginTop: '12px',
      background: 'rgba(99, 102, 241, 0.1)',
      borderRadius: '8px',
      padding: '12px',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{ 
        fontSize: isMobile ? '13px' : '14px', 
        color: 'rgba(255,255,255,0.8)', 
        marginBottom: '10px',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Trait Votes</span>
        {totalVotes > 0 && (
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: isMobile ? '12px' : '13px' }}>
            {totalVotes} total votes
          </span>
        )}
      </div>
      
      {Object.keys(traitStats).length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {agent.proposedTraits.map((trait) => {
            const voteCount = traitStats[trait] || 0;
            const percentage = maxVotes ? Math.round((voteCount / maxVotes) * 100) : 0;
            
            return (
              <div key={trait}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                  fontSize: isMobile ? '12px' : '13px',
                  alignItems: 'center'
                }}>
                  <span style={{ fontWeight: voteCount > 0 ? '500' : 'normal' }}>{trait}</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {voteCount} {isMobile ? '' : 'vote'}{voteCount !== 1 && !isMobile ? 's' : ''}
                  </span>
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
                      width: `${percentage}%`,
                      background: 'rgb(99, 102, 241)',
                      transition: 'width 0.5s ease',
                      minWidth: voteCount > 0 ? '4px' : '0'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ 
          color: 'rgba(255,255,255,0.5)', 
          fontSize: isMobile ? '12px' : '13px',
          padding: '4px 0',
          textAlign: 'center'
        }}>
          No votes yet. Be the first to vote!
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default TraitVotingStats;