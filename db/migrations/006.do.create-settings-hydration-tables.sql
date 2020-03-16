CREATE TABLE settings (
    id INTEGER PRIMARY KEY REFERENCES users(id),
    nickname TEXT,
    hydration BOOLEAN
);

CREATE TABLE hydration (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  length INTEGER NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  user_id INTEGER REFERENCES users(id)
);