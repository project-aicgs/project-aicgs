import React, { useState, useEffect } from 'react';
import { Vote, ArrowLeft, Check, AlertCircle, X, Loader } from 'lucide-react';
import { fetchAgents, castVote, getRemainingVotes, fetchTraitStats } from '../api';
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

  useEffect(() => {
    loadAgents();
    loadRemainingVotes();
  }, []);

  const loadAgents = async () => {
    try {
      const agentsData = await fetchAgents();
      setAgents(agentsData.filter(agent => 
        agent.status === 'Conducting Community Sentiment Analysis' &&
        agent.votes < agent.votesNeeded
      ));
    } catch (error) {
      setVoteErrors({ global: 'Failed to load agents. Please try again later.' });
    }
  };

  const loadRemainingVotes = async () => {
    try {
      const data = await getRemainingVotes();
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
      const response = await castVote(
        selectedAgent._id,
        selectedTraits
      );
      
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
    } catch (error) {
      setVoteErrors(prev => ({
        ...prev,
        [selectedAgent._id]: error.message || 'Failed to cast vote. Please try again.'
      }));
      setShowConfirmation(false);
    } finally {
      setIsVoting(false);
    }
  };

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
        padding: '1.5rem',
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
          Back
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Community Voting</h1>
        <div style={{ 
          background: 'rgba(99, 102, 241, 0.1)',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          fontSize: '0.875rem'
        }}>
          Remaining Votes: {remainingVotes}
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        height: 'calc(100vh - 80px)',
        paddingBottom: '100px'
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
            gap: '0.5rem'
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
          padding: '1.5rem',
          marginBottom: '2rem'
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
              <p>
                Select an AI agent and vote on their proposed traits. You can select specific traits 
                to support. Your votes help shape the development direction of our AI community. Each agent 
                requires 750 votes to proceed to migration.
              </p>
            </div>
          </div>
        </div>

        {/* Agent Grid - Two Column Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
          gap: '1.5rem',
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
                  padding: '2rem',
                  cursor: 'pointer',
                  border: selectedAgent?._id === agent._id ? '2px solid #6366F1' : '2px solid transparent',
                  transition: 'all 0.2s'
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
                    <p style={{ color: '#9CA3AF', fontSize: '1rem', lineHeight: '1.5' }}>
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
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
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
                                transition: 'all 0.2s'
                              }}
                            >
                              {trait}
                            </button>
                          ))}
                        </div>
                      </div>

                      <TraitVotingStats agent={agent} traitStats={traitStats} />
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vote Button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '1rem',
        background: 'linear-gradient(transparent, #111827 20%)',
        display: 'flex',
        justifyContent: 'center'
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
            justifyContent: 'center'
          }}
        >
          <Vote size={20} />
          Cast Vote
        </button>
      </div>

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
            padding: '2rem',
            maxWidth: '28rem',
            width: '100%'
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
                  cursor: 'pointer'
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
                cursor: isVoting ? 'not-allowed' : 'pointer'
              }}
            >
              {isVoting ? (
                <>
                  <Loader className="animate-spin" size={20} />
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
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default VotingPage;