import React, { useEffect } from 'react';
import { usePromptLogStore } from './store/usePromptLogStore';
import { createClient } from './utils/supabase/client';
import ProjectView from './pages/ProjectView';
import Dashboard from './pages/Dashboard';
import TeamManagement from './pages/TeamManagement';
import Login from './pages/Login';

const supabase = createClient();

const Sidebar = () => {
  const { projects, activeProjectId, setActiveProject, currentView, setCurrentView, user, addNotification } = usePromptLogStore();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      addNotification('🔒', 'Signed Out', 'You have been securely logged out.');
    }
  };

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
          <div className="avatar">{user?.email?.[0].toUpperCase() || 'A'}</div>
          <div style={{ flex: 1 }}>
            <div className="user-name">{user?.email?.split('@')[0] || 'Guest User'}</div>
            <div className="user-role">{user ? 'Authorized' : 'Guest'}</div>
          </div>
          <button 
            className="btn btn-ghost btn-sm" 
            title="Sign Out"
            onClick={handleLogout}
            style={{ padding: '4px', height: '24px', minWidth: '24px' }}
          >
            🚪
          </button>
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
  const { addNotification, currentView, setUser, fetchData, user } = usePromptLogStore();

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session) fetchData();
    });

    // 2. Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) {
        fetchData();
        addNotification('🔓', 'Authenticated', 'Connected to Supabase cloud.');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!user) return (
    <div className="app">
      <NotificationCenter />
      <Login />
    </div>
  );

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
