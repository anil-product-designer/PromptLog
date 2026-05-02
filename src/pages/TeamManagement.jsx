import React, { useState } from 'react';
import { usePromptLogStore } from '../store/usePromptLogStore';

const TeamManagement = () => {
  const { teamMembers, addTeamMember, removeTeamMember, activeProjectId, projects } = usePromptLogStore();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    await addTeamMember(email, role);
    setEmail('');
    setLoading(false);
    setShowInviteModal(false);
  };

  return (
    <div className="page-container" style={{ gap: 'var(--space-xl)' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h1 className="page-title">Team Management</h1>
          <p className="page-subtitle">
            Manage access for <strong>{activeProject?.name || 'this project'}</strong>.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
          + Invite Member
        </button>
      </header>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member Email</th>
              <th style={{ padding: '1.25rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access Level</th>
              <th style={{ padding: '1.25rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.length === 0 && (
              <tr>
                <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No team members invited yet.
                </td>
              </tr>
            )}
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
                      {member.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{member.email.split('@')[0]}</div>
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
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-secondary)'
                  }}>
                    {member.role}
                  </span>
                </td>
                <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={() => { if(confirm(`Remove ${member.email}?`)) removeTeamMember(member.id); }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1rem 0' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>Invite a Collaborator</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Enter the email of the team member you want to add to this project.
              </p>

              <form onSubmit={handleInvite} className="login-form" style={{ background: 'none', padding: 0, boxShadow: 'none' }}>
                <div className="form-group">
                  <label>Team Member Email</label>
                  <input 
                    type="email" 
                    className="input" 
                    placeholder="name@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Role</label>
                  <select 
                    className="input" 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ appearance: 'auto' }}
                  >
                    <option value="editor">Editor (Can edit logs)</option>
                    <option value="viewer">Viewer (Read-only)</option>
                    <option value="admin">Admin (Manage team)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" className="btn btn-ghost btn-block" onClick={() => setShowInviteModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? 'Sending...' : 'Invite Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
