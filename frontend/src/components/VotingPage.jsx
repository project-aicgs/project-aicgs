import React, { useState, useEffect } from 'react';
import { Vote, ArrowLeft, Check, AlertCircle, X, Loader } from 'lucide-react';
import { fetchAgents, castVote, getRemainingVotes, fetchTraitStats, fetchAuthStatus } from '../api';
import TraitVotingStats from './TraitVotingStats';

const VotingPage = ({ onBack = () => {}, onVote = () => {} }) => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [remainingVotes, setRemainingVotes] = useState(100);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [voteErrors, setVoteErrors] = useState({});
  const [traitStats, setTraitStats] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Detect if device is mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsCheckingAuth(true);
        const status = await fetchAuthStatus();
        console.log("Auth status:", status);
        setIsAuthenticated(status.isAuthenticated);
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAgents();
      loadRemainingVotes();
    }
  }, [isAuthenticated]);

  const loadAgents = async () => {
    try {
      const agentsData = await fetchAgents();
      console.log("Loaded agents:", agentsData.length);
      setAgents(agentsData.filter(agent => 
        agent.status === 'Conducting Community Sentiment Analysis' &&
        agent.votes < agent.votesNeeded
      ));
    } catch (error) {
      console.error("Error loading agents:", error);
      setVoteErrors({ global: 'Failed to load agents. Please try again later.' });
    }
  };

  const loadRemainingVotes = async () => {
    try {
      const data = await getRemainingVotes();
      console.log("Remaining votes:", data.remainingVotes);
      setRemainingVotes(data.remainingVotes);
    } catch (error) {
      console.error('Error loading remaining votes:', error);
    }
  };

  const loadTraitStats = async (agentId) => {
    try {
      const { traitStats } = await fetchTraitStats(agentId);
      setTraitStats(traitStats);
    } catch (error) {
      console.error('Error loading trait stats:', error);
    }
  };

  const handleAgentSelect = async (agent) => {
    setSelectedAgent(agent);
    setSelectedTraits([]);
    await loadTraitStats(agent._id);
  };

  const handleTraitSelection = (trait) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
    } else {
      setSelectedTraits([...selectedTraits, trait]);
    }
  };

  const handleVoteSubmit = async () => {
    if (!selectedAgent || selectedTraits.length === 0) return;
    
    setIsVoting(true);
    try {
      console.log("Submitting vote for:", selectedAgent.name);
      console.log("Selected traits:", selectedTraits);
      
      const response = await castVote(
        selectedAgent._id,
        selectedTraits
      );
      
      if (response) {  // Only proceed if we got a response (not redirected)
        await loadAgents();
        await loadRemainingVotes();
        setShowConfirmation(false);
        setShowSuccess(true);
        onVote(selectedAgent._id, selectedTraits);
        
        setTimeout(() => {
          setShowSuccess(false);
          setSelectedAgent(null);
          setSelectedTraits([]);
        }, 2000);
        
        // Clear any errors for this agent
        setVoteErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[selectedAgent._id];
          return newErrors;
        });
      }
    } catch (error) {
      console.error("Vote submission error:", error);
      setVoteErrors(prev => ({
        ...prev,
        [selectedAgent._id]: error.message || 'Failed to cast vote. Please try again.'
      }));
      setShowConfirmation(false);
    } finally {
      setIsVoting(false);
    }
  };

  // If checking auth, show loading
  if (isCheckingAuth) {
    return (
      <div style={{
        height: '100vh',
        backgroundColor: '#111827',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ 
          animation: 'spin 1s linear infinite',
          width: '2rem',
          height: '2rem',
          border: '3px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '50%',
          borderTop: '3px solid rgba(99, 102, 241, 1)',
        }} />
        <div>Checking authentication status...</div>
      </div>
    );
  }

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    const authBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000'
      : 'https://project-aicgs.onrender.com';
      
    return (
      <div style={{
        height: '100vh',
        backgroundColor: '#111827',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '2rem'
      }}>
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '1.5rem',
            left: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: '#9CA3AF',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <ArrowLeft size={20} />
          {!isMobile && "Back"}
        </button>
        
        <div style={{
          maxWidth: isMobile ? '100%' : '32rem',
          width: '100%',
          background: '#1F2937',
          borderRadius: '0.75rem',
          padding: isMobile ? '1.5rem' : '2rem',
          textAlign: 'center',
          margin: isMobile ? '0 1rem' : '0'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Authentication Required
          </h2>
          <p style={{ color: '#D1D5DB', marginBottom: '2rem' }}>
            You need to be logged in with Discord to vote on AI agents. 
            Your authentication helps us prevent spam and ensure fair voting.
          </p>
          <button
            onClick={() => {
              // Add a timestamp to prevent caching issues
              window.location.href = `${authBaseUrl}/api/auth/discord?redirect=https://aicgs.netlify.app/?showVoting=true&t=${Date.now()}`;
            }}
            style={{
              backgroundColor: 'rgba(88, 101, 242, 0.8)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              margin: '0 auto',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minHeight: '44px' // Better touch target size
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(88, 101, 242, 1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(88, 101, 242, 0.8)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 71 55" fill="none">
              <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="currentColor"/>
            </svg>
            Login with Discord
          </button>
        </div>
      </div>
    );
  }

  // Check if there are no agents
  if (agents.length === 0 && !loading) {
    return (
      <div style={{
        height: '100vh',
        backgroundColor: '#111827',
        color: 'white',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: isMobile ? '1rem' : '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#9CA3AF',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={20} />
            {!isMobile && "Back"}
          </button>
          <h1 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 'bold' }}>Community Voting</h1>
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.1)',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem'
          }}>
            Votes: {remainingVotes}
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          flex: 1,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '6rem',
            marginBottom: '1rem',
            opacity: 0.5
          }}>
            🗳️
          </div>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>No Agents Available for Voting</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '500px', marginBottom: '2rem' }}>
            There are currently no AI agents in the community review phase. 
            Check back soon for new proposals!
          </p>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(99, 102, 241, 0.2)',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ArrowLeft size={16} />
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#111827',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: isMobile ? '1rem' : '1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#9CA3AF',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
          {!isMobile && "Back"}
        </button>
        <h1 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 'bold' }}>Community Voting</h1>
        <div style={{ 
          background: 'rgba(99, 102, 241, 0.1)',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem'
        }}>
          Votes: {remainingVotes}
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: isMobile ? '1rem' : '1.5rem',
        paddingBottom: '100px',
        WebkitOverflowScrolling: 'touch'
      }}>
        {showSuccess && (
          <div style={{
            backgroundColor: '#065F46',
            color: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.3s ease'
          }}>
            <Check size={16} />
            Vote successfully cast! Thank you for participating in AI governance.
          </div>
        )}

        {voteErrors.global && (
          <div style={{
            backgroundColor: '#991B1B',
            color: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            {voteErrors.global}
          </div>
        )}

        {/* Instructions */}
        <div style={{
          backgroundColor: '#1F2937',
          borderRadius: '0.75rem',
          padding: isMobile ? '1rem' : '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
            How Voting Works
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'start',
            gap: '1rem',
            color: '#D1D5DB'
          }}>
            <AlertCircle size={20} style={{ marginTop: '0.25rem', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: isMobile ? '14px' : '16px' }}>
                Select an AI agent and vote on their proposed traits. You can select specific traits 
                to support. Your votes help shape the development direction of our AI community. Each agent 
                requires 750 votes to proceed to migration.
              </p>
            </div>
          </div>
        </div>

        {/* Agent Grid - Responsive Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))', 
          gap: isMobile ? '1rem' : '1.5rem',
          marginBottom: '5rem'
        }}>
          {agents.map((agent) => (
            <div key={agent._id}>
              {/* Error message for this specific agent */}
              {voteErrors[agent._id] && (
                <div style={{
                  backgroundColor: 'rgba(153, 27, 27, 0.2)',
                  color: '#FCA5A5',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  <AlertCircle size={16} />
                  {voteErrors[agent._id]}
                </div>
              )}

              <div
                onClick={() => handleAgentSelect(agent)}
                style={{
                  backgroundColor: selectedAgent?._id === agent._id ? '#1F2937' : '#1F2937',
                  borderRadius: '0.75rem',
                  padding: isMobile ? '1.5rem' : '2rem',
                  cursor: 'pointer',
                  border: selectedAgent?._id === agent._id ? '2px solid #6366F1' : '2px solid transparent',
                  transition: 'all 0.2s',
                  animation: 'fadeIn 0.3s ease',
                  animationDelay: '0.1s',
                  animationFillMode: 'both'
                }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {agent.name}
                    </h3>
                    <p style={{ 
                      color: '#9CA3AF', 
                      fontSize: isMobile ? '0.9rem' : '1rem', 
                      lineHeight: '1.5' 
                    }}>
                      {agent.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#D1D5DB'
                    }}>
                      <span>Progress</span>
                      <span>{agent.votes}/{agent.votesNeeded} votes</span>
                    </div>
                    <div style={{
                      height: '0.5rem',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '0.25rem',
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

                  {selectedAgent?._id === agent._id && (
                    <>
                      <div>
                        <h4 style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#9CA3AF',
                          marginBottom: '1rem'
                        }}>
                          Select traits to support:
                        </h4>
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '0.75rem'
                        }}>
                          {agent.proposedTraits.map((trait, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTraitSelection(trait);
                              }}
                              style={{
                                backgroundColor: selectedTraits.includes(trait)
                                  ? '#6366F1'
                                  : '#374151',
                                color: selectedTraits.includes(trait)
                                  ? 'white'
                                  : '#D1D5DB',
                                padding: '0.75rem 1.25rem',
                                borderRadius: '9999px',
                                fontSize: '0.875rem',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                minHeight: '44px', // Better touch target
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {trait}
                            </button>
                          ))}
                        </div>
                      </div>

                      <TraitVotingStats 
                        agent={agent} 
                        traitStats={traitStats || {}} 
                      />
                      
                      {/* Mobile-only vote button inside the selected card */}
                      {isMobile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedTraits.length > 0) {
                              setShowConfirmation(true);
                            }
                          }}
                          disabled={selectedTraits.length === 0}
                          style={{
                            backgroundColor: selectedTraits.length > 0 ? '#6366F1' : '#374151',
                            color: selectedTraits.length > 0 ? 'white' : '#9CA3AF',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            border: 'none',
                            cursor: selectedTraits.length > 0 ? 'pointer' : 'not-allowed',
                            width: '100%',
                            marginTop: '1rem',
                            minHeight: '44px' // Better touch target
                          }}
                        >
                          <Vote size={20} />
                          Cast Vote
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vote Button - Fixed at bottom for non-mobile only */}
      {!isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1rem',
          background: 'linear-gradient(transparent, #111827 20%)',
          display: 'flex',
          justifyContent: 'center',
          // Add iOS safe area padding
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))'
        }}>
          <button
            onClick={() => selectedAgent && selectedTraits.length > 0 && setShowConfirmation(true)}
            disabled={!selectedAgent || selectedTraits.length === 0}
            style={{
              backgroundColor: selectedAgent && selectedTraits.length > 0 ? '#6366F1' : '#374151',
              color: selectedAgent && selectedTraits.length > 0 ? 'white' : '#9CA3AF',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              fontSize: '1.125rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: 'none',
              cursor: selectedAgent && selectedTraits.length > 0 ? 'pointer' : 'not-allowed',
              maxWidth: '64rem',
              width: '100%',
              justifyContent: 'center',
              minHeight: '44px' // Better touch target
            }}
          >
            <Vote size={20} />
            Cast Vote
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: '#1F2937',
            borderRadius: '0.75rem',
            padding: isMobile ? '1.5rem' : '2rem',
            maxWidth: isMobile ? '90%' : '28rem',
            width: '100%',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Confirm Your Vote</h3>
              <button 
                onClick={() => setShowConfirmation(false)}
                style={{
                  color: '#9CA3AF',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#9CA3AF', marginBottom: '0.5rem' }}>Selected Agent</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>{selectedAgent?.name}</p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
            <p style={{ color: '#9CA3AF', marginBottom: '0.5rem' }}>Selected Traits</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedTraits.map((trait, index) => (
                  <span 
                    key={index}
                    style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      color: '#818CF8',
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem'
                    }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handleVoteSubmit}
              disabled={isVoting}
              style={{
                width: '100%',
                backgroundColor: isVoting ? '#4B5563' : '#6366F1',
                color: 'white',
                padding: '1rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                border: 'none',
                cursor: isVoting ? 'not-allowed' : 'pointer',
                minHeight: '44px' // Better touch target
              }}
            >
              {isVoting ? (
                <>
                  <div className="animate-spin" style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    borderTopColor: 'white',
                    marginRight: '8px'
                  }}></div>
                  Confirming Vote...
                </>
              ) : (
                <>
                  <Vote size={20} />
                  Confirm Vote
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
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
      `}</style>
    </div>
  );
};

export default VotingPage;