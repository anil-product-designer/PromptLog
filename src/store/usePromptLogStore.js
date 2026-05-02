import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const usePromptLogStore = create(
  persist(
    (set, get) => ({
      activeProjectId: 'proj-voice',
      activeCategoryId: 'cat-discovery',
      currentView: 'projects', // 'dashboard' or 'projects'
      
      notifications: [],
      
      teamMembers: [
        { id: 'tm-1', name: 'Anil K.', email: 'anil@example.com', role: 'Owner', avatar: 'AK' },
        { id: 'tm-2', name: 'Sarah J.', email: 'sarah@example.com', role: 'Prompt Specialist', avatar: 'SJ' },
      ],
      projects: [
        {
          id: 'proj-voice',
          name: 'Voice Platform',
          description: 'System prompts for conversational AI and sales knowledge.',
          icon: '🎙️',
          color: '#7C3AED',
          categories: [
            { id: 'cat-discovery', name: 'Discovery Calls' },
            { id: 'cat-demo', name: 'Product Demos' },
            { id: 'cat-closing', name: 'Closing' }
          ]
        },
        {
          id: 'proj-transify',
          name: 'Transify',
          description: 'Translation and localization prompt engineering.',
          icon: '🌐',
          color: '#10B981',
          categories: [
            { id: 'cat-slang', name: 'Slang/Idioms' },
            { id: 'cat-technical', name: 'Technical Terms' }
          ]
        },
        {
          id: 'proj-image',
          name: 'Image Generation',
          description: 'Stable Diffusion and Midjourney prompt library.',
          icon: '🎨',
          color: '#F59E0B',
          categories: [
            { id: 'cat-photorealistic', name: 'Photorealistic' },
            { id: 'cat-artistic', name: 'Artistic Styles' }
          ]
        }
      ],

      trials: [
        {
          id: 'trial-1',
          projectId: 'proj-voice',
          categoryId: 'cat-discovery',
          version: 'v1.0',
          date: 'May 2, 2026',
          prompt: 'You are a helpful sales assistant. Start by asking about their day.',
          output: 'Hi! I hope your day is going well. I wanted to chat about...',
          finding: 'The intro is too generic and doesn\'t build immediate value.',
          improvement: 'Add specific industry context to the opening sentence.',
          attachments: [],
          author: 'Anil K.'
        },
        {
          id: 'trial-2',
          projectId: 'proj-voice',
          categoryId: 'cat-discovery',
          version: 'v1.1',
          date: 'May 2, 2026',
          prompt: 'You are a helpful sales assistant. Start by mentioning their recent Series B funding.',
          output: 'Hi! Congrats on the Series B funding. I noticed your team is scaling...',
          finding: 'Much better engagement rate, but needs to pivot to ZenTech faster.',
          improvement: 'Bridge the funding news to AI infrastructure needs within 2 sentences.',
          attachments: [],
          author: 'Anil K.'
        }
      ],

      // Actions
      setActiveProject: (id) => set((state) => {
        const project = state.projects.find(p => p.id === id);
        return { 
          activeProjectId: id, 
          activeCategoryId: project?.categories[0]?.id || null 
        };
      }),
      
      setActiveCategory: (id) => set({ activeCategoryId: id }),
      
      setCurrentView: (view) => set({ currentView: view }),
      
      addNotification: (icon, title, msg) => set((state) => ({
        notifications: [...state.notifications, { id: uid('notif'), icon, title, msg }]
      })),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),

      addProject: (name, description, icon, color) => set((state) => ({
        projects: [...state.projects, { 
          id: uid('proj'), 
          name, 
          description, 
          icon, 
          color, 
          categories: [{ id: uid('cat'), name: 'General' }] 
        }]
      })),

      addCategory: (projectId, name) => set((state) => ({
        projects: state.projects.map(p => p.id === projectId 
          ? { ...p, categories: [...p.categories, { id: uid('cat'), name }] }
          : p
        )
      })),

      updateCategory: (projectId, categoryId, newName) => set((state) => ({
        projects: state.projects.map(p => p.id === projectId 
          ? { ...p, categories: p.categories.map(c => c.id === categoryId ? { ...c, name: newName } : c) }
          : p
        )
      })),

      addTrial: (trial) => set((state) => ({
        trials: [...state.trials, { ...trial, id: uid('trial'), date: new Date().toLocaleDateString() }]
      })),

      updateTrial: (id, updates) => set((state) => ({
        trials: state.trials.map(t => t.id === id ? { ...t, ...updates } : t)
      })),

      deleteTrial: (id) => set((state) => ({
        trials: state.trials.filter(t => t.id !== id)
      })),

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
    }),
    {
      name: 'promptlog-lean-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
