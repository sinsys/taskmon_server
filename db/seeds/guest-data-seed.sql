BEGIN;

TRUNCATE
  users,
  tasks,
  projects
  RESTART IDENTITY CASCADE;

INSERT INTO users (user_name, nickname, password)
VALUES
  ('dunder@dunder.com', 'Dunder Mifflin', '$2a$10$vIiAEYVkomqB9JdsD4jZC.ibcXNBC9PwQ3cqWftVuY3SIW9adyH6m'), 
  ('admin@admin.com', 'admin', '$2a$10$jHOVsme0Zr6SC6fQ/pX9lubfK/Ptc7O.lp.DKpHDuETeBTkf3nll.');

INSERT INTO projects (title, content, user_id)
VALUES
  ('Project 1', 'Testing project description', 1),
  ('Project 2', 'Testing project description 2', 2),
  ('Project 3', 'Testing project description 3', 1);

INSERT INTO tasks (title, content, user_id, project_id)
VALUES
  ('Task 1 Title', 'Lots of blank content', 1, 1),
  ('Task 2 Title', 'Lots of blank content', 1, 1),
  ('Task 3 Title', 'Lots of blank content', 1, 2),
  ('Task 3 Title', 'Lots of blank content', 1, null),
  ('Task 4 Title', 'Lots of blank content', 2, 1),
  ('Task 5 Title', 'Lots of blank content', 2, 1),
  ('Task 6 Title', 'Lots of blank content', 2, 2),
  ('Task 7 Title', 'Lots of blank content', 2, 2),
  ('Task 8 Title', 'Lots of blank content', 2, 2),
  ('Task 9 Title', 'Lots of blank content', 2, null),
  ('Task 10 Title', 'Lots of blank content', 2, null);

COMMIT;
