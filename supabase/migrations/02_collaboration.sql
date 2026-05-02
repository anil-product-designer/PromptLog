-- TEAM COLLABORATION ENHANCEMENT

-- 1. Create Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'editor', -- 'admin', 'editor', 'viewer'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, email)
);

-- 2. Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 3. Update Project RLS Policies
-- Drop old policies first
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;

-- New Policies: Owner can do everything, Members can view/edit
CREATE POLICY "Owners have full access" ON public.projects
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Members can view projects" ON public.projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE project_id = projects.id 
            AND email = auth.jwt()->>'email'
        )
    );

-- 4. Update Categories, Trials, Attachments RLS
-- We need to update these to check for team membership too

DROP POLICY IF EXISTS "Users can manage categories of their projects" ON public.categories;
CREATE POLICY "Collaborators can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = categories.project_id 
            AND (
                projects.owner_id = auth.uid() OR 
                EXISTS (SELECT 1 FROM public.team_members WHERE project_id = projects.id AND email = auth.jwt()->>'email')
            )
        )
    );

DROP POLICY IF EXISTS "Users can manage trials in their projects" ON public.trials;
CREATE POLICY "Collaborators can manage trials" ON public.trials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = trials.project_id 
            AND (
                projects.owner_id = auth.uid() OR 
                EXISTS (SELECT 1 FROM public.team_members WHERE project_id = projects.id AND email = auth.jwt()->>'email')
            )
        )
    );

DROP POLICY IF EXISTS "Users can manage attachments in their trials" ON public.attachments;
CREATE POLICY "Collaborators can manage attachments" ON public.attachments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.trials
            JOIN public.projects ON projects.id = trials.project_id
            WHERE trials.id = attachments.trial_id
            AND (
                projects.owner_id = auth.uid() OR 
                EXISTS (SELECT 1 FROM public.team_members WHERE project_id = projects.id AND email = auth.jwt()->>'email')
            )
        )
    );

-- 5. Team Members RLS
CREATE POLICY "Owners can manage team members" ON public.team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = team_members.project_id 
            AND projects.owner_id = auth.uid()
        )
    );

CREATE POLICY "Members can view fellow team members" ON public.team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members AS m
            WHERE m.project_id = team_members.project_id 
            AND m.email = auth.jwt()->>'email'
        )
    );
