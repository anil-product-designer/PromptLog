import React, { useState } from 'react';
import { usePromptLogStore } from '../store/usePromptLogStore';

const TeamManagement = () => {
  const { teamMembers, addTeamMember, removeTeamMember } = usePromptLogStore();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const generateInviteLink = () => {
    // In a real app, this would be a unique tokenized URL
    const baseUrl = window.location.origin;
    const mockLink = `${baseUrl}/join?org=promptlog-${Math.random().toString(36).slice(2, 8)}`;
    setInviteLink(mockLink);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">Manage access levels and invite collaborators to your intelligence hub.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { generateInviteLink(); setShowInviteModal(true); }}>
          + Invite Member
        </button>
      </header>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member</th>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access Level</th>
              <th style={{ padding: '1.25rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '12px', 
                      background: 'var(--purple-dim)', 
                      color: 'var(--purple-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.9rem'
                    }}>
                      {member.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{member.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{member.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem', 
                    fontWeight: '600',
                    background: member.role === 'Owner' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                    color: member.role === 'Owner' ? 'var(--green)' : 'var(--text-secondary)'
                  }}>
                    {member.role}
                  </span>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                  {member.role !== 'Owner' && (
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ color: 'var(--red)' }}
                      onClick={() => { if(confirm(`Remove ${member.name}?`)) removeTeamMember(member.id); }}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>🤝</div>
              <h2 style={{ marginBottom: '0.5rem' }}>Invite a Collaborator</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Share this unique link with your team member. Once they open it, they'll be added to the organization.
              </p>

              <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <input 
                  className="input" 
                  readOnly 
                  value={inviteLink} 
                  style={{ paddingRight: '100px', fontSize: '0.8rem', background: 'var(--bg-primary)' }}
                />
                <button 
                  className="btn btn-primary btn-sm" 
                  style={{ position: 'absolute', right: '4px', top: '4px', height: '34px' }}
                  onClick={handleCopyLink}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

              <div style={{ padding: '1rem', background: 'var(--yellow-dim)', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.2)', textAlign: 'left' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--yellow)', lineHeight: '1.4' }}>
                    <strong>Note:</strong> In this demo version, clicking the link won't add a user, but it demonstrates the secure sharing flow.
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-ghost" 
                style={{ marginTop: '2rem', width: '100%' }}
                onClick={() => setShowInviteModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
