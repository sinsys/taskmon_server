ALTER TABLE users
  DROP COLUMN date_created,
  ALTER COLUMN
    password DROP NOT NULL,
  ADD COLUMN
    nickname TEXT;