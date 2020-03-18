ALTER TABLE tasks
  ADD COLUMN
    completed BOOLEAN DEFAULT false;

ALTER TABLE projects
  ADD COLUMN
    completed BOOLEAN DEFAULT false;