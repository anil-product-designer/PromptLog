import React, { useState } from 'react';
import { usePromptLogStore } from '../store/usePromptLogStore';

const TrialCard = ({ trial, onEdit, onDelete }) => {
  const hasAttachments = trial.attachments && trial.attachments.length > 0;

  return (
    <div className="card trial-card">
      <div className="trial-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="badge badge-purple" style={{ fontSize: '0.65rem' }}>{trial.version}</div>
          {hasAttachments && (
            <div className="badge badge-ghost" style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
              📎 {trial.attachments.length} Assets
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(trial)}>Edit</button>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => onDelete(trial.id)}>Delete</button>
        </div>
      </div>

      <div className="trial-body">
        <div className="trial-section">
          <label className="label" style={{ fontSize: '0.6rem', marginBottom: '0.5rem' }}>Instruction Directive</label>
          <div className="prompt-block mono" style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
            {trial.prompt}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="trial-section">
            <label className="label" style={{ fontSize: '0.6rem', color: 'var(--yellow)' }}>Diagnosis</label>
            <div className="diagnosis-block">{trial.finding}</div>
          </div>
          <div className="trial-section">
            <label className="label" style={{ fontSize: '0.6rem', color: 'var(--green)' }}>Pivot / Refinement</label>
            <div className="diagnosis-block">{trial.improvement}</div>
          </div>
        </div>
      </div>

      {hasAttachments && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {trial.attachments.map((file, idx) => (
            <div 
              key={idx} 
              className="attachment-chip"
              onClick={() => window.open(file.url, '_blank')}
            >
              {file.type?.startsWith('image/') ? '🖼️' : '📄'} {file.name}
            </div>
          ))}
        </div>
      )}

      <div className="trial-metadata">
        <div>Refined by: {trial.author}</div>
        <div>{trial.date}</div>
      </div>
    </div>
  );
};

const ProjectView = () => {
  const { 
    projects, 
    activeProjectId, 
    activeCategoryId, 
    setActiveCategory, 
    trials, 
    addTrial, 
    updateTrial,
    deleteTrial,
    addCategory,
    updateCategory
  } = usePromptLogStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTrialId, setEditingTrialId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'version'
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [tempCategoryName, setTempCategoryName] = useState('');
  const [newTrial, setNewTrial] = useState({
    version: 'v1.0',
    prompt: '',
    output: '',
    finding: '',
    improvement: '',
    author: 'Anil K.'
  });

  const project = projects.find(p => p.id === activeProjectId);
  
  let filteredTrials = trials.filter(t => 
    t.projectId === activeProjectId && 
    t.categoryId === activeCategoryId &&
    (t.prompt.toLowerCase().includes(searchQuery.toLowerCase()) || 
     t.finding.toLowerCase().includes(searchQuery.toLowerCase()) ||
     t.improvement.toLowerCase().includes(searchQuery.toLowerCase()) ||
     t.version.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sorting logic
  filteredTrials.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'version') return b.version.localeCompare(a.version);
    return 0;
  });

  const handleEditClick = (trial) => {
    setNewTrial(trial);
    setEditingTrialId(trial.id);
    setShowAddModal(true);
  };

  const handleAddTrial = (e) => {
    e.preventDefault();
    if (!newTrial.prompt) return alert('Please enter a prompt before saving.');
    
    if (editingTrialId) {
      updateTrial(editingTrialId, newTrial);
    } else {
      addTrial({
        ...newTrial,
        projectId: activeProjectId,
        categoryId: activeCategoryId,
        attachments: []
      });
    }

    setShowAddModal(false);
    setEditingTrialId(null);
    setNewTrial({ version: `v${(filteredTrials.length + 2).toFixed(1)}`, prompt: '', output: '', finding: '', improvement: '', author: 'Anil K.', attachments: [] });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      size: (file.size / 1024).toFixed(1) + ' KB'
    }));
    setNewTrial(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newAttachments]
    }));
  };

  if (!project) return <div className="content" style={{ textAlign: 'center', marginTop: '10rem', opacity: 0.5 }}>Please select a project from the sidebar to view your prompt library.</div>;

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="topbar">
        <div>
          <div className="topbar-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>{project.icon}</span>
            {project.name} Refinement Log
          </div>
          <div className="topbar-breadcrumb">{project.description}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => {
            const name = prompt('Name of the new Focus Area (e.g. "Objection Handling"):');
            if (name) addCategory(activeProjectId, name);
          }}>+ Add Focus Area</button>
          <button className="btn btn-primary btn-sm" onClick={() => {
            setEditingTrialId(null);
            setNewTrial({ version: `v${(filteredTrials.length + 1).toFixed(1)}`, prompt: '', output: '', finding: '', improvement: '', author: 'Anil K.', attachments: [] });
            setShowAddModal(true);
          }}>+ Log New Iteration</button>
        </div>
      </div>

      <div className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', gap: 'var(--space-md)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
            <input 
              className="input" 
              style={{ paddingLeft: '2.5rem', height: '42px' }} 
              placeholder="Search in this category..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sort by:</label>
            <select 
              className="input" 
              style={{ width: '140px', height: '42px', padding: '0 0.75rem' }}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="version">Version</option>
            </select>
          </div>
        </div>

        <div className="tabs" style={{ display: 'flex', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          {project.categories.map(cat => (
            <div 
              key={cat.id} 
              className={`tab ${activeCategoryId === cat.id ? 'active' : ''}`}
              style={{ 
                padding: '0.75rem 0.25rem', 
                fontSize: '0.85rem', 
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                color: activeCategoryId === cat.id ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: activeCategoryId === cat.id ? '2px solid var(--purple)' : 'none',
                fontWeight: activeCategoryId === cat.id ? '600' : '400',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative'
              }}
              onClick={() => setActiveCategory(cat.id)}
            >
              {editingCategoryId === cat.id ? (
                <input 
                  autoFocus
                  className="input"
                  style={{ height: '24px', padding: '0 4px', fontSize: '0.8rem', width: '100px' }}
                  value={tempCategoryName}
                  onChange={e => setTempCategoryName(e.target.value)}
                  onBlur={() => {
                    if (tempCategoryName) updateCategory(activeProjectId, cat.id, tempCategoryName);
                    setEditingCategoryId(null);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      if (tempCategoryName) updateCategory(activeProjectId, cat.id, tempCategoryName);
                      setEditingCategoryId(null);
                    }
                  }}
                />
              ) : (
                <>
                  {cat.name}
                  <span 
                    className="edit-cat-icon"
                    style={{ fontSize: '0.7rem', opacity: 0, transition: 'opacity 0.2s' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCategoryId(cat.id);
                      setTempCategoryName(cat.name);
                    }}
                  >
                    ✏️
                  </span>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-2">
          {filteredTrials.length > 0 ? (
            filteredTrials.map(t => (
              <TrialCard key={t.id} trial={t} onDelete={deleteTrial} onEdit={handleEditClick} />
            ))
          ) : (
            <div className="card" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '6rem', background: 'rgba(255,255,255,0.02)', borderStyle: 'dashed' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💡</div>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Your library is empty.</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Start building your knowledge base by saving a prompt and your learnings.</div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>Save Your First Prompt</button>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <form onSubmit={handleAddTrial}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="modal-title">{editingTrialId ? 'Refine Iteration' : 'Log New Iteration'}</div>
                  <button type="button" className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Documenting the "Why" behind this version helps preserve institutional sales knowledge.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="label">Iteration Version</label>
                  <input className="input" value={newTrial.version} onChange={e => setNewTrial({...newTrial, version: e.target.value})} placeholder="e.g. v2.1" required />
                </div>
                <div>
                  <label className="label">Focus Area (Category)</label>
                  <select 
                    className="input" 
                    value={activeCategoryId} 
                    onChange={(e) => setActiveCategory(e.target.value)}
                  >
                    {project.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Instruction Directive (System Prompt)</label>
                <textarea className="input textarea mono" style={{ height: '120px' }} value={newTrial.prompt} onChange={e => setNewTrial({...newTrial, prompt: e.target.value})} placeholder="Paste the exact instruction tested in this version..." required></textarea>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Behavioral Output (AI Response)</label>
                <textarea className="input textarea mono" style={{ height: '80px' }} value={newTrial.output} onChange={e => setNewTrial({...newTrial, output: e.target.value})} placeholder="What did the AI actually say or do?"></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="label">Diagnosis (What was the gap?)</label>
                  <textarea className="input textarea" style={{ height: '100px', borderLeft: '3px solid var(--yellow)' }} value={newTrial.finding} onChange={e => setNewTrial({...newTrial, finding: e.target.value})} placeholder="Identify what was missing or incorrect..."></textarea>
                </div>
                <div>
                  <label className="label">Strategic Pivot (The Fix)</label>
                  <textarea className="input textarea" style={{ height: '100px', borderLeft: '3px solid var(--green)' }} value={newTrial.improvement} onChange={e => setNewTrial({...newTrial, improvement: e.target.value})} placeholder="Describe the adjustment made to resolve the gap..."></textarea>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Attach References (Images/Files)</label>
                <div 
                  style={{ 
                    border: '2px dashed var(--border)', 
                    padding: '2rem', 
                    borderRadius: 'var(--radius-sm)', 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--purple)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <input 
                    id="file-upload" 
                    type="file" 
                    multiple 
                    hidden 
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📁</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to upload or drag and drop</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Screenshots, PDFs, or Log files</div>
                </div>

                {newTrial.attachments && newTrial.attachments.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
                    {newTrial.attachments.map((file, idx) => (
                      <div key={idx} style={{ position: 'relative', background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
                        {file.type.startsWith('image/') ? (
                          <img src={file.url} alt={file.name} style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.25rem' }} />
                        ) : (
                          <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📄</div>
                        )}
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewTrial(prev => ({
                              ...prev,
                              attachments: prev.attachments.filter((_, i) => i !== idx)
                            }));
                          }}
                          style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingTrialId ? 'Update Library' : 'Save to Library'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectView;
