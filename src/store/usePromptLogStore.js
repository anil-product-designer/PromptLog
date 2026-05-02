import { create } from 'zustand';
import { createClient } from '../utils/supabase/client';

const supabase = createClient();
const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const usePromptLogStore = create((set, get) => ({
  activeProjectId: null,
  activeCategoryId: null,
  currentView: 'dashboard',
  user: null,
  
  notifications: [],
  teamMembers: [],
  projects: [],
  trials: [],

  // --- AUTH ACTIONS ---
  setUser: (user) => set({ user }),

  // --- DATA FETCHING ---
  fetchData: async () => {
    try {
      // 1. Fetch Projects
      const { data: projects, error: pError } = await supabase
        .from('projects')
        .select('*, categories(*)');
      
      if (pError) throw pError;

      // 2. Fetch Trials
      const { data: trials, error: tError } = await supabase
        .from('trials')
        .select('*, attachments(*)');
      
      if (tError) throw tError;

      // Map snake_case to camelCase
      const mappedTrials = (trials || []).map(t => ({
        ...t,
        projectId: t.project_id,
        categoryId: t.category_id,
        author: t.author_name
      }));

      set({ 
        projects: projects || [], 
        trials: mappedTrials,
        activeProjectId: projects?.[0]?.id || null,
        activeCategoryId: projects?.[0]?.categories?.[0]?.id || null
      });
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  },

  // --- NAVIGATION ---
  setActiveProject: (id) => set((state) => {
    const project = state.projects.find(p => p.id === id);
    return { 
      activeProjectId: id, 
      activeCategoryId: project?.categories?.[0]?.id || null 
    };
  }),
  
  setActiveCategory: (id) => set({ activeCategoryId: id }),
  setCurrentView: (view) => set({ currentView: view }),
  
  // --- NOTIFICATIONS ---
  addNotification: (icon, title, msg) => set((state) => ({
    notifications: [...state.notifications, { id: uid('notif'), icon, title, msg }]
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  // --- PROJECT ACTIONS ---
  addProject: async (name, description, icon, color) => {
    const { data, error } = await supabase
      .from('projects')
      .insert([{ name, description, icon, color, owner_id: get().user?.id }])
      .select();

    if (!error && data) {
      const newProject = { ...data[0], categories: [] };
      set((state) => ({ projects: [...state.projects, newProject] }));
      
      // Auto-create initial category
      await get().addCategory(newProject.id, 'General');
    }
  },

  addCategory: async (projectId, name) => {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ project_id: projectId, name }])
      .select();

    if (!error && data) {
      set((state) => ({
        projects: state.projects.map(p => p.id === projectId 
          ? { ...p, categories: [...(p.categories || []), data[0]] }
          : p
        )
      }));
    }
  },

  updateCategory: async (projectId, categoryId, newName) => {
    const { error } = await supabase
      .from('categories')
      .update({ name: newName })
      .eq('id', categoryId);

    if (!error) {
      set((state) => ({
        projects: state.projects.map(p => p.id === projectId 
          ? { ...p, categories: p.categories.map(c => c.id === categoryId ? { ...c, name: newName } : c) }
          : p
        )
      }));
    }
  },

  // --- TRIAL ACTIONS ---
  addTrial: async (trial) => {
    const { data, error } = await supabase
      .from('trials')
      .insert([{ 
        project_id: trial.projectId,
        category_id: trial.categoryId,
        version: trial.version,
        prompt: trial.prompt,
        output: trial.output,
        finding: trial.finding,
        improvement: trial.improvement,
        author_name: trial.author,
        author_id: get().user?.id
      }])
      .select();

    if (!error && data) {
      set((state) => ({
        trials: [...state.trials, { ...data[0], projectId: data[0].project_id, categoryId: data[0].category_id }]
      }));
    }
  },

  updateTrial: async (id, updates) => {
    const { error } = await supabase
      .from('trials')
      .update({
        version: updates.version,
        prompt: updates.prompt,
        output: updates.output,
        finding: updates.finding,
        improvement: updates.improvement
      })
      .eq('id', id);

    if (!error) {
      set((state) => ({
        trials: state.trials.map(t => t.id === id ? { ...t, ...updates } : t)
      }));
    }
  },

  deleteTrial: async (id) => {
    const { error } = await supabase.from('trials').delete().eq('id', id);
    if (!error) {
      set((state) => ({
        trials: state.trials.filter(t => t.id !== id)
      }));
    }
  },

  // --- TEAM ACTIONS ---
  addTeamMember: (name, email, role) => set((state) => ({
    teamMembers: [...state.teamMembers, { 
      id: uid('tm'), 
      name, 
      email, 
      role, 
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase() 
    }]
  })),

  removeTeamMember: (id) => set((state) => ({
    teamMembers: state.teamMembers.filter(tm => tm.id !== id)
  }))
}));
