DO $$ 
BEGIN 
  -- Add unique constraint for projects: A user cannot have two projects with the same name
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_project_user_id_name') THEN 
    ALTER TABLE projects ADD CONSTRAINT uk_project_user_id_name UNIQUE (user_id, name);
  END IF; 

  -- Add unique constraint for diagram_files: A project cannot have two files with the same name
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_diagram_files_project_id_name') THEN 
    ALTER TABLE diagram_files ADD CONSTRAINT uk_diagram_files_project_id_name UNIQUE (project_id, name);
  END IF; 
END $$;
