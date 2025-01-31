import React, { useState, useEffect } from 'react';
import { Activity, GitBranch, Vote, Book, Twitter, Info, Copy } from 'lucide-react';
import VotingPage from './VotingPage';
import UserProfile from './UserProfile';
import RecentActivity from './RecentActivity';
import TraitVotingStats from './TraitVotingStats';
import { fetchAgents, fetchAuthStatus, fetchTraitStats, fetchStats } from '../api';

const NavButton = ({ icon, label, onClick, highlight }) => (
  <button
    onClick={onClick}
    className="nav-button"
    style={{
      background: highlight ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '14px',
      fontWeight: '500'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
      e.currentTarget.style.transform = 'translateY(-1px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = highlight ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    {icon}
    {label}
  </button>
);

const AboutSection = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  }}>
    <div style={{
      background: '#0F1117',
      borderRadius: '16px',
      padding: '32px',
      maxWidth: '800px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      position: 'relative'
    }}>
      <button
        onClick={() => setShowAbout(false)}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        ✕
      </button>
      
      <h2 style={{ marginBottom: '24px', color: 'white', fontSize: '24px' }}>
        What is AICGS?
      </h2>
      
      <div style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
        <p>
          AI Community Governance System (AICGS) represents a revolutionary approach to AI development 
          through decentralized community governance. While inspired by systems like Spore.fun, AICGS 
          takes a unique approach by placing the power of AI evolution directly in the hands of the community.
        </p>
        
        <h3 style={{ margin: '24px 0 12px', color: 'white', fontSize: '18px' }}>
          Key Features
        </h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Community-Driven Evolution: All new AI agents are proposed and voted on by the community</li>
          <li>Transparent Governance: Every development stage is visible and community-approved</li>
          <li>Democratic Development: Features and capabilities are determined by collective decision-making</li>
          <li>Sustainable Growth: Controlled evolution ensures stability and security</li>
        </ul>

        <h3 style={{ margin: '24px 0 12px', color: 'white', fontSize: '18px' }}>
          How It Works
        </h3>
        <ol style={{ paddingLeft: '20px' }}>
          <li>Community members propose new AI agent characteristics</li>
          <li>Proposals enter the Community Sentiment Analysis phase</li>
          <li>Once voting threshold of 750 votes is reached, development begins</li>
          <li>New AI agents are deployed with community-approved features</li>
        </ol>
      </div>
    </div>
  </div>
);

const Notification = ({ show }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: '50%',
    transform: `translate(-50%, ${show ? '0' : '-100%'})`,
    background: '#10B981',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '0 0 8px 8px',
    transition: 'transform 0.3s ease',
    zIndex: 9999,
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  }}>
    Contract Successfully Copied!
  </div>
);

const AIInterface = () => {
  const [selectedAI, setSelectedAI] = useState(null);
  const [showVoting, setShowVoting] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showVotingPage, setShowVotingPage] = useState(false);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  const [traitStats, setTraitStats] = useState({});
  const [uniqueVoters, setUniqueVoters] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  const groupedAgents = {
    active: agents.filter(agent => agent.status === 'Active'),
    voting: agents.filter(agent => agent.status === 'Conducting Community Sentiment Analysis'),
    migrating: agents.filter(agent => agent.status === 'Agent Migration Processing')
  };

  // Check URL parameters for voting page display
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('showVoting') === 'true') {
      setShowVotingPage(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 1750);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Load stats including unique voters
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await fetchStats();
        setUniqueVoters(stats.uniqueVoters);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const status = await fetchAuthStatus();
        setAuthStatus(status);
      } catch (err) {
        console.error('Error checking auth status:', err);
      }
    };
    checkAuth();
  }, []);

  const loadAgents = async () => {
    try {
      const fetchedAgents = await fetchAgents();
      setAgents(fetchedAgents);
      setLoading(false);
    } catch (err) {
      setError('Failed to load agents');
      setLoading(false);
    }
  };

  const loadTraitStats = async (agentId) => {
    try {
      const { traitStats } = await fetchTraitStats(agentId);
      setTraitStats(prev => ({
        ...prev,
        [agentId]: traitStats
      }));
    } catch (error) {
      console.error('Error loading trait stats:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadAgents();
  }, []);

  // Load trait stats for all agents in voting phase
  useEffect(() => {
    const votingAgents = agents.filter(agent => 
      agent.status === 'Conducting Community Sentiment Analysis'
    );
    votingAgents.forEach(agent => loadTraitStats(agent._id));
  }, [agents]);

  // Polling for updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadAgents();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#0F1117',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Loading agents...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#0F1117',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>{error}</div>
        <button
          onClick={loadAgents}
          style={{
            background: 'rgba(99, 102, 241, 0.2)',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0F1117',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto'
    }}>
      <Notification show={showNotification} />
      
      {/* Navigation */}
      <nav style={{
        padding: '20px',
        display: 'flex',
        gap: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <NavButton 
            icon={<Info size={16} />} 
            label="What is AICGS?" 
            onClick={() => setShowAbout(true)}
          />
          <NavButton 
            icon={<Vote size={16} />} 
            label="Vote" 
            onClick={() => setShowVotingPage(true)}
            highlight={showVotingPage}
          />
          <NavButton 
            icon={<Book size={16} />} 
            label="Docs" 
            onClick={() => window.open('#', '_blank')}
          />
          <NavButton 
            icon={<Twitter size={16} />} 
            label="Twitter" 
            onClick={() => window.open('#', '_blank')}
          />
        </div>
        
        <UserProfile 
          user={authStatus?.user}
          onLogout={() => {
            window.location.href = 'http://localhost:5000/api/auth/logout';
          }}
        />
      </nav>

      {/* Introduction Section */}
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, transparent)',
        position: 'relative',
        zIndex: 2
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          AI Community Governance System
        </h1>
        <p style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          color: 'rgba(255,255,255,0.7)',
          lineHeight: '1.6'
        }}>
          Explore and participate in the evolution of AI agents through decentralized community governance.
          Vote on upcoming agents and shape the future of AI development.
        </p>
      </div>

      {/* Main content with sidebar layout */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '24px',
        padding: '20px',
        position: 'relative'
      }}>
        {/* Main content area - Two Column Layout */}
        <div style={{
          flex: '1 1 70%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          position: 'relative',
          zIndex: 2,
          padding: '1rem',
          minHeight: 0
        }}>
          {/* Left Column - Active Agents */}
          <div style={{
            overflowY: 'auto',
            maxHeight: 'calc(100vh)',
            backgroundColor: '#0F1117',
            borderRadius: '12px'
          }}>
            <div style={{ 
              padding: '0.5rem',
              position: 'sticky',
              top: 0,
              background: '#0F1117',
              zIndex: 1,
              marginBottom: '1.5rem',
              borderBottom: '2px solid rgba(16, 185, 129, 0.2)'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                color: '#10B981',
                padding: '0.5rem'
              }}>
                Active AI Agents
              </h2>
            </div>
            <div style={{ padding: '0.5rem' }}>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                {groupedAgents.active.map((agent) => (
                  <div
                    key={agent._id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '12px',
                      padding: '24px',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{agent.name}</h3>
                        {agent.tokenCA && (
                          <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <div style={{ 
                              fontSize: '13px',
                              color: 'rgba(255,255,255,0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              Contract Address:
                              <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)' }}>
                                {`${agent.tokenCA.slice(0, 4)}...${agent.tokenCA.slice(-4)}`}
                              </span>
                              <Copy
                                size={14}
                                style={{
                                  cursor: 'pointer',
                                  opacity: 0.7,
                                  transition: 'opacity 0.2s',
                                  flexShrink: 0
                                }}
                                onClick={() => copyToClipboard(agent.tokenCA)}
                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '999px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: 'rgb(16, 185, 129)',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexShrink: 0,
                        marginLeft: '16px'
                      }}>
                        <Activity size={14} />
                        Active
                      </div>
                    </div>

                    <p style={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '14px',
                      marginBottom: '16px'
                    }}>
                      {agent.description}
                    </p>

                    <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Market Cap</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>${agent.marketCap}M</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Evolution</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{agent.evolution}%</div>
                      </div>
                    </div>

                    {agent.twitterHandle && (
                      <div style={{
                        marginTop: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#1DA1F2'
                      }}>
                        <Twitter size={16} />
                        <a 
                          href={`https://twitter.com/${agent.twitterHandle.slice(1)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'inherit' }}
                        >
                          {agent.twitterHandle}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Agents Under Review */}
          <div style={{
            overflowY: 'auto',
            maxHeight: 'calc(100vh)',
            backgroundColor: '#0F1117',
            borderRadius: '12px'
          }}>
            <div style={{ 
              padding: '0.5rem',
              position: 'sticky',
              top: 0,
              background: '#0F1117',
              zIndex: 1,
              marginBottom: '1.5rem',
              borderBottom: '2px solid rgba(99, 102, 241, 0.2)'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                color: '#6366F1',
                padding: '0.5rem'
              }}>
                Agents Under Community Review
              </h2>
            </div>
            <div style={{ padding: '0.5rem' }}>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                {groupedAgents.voting.map((agent) => (
                  <div
                    key={agent._id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '12px',
                      padding: '24px',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginBottom: '16px'
                    }}>
                      <div>
                        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{agent.name}</h3>
                        <p style={{ 
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: '14px'
                        }}>
                          {agent.description}
                        </p>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '999px',
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: 'rgb(99, 102, 241)',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        height: 'fit-content'
                      }}>
                        <Activity size={14} />
                        {agent.votes}/{agent.votesNeeded}
                      </div>
                    </div>

                    <div style={{
                      marginTop: '16px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', marginBottom: '4px' }}>Progress</div>
                          <div style={{ 
                            height: '6px', 
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '3px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${(agent.votes / agent.votesNeeded) * 100}%`,
                              background: 'rgb(99, 102, 241)',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                      </div>

                      <TraitVotingStats 
                        agent={agent} 
                        traitStats={traitStats[agent._id] || {}} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{
          flex: '1 1 30%',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          padding: '20px',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          height: '100%'
        }}>
          {/* Recent Activity - Fixed height box with internal scroll */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '8px',
            padding: '16px',
            height: '280px', // Fixed height to show ~4 entries
            flexShrink: 0   // Prevent compression
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              marginBottom: '16px',
              color: '#fff'
            }}>Recent Activity</h3>
            <div style={{
              height: 'calc(100% - 50px)', // Subtract header height
              overflowY: 'auto',
              paddingRight: '8px'
            }}>
              <RecentActivity />
            </div>
          </div>

          {/* Community Stats - Fixed at bottom */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '8px',
            padding: '16px',
            flexShrink: 0 // Prevent compression
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              marginBottom: '16px',
              color: '#fff' 
            }}>Community Stats</h3>
            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Total Votes Cast</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {agents.reduce((total, agent) => total + agent.votes, 0)}
                </div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Unique Voters</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {uniqueVoters || 0}
                </div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Active Proposals</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {groupedAgents.voting.length}
                </div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Active Agents</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {groupedAgents.active.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAbout && <AboutSection />}

      {showVotingPage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#0F1117',
          zIndex: 1000,
        }}>
          <VotingPage 
            agents={agents.filter(agent => 
              agent.status === 'Conducting Community Sentiment Analysis' && 
              agent.votes < agent.votesNeeded
            )}
            onBack={() => setShowVotingPage(false)}
            onVote={async (agentId, selectedTraits) => {
              try {
                await loadAgents();
                setShowVotingPage(false);
              } catch (error) {
                console.error('Error refreshing agents:', error);
              }
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes wave {
          0% { transform: translateY(-100%); opacity: 0.3; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </div>
  );
};

export default AIInterface;