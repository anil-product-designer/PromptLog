import React, { useEffect } from 'react';
import { usePromptLogStore } from './store/usePromptLogStore';
import ProjectView from './pages/ProjectView';
import Dashboard from './pages/Dashboard';
import TeamManagement from './pages/TeamManagement';

const Sidebar = () => {
  const { projects, activeProjectId, setActiveProject, currentView, setCurrentView } = usePromptLogStore();

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">PL</div>
          <div>
            <div className="logo-text">PromptLog</div>
            <div className="logo-sub">Lean Repository</div>
          </div>
        </div>
      </div>

      <div className="sidebar-section">View</div>
      <div className="sidebar-projects" style={{ marginBottom: '1.5rem' }}>
        <div 
          className={`project-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <span className="sidebar-icon">📊</span> Dashboard
        </div>
        <div 
          className={`project-item ${currentView === 'team' ? 'active' : ''}`}
          onClick={() => setCurrentView('team')}
        >
          <span className="sidebar-icon">👥</span> Manage Team
        </div>
      </div>

      <div className="sidebar-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Your Projects</span>
        <button 
          className="btn btn-ghost btn-sm"
          style={{ padding: '0 0.4rem', height: '24px', minWidth: '24px' }}
          onClick={() => {
            const name = prompt('Enter new project name:');
            if (name) {
              const { addProject } = usePromptLogStore.getState();
              addProject(name, 'New prompt workspace', '📁', '#3B82F6');
            }
          }}
        >
          +
        </button>
      </div>
      <div className="sidebar-projects">
        {projects.map(project => (
          <div 
            key={project.id} 
            className={`project-item ${currentView === 'projects' && activeProjectId === project.id ? 'active' : ''}`}
            onClick={() => {
              setActiveProject(project.id);
              setCurrentView('projects');
            }}
          >
            <div className="sidebar-icon">
              <div className="project-dot" style={{ background: project.color }}></div>
            </div>
            {project.name}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-row">
          <div className="avatar">AP</div>
          <div>
            <div className="user-name">Anil Patel</div>
            <div className="user-role">Product Designer</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NotificationCenter = () => {
  const { notifications, removeNotification } = usePromptLogStore();

  return (
    <div className="notif-panel">
      {notifications.map(notif => (
        <div key={notif.id} className="notif">
          <div className="notif-icon">{notif.icon}</div>
          <div className="notif-body">
            <div className="notif-title">{notif.title}</div>
            <div className="notif-msg">{notif.msg}</div>
          </div>
          <button className="notif-close" onClick={() => removeNotification(notif.id)}>✕</button>
        </div>
      ))}
    </div>
  );
};

const App = () => {
  const { addNotification, currentView } = usePromptLogStore();

  useEffect(() => {
    addNotification('🚀', 'Welcome back', 'PromptLog Lean Repository is ready.');
  }, []);

  return (
    <div className="app">
      <NotificationCenter />
      <Sidebar />
      <main className="main">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'projects' && <ProjectView />}
        {currentView === 'team' && <TeamManagement />}
      </main>
    </div>
  );
};

export default App;
