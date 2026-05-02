import React from 'react';
import { usePromptLogStore } from '../store/usePromptLogStore';

const Dashboard = () => {
  const { projects, trials } = usePromptLogStore();

  const totalPrompts = trials.length;
  const projectStats = projects.map(p => ({
    name: p.name,
    count: trials.filter(t => t.projectId === p.id).length,
    color: p.color,
    icon: p.icon
  }));

  const recentTrials = [...trials].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Intelligence Hub</h1>
          <p className="page-subtitle">A high-level view of your evolving prompt architecture and sales knowledge.</p>
        </div>
      </header>

      <div className="grid grid-3" style={{ marginBottom: '3rem' }}>
        <div className="card stat-card">
          <div className="stat-value">{totalPrompts}</div>
          <div className="stat-label">Total Iterations</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{projects.length}</div>
          <div className="stat-label">Active Domains</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{projects.reduce((acc, p) => acc + p.categories.length, 0)}</div>
          <div className="stat-label">Knowledge Segments</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '2rem' }}>
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Repository Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {projectStats.map(stat => (
              <div key={stat.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="project-dot" style={{ background: stat.color, width: '12px', height: '12px' }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{stat.icon} {stat.name}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.count} assets</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        background: stat.color, 
                        width: `${totalPrompts > 0 ? (stat.count / totalPrompts) * 100 : 0}%`,
                        transition: 'width 0.6s ease'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Latest Breakthroughs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentTrials.length > 0 ? recentTrials.map(trial => (
              <div key={trial.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--purple-light)', fontWeight: 600, background: 'var(--purple-dim)', padding: '2px 8px', borderRadius: '4px' }}>{trial.version}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{trial.date}</span>
                </div>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-primary)', lineHeight: '1.5', fontWeight: '500' }}>
                  {trial.finding}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--green)', fontWeight: '600' }}>Strategic Pivot:</span> {trial.improvement}
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🧠</div>
                Awaiting your first breakthrough.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
