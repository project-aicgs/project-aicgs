import React, { useState, useEffect } from 'react';
import { GitBranch, Sparkles, Activity } from 'lucide-react';

const AgentGrid = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: "Genesis Alpha",
      tokenCA: "0x742...3df",
      marketCap: 15.7,
      volume24h: 2.4,
      generation: 1,
      children: 3,
      traits: ["Adaptive", "Analytical"],
      color: "#9333ea"
    },
    {
      id: 2,
      name: "Neural Beta",
      tokenCA: "0x823...4ef",
      marketCap: 12.3,
      volume24h: 1.8,
      generation: 2,
      children: 2,
      traits: ["Creative", "Fast"],
      color: "#ec4899"
    },
    {
      id: 3,
      name: "Quantum Nexus",
      tokenCA: "0x934...5fg",
      marketCap: 8.9,
      volume24h: 1.2,
      generation: 2,
      children: 1,
      traits: ["Quantum", "Stable"],
      color: "#3b82f6"
    }
  ]);

  const AgentCard = ({ agent, index }) => {
    const isSelected = selectedAgent?.id === agent.id;
    const baseDelay = index * 0.1;

    return (
      <div
        className="agent-card"
        style={{
          animation: `fadeSlideIn 0.6s ${baseDelay}s both`,
          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
          opacity: selectedAgent && !isSelected ? 0.6 : 1,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: isSelected 
            ? '0 20px 40px rgba(0,0,0,0.1), 0 0 20px rgba(147, 51, 234, 0.1)' 
            : '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={() => setSelectedAgent(isSelected ? null : agent)}
      >
        {/* Background gradient blobs */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle at 50% 50%, ${agent.color}15, transparent 70%)`,
          opacity: 0.5,
          zIndex: 0,
          transition: 'all 0.3s ease',
          transform: isSelected ? 'scale(1.2)' : 'scale(1)'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${agent.color}, ${agent.color}99)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              {agent.generation}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{agent.name}</h3>
              <div style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
                {agent.tokenCA}
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isSelected ? '1fr 1fr' : '1fr',
            gap: '16px',
            transition: 'all 0.3s ease'
          }}>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Market Cap</div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '600',
                background: `linear-gradient(135deg, ${agent.color}, #333)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                ${agent.marketCap}M
              </div>
            </div>

            {isSelected && (
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>24h Vol</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#333' }}>
                  ${agent.volume24h}M
                </div>
              </div>
            )}
          </div>

          {isSelected && (
            <div style={{ 
              marginTop: '16px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              animation: 'fadeIn 0.3s ease'
            }}>
              {agent.traits.map((trait, i) => (
                <span
                  key={i}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    background: `${agent.color}15`,
                    color: agent.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={12} />
                  {trait}
                </span>
              ))}
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            padding: '8px',
            borderRadius: '8px',
            background: 'rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color={agent.color} />
              <span style={{ fontSize: '14px', color: '#666' }}>Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GitBranch size={16} color={agent.color} />
              <span style={{ fontSize: '14px', color: '#666' }}>{agent.children}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6f7f8 0%, #f0f1f5 100%)',
      padding: '40px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 10% 10%, rgba(147, 51, 234, 0.1), transparent 30%), radial-gradient(circle at 90% 90%, rgba(236, 72, 153, 0.1), transparent 30%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {agents.map((agent, index) => (
          <AgentCard key={agent.id} agent={agent} index={index} />
        ))}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .agent-card:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
};

export default AgentGrid;