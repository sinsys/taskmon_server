ALTER TABLE users
  ADD COLUMN
    date_created TIMESTAMPTZ DEFAULT now(),
  ALTER COLUMN
    password SET NOT NULL,
  DROP COLUMN nickname;

ALTER TABLE settings
  ALTER COLUMN
    user_id SET NOT NULL,
  ALTER COLUMN
    nickname SET NOT NULL;