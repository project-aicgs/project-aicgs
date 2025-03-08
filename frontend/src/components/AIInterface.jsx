import React, { useState, useEffect } from 'react';
import { Activity, GitBranch, Vote, Book, Twitter, Info, Copy, Menu, X } from 'lucide-react';
import VotingPage from './VotingPage';
import UserProfile from './UserProfile';
import RecentActivity from './RecentActivity';
import TraitVotingStats from './TraitVotingStats';
import { fetchAgents, fetchAuthStatus, fetchTraitStats, fetchStats } from '../api';

const NavButton = ({ icon, label, onClick, highlight, mobileOnly = false }) => (
  <button
    onClick={onClick}
    className={`nav-button ${mobileOnly ? 'mobile-only' : ''}`}
    style={{
      background: highlight ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
      border: 'none',
      padding: '12px 16px',
      borderRadius: '8px',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: mobileOnly ? 'flex-start' : 'center',
      gap: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '14px',
      fontWeight: '500',
      width: mobileOnly ? '100%' : 'auto',
      margin: mobileOnly ? '8px 0' : '0'
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

const AboutSection = ({ setShowAbout }) => (
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
    padding: '20px',
    overflowY: 'auto'
  }}>
    <div style={{
      background: '#0F1117',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      position: 'relative',
      margin: '20px'
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
          cursor: 'pointer',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <X size={24} />
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
    maxWidth: '90vw',
    textAlign: 'center'
  }}>
    Contract Successfully Copied!
  </div>
);

const MobileMenu = ({ isOpen, onClose, authStatus, onLogout, onShowVoting, onShowAbout }) => {
  const authBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://project-aicgs.onrender.com';

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#0F1117',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'none',
          border: 'none',
          color: 'white',
          padding: '8px',
          cursor: 'pointer'
        }}
      >
        <X size={24} />
      </button>

      <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {authStatus?.user ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <img
              src={`https://cdn.discordapp.com/avatars/${authStatus.user.discordId}/${authStatus.user.avatar}.png`}
              alt={authStatus.user.username}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '2px solid rgba(99, 102, 241, 0.5)'
              }}
            />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{authStatus.user.username}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Discord Verified</div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => window.location.href = `${authBaseUrl}/api/auth/discord?redirect=https://aicgs.netlify.app`}
            style={{
              background: 'rgba(88, 101, 242, 0.2)',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '16px',
              width: '100%',
              marginBottom: '24px'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 71 55" fill="currentColor">
              <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
            </svg>
            Login with Discord
          </button>
        )}

        <NavButton 
          icon={<Vote size={20} />} 
          label="Vote on Agents" 
          onClick={() => {
            onShowVoting();
            onClose();
          }}
          mobileOnly={true}
        />
        
        <NavButton 
          icon={<Info size={20} />} 
          label="What is AICGS?" 
          onClick={() => {
            onShowAbout();
            onClose();
          }}
          mobileOnly={true}
        />
        
        <NavButton 
          icon={<Book size={20} />} 
          label="Documentation" 
          onClick={() => window.open('#', '_blank')}
          mobileOnly={true}
        />
        
        <NavButton 
          icon={<Twitter size={20} />} 
          label="Twitter" 
          onClick={() => window.open('#', '_blank')}
          mobileOnly={true}
        />

        {authStatus?.user && (
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '16px',
              width: '100%',
              marginTop: '16px'
            }}
          >
            <LogOut size={20} />
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentView, setCurrentView] = useState('active'); // 'active', 'voting', or 'stats'

  // Check if device is mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const groupedAgents = {
    active: agents.filter(agent => agent.status === 'Active'),
    voting: agents.filter(agent => agent.status === 'Conducting Community Sentiment Analysis'),
    migrating: agents.filter(agent => agent.status === 'Agent Migration Processing')
  };
  
  const authBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://project-aicgs.onrender.com';

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

  // Helper function to render agent cards
  const renderAgentCard = (agent, type) => {
    const isActive = type === 'active';
    
    return (
      <div
        key={agent._id}
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
          marginBottom: '16px',
          animation: 'slideInUp 0.3s ease',
          animationDelay: '0.1s',
          animationFillMode: 'both'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ flex: 1, minWidth: '60%' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{agent.name}</h3>
            {agent.tokenCA && (
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                flexWrap: 'wrap'
              }}>
                <div style={{ 
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  Contract:
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
            background: isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
            color: isActive ? 'rgb(16, 185, 129)' : 'rgb(99, 102, 241)',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0
          }}>
            <Activity size={14} />
            {isActive ? 'Active' : `${agent.votes}/${agent.votesNeeded}`}
          </div>
        </div>

        <p style={{ 
          color: 'rgba(255,255,255,0.7)',
          fontSize: '14px',
          marginBottom: '16px',
          lineHeight: '1.5'
        }}>
          {agent.description}
        </p>

        {isActive ? (
          <>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {agent.marketCap && (
                <div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Market Cap</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>${agent.marketCap}M</div>
                </div>
              )}
              {agent.evolution && (
                <div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Evolution</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{agent.evolution}%</div>
                </div>
              )}
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
          </>
        ) : (
          <>
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

              <button
                onClick={() => setShowVotingPage(true)}
                style={{
                  background: 'rgba(99, 102, 241, 0.3)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  marginTop: '12px',
                  width: '100%',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Vote size={16} />
                Vote for this Agent
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
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
        gap: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid rgba(99, 102, 241, 0.3)',
          borderTopColor: 'rgba(99, 102, 241, 1)',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div>Loading AICGS...</div>
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
        gap: '16px',
        padding: '20px'
      }}>
        <div>{error}</div>
        <button
          onClick={loadAgents}
          style={{
            background: 'rgba(99, 102, 241, 0.2)',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
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
      overflow: 'hidden'
    }}>
      <Notification show={showNotification} />
      
      {/* Navigation */}
      <nav style={{
        padding: isMobile ? '16px' : '20px',
        display: 'flex',
        gap: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {isMobile ? (
          <>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              AICGS
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button
                onClick={() => setShowVotingPage(true)}
                style={{
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <Vote size={20} />
              </button>
              <button
                onClick={() => setShowMobileMenu(true)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <Menu size={20} />
              </button>
            </div>
          </>
        ) : (
          <>
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
                window.location.href = `${authBaseUrl}/api/auth/logout`;
              }}
            />
          </>
        )}
      </nav>

      {/* Introduction Section - Hidden on mobile */}
      {!isMobile && (
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
      )}

      {/* Mobile tab navigation */}
      {isMobile && (
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setCurrentView('active')}
            style={{
              flex: 1,
              padding: '12px',
              background: currentView === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              borderBottom: currentView === 'active' ? '2px solid rgb(16, 185, 129)' : 'none',
              color: currentView === 'active' ? 'rgb(16, 185, 129)' : 'rgba(255,255,255,0.6)',
              border: 'none',
              fontSize: '14px',
              fontWeight: currentView === 'active' ? 'bold' : 'normal'
            }}
          >
            Active Agents
          </button>
          <button
            onClick={() => setCurrentView('voting')}
            style={{
              flex: 1,
              padding: '12px',
              background: currentView === 'voting' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              borderBottom: currentView === 'voting' ? '2px solid rgb(99, 102, 241)' : 'none',
              color: currentView === 'voting' ? 'rgb(99, 102, 241)' : 'rgba(255,255,255,0.6)',
              border: 'none',
              fontSize: '14px',
              fontWeight: currentView === 'voting' ? 'bold' : 'normal'
            }}
          >
            In Voting
          </button>
          <button
            onClick={() => setCurrentView('stats')}
            style={{
              flex: 1,
              padding: '12px',
              background: currentView === 'stats' ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderBottom: currentView === 'stats' ? '2px solid rgba(255,255,255,0.6)' : 'none',
              color: currentView === 'stats' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
              border: 'none',
              fontSize: '14px',
              fontWeight: currentView === 'stats' ? 'bold' : 'normal'
            }}
          >
            Stats
          </button>
        </div>
      )}

      {/* Main content with responsive layout */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '24px',
        padding: isMobile ? '16px' : '20px',
        position: 'relative',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        {/* Mobile view - conditionally show content based on selected tab */}
        {isMobile ? (
          <>
            {currentView === 'active' && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ 
                  fontSize: '18px',
                  color: '#10B981',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#10B981'
                  }}></div>
                  Active AI Agents
                </h2>
                {groupedAgents.active.map(agent => renderAgentCard(agent, 'active'))}
              </div>
            )}

            {currentView === 'voting' && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ 
                  fontSize: '18px',
                  color: '#6366F1',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#6366F1'
                  }}></div>
                  Agents Under Community Review
                </h2>
                {groupedAgents.voting.map(agent => renderAgentCard(agent, 'voting'))}
                
                {groupedAgents.voting.length === 0 && (
                  <div style={{
                    padding: '20px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.5)'
                  }}>
                    No agents currently in voting phase
                  </div>
                )}
              </div>
            )}

            {currentView === 'stats' && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ 
                  fontSize: '18px',
                  color: '#fff',
                  marginBottom: '16px'
                }}>
                  Community Activity
                </h2>
                
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    marginBottom: '16px',
                    color: '#fff'
                  }}>Recent Activity</h3>
                  <div style={{
                    height: '200px',
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch'
                  }}>
                    <RecentActivity />
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    marginBottom: '16px',
                    color: '#fff'
                  }}>Community Stats</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px'
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
            )}
          </>
        ) : (
          <>
            {/* Desktop view - Two Column Layout */}
            <div style={{
              flex: '1 1 70%',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '32px',
              position: 'relative',
              zIndex: 2,
              minHeight: 0
            }}>
              {/* Left Column - Active Agents */}
              <div style={{
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 200px)',
                backgroundColor: '#0F1117',
                borderRadius: '12px',
                padding: '20px'
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
                
                {groupedAgents.active.map(agent => renderAgentCard(agent, 'active'))}
              </div>

              {/* Right Column - Agents Under Review */}
              <div style={{
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 200px)',
                backgroundColor: '#0F1117',
                borderRadius: '12px',
                padding: '20px'
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
                
                {groupedAgents.voting.map(agent => renderAgentCard(agent, 'voting'))}
                
                {groupedAgents.voting.length === 0 && (
                  <div style={{
                    padding: '20px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.5)'
                  }}>
                    No agents currently in voting phase
                  </div>
                )}
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
              maxHeight: 'calc(100vh - 200px)',
              overflow: 'auto'
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
          </>
        )}
      </div>

      {showAbout && <AboutSection setShowAbout={setShowAbout} />}
      
      {showMobileMenu && (
        <MobileMenu 
          isOpen={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
          authStatus={authStatus}
          onLogout={() => {
            window.location.href = `${authBaseUrl}/api/auth/logout`;
          }}
          onShowVoting={() => setShowVotingPage(true)}
          onShowAbout={() => setShowAbout(true)}
        />
      )}

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
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes wave {
          0% { transform: translateY(-100%); opacity: 0.3; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
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
        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }
        body {
          margin: 0;
          padding: 0;
          overscroll-behavior: none;
        }
        .mobile-only {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-only {
            display: flex;
          }
          .desktop-only {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AIInterface;