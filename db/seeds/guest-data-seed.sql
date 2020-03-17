BEGIN;

TRUNCATE
  users,
  tasks,
  projects,
  settings,
  hydration
  RESTART IDENTITY CASCADE;

INSERT INTO users (user_name, nickname, password)
VALUES
  ('dunder@dunder.com', 'Dunder Mifflin', '$2a$10$vIiAEYVkomqB9JdsD4jZC.ibcXNBC9PwQ3cqWftVuY3SIW9adyH6m');

INSERT INTO projects (title, content, user_id, date_due)
VALUES
  ('Example Project', 'This is a sample project. It contains 3 tasks. It will be due soon!', 1, (NOW() + interval '2 days 2 hours 30 minutes')),
  ('Long Due Date Project', 'This one only contains one task. It can be ignored for now.', 1, (NOW() + interval '21 days 19 hours 12 minutes'));

INSERT INTO tasks (title, content, user_id, project_id, date_due)
VALUES
  ('First Example Task Title', 'This is a description of a sample task.', 1, 1, (NOW() + interval '1 day 19 hours 21 minutes')),
  ('Example Overdue Task', 'This is a task that is already overdue! We should finish it first!', 1, 1, NOW()),
  ('Third Example Task Title', 'This is a description of a sample task. It is due when the project is due', 1, 1, (NOW() + interval '2 days 2 hours 30 minutes')),
  ('Fourth Example Task Title', 'This is a description of a sample task. It is assigned to the long due-date project', 1, 2, (NOW() + interval '10 days 2 hours 11 minutes')),
  ('Fifth Task Title', 'This task is not assigned to a project.', 1, null, (NOW() + interval '3 days 12 hours 10 minutes'));

INSERT INTO settings (id, user_id, nickname, hydration)
VALUES
  (1, 1, 'Test user', true);

INSERT INTO hydration (length, start_time, end_time, user_id)
VALUES
  (3600000, NOW(), (NOW() + interval '2 hours'), 1),
  (3600000, NOW(), (NOW() + interval '2 hours'), 1);

COMMIT;