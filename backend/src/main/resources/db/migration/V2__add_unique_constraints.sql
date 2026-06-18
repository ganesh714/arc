-- Add unique constraint for projects: A user cannot have two projects with the same name
ALTER TABLE projects ADD CONSTRAINT uk_project_user_id_name UNIQUE (user_id, name);

-- Add unique constraint for diagram_files: A project cannot have two files with the same name
ALTER TABLE diagram_files ADD CONSTRAINT uk_diagram_files_project_id_name UNIQUE (project_id, name);
