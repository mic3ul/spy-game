CREATE TABLE IF NOT EXISTS rooms (
  chat_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  host_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  round INTEGER NOT NULL DEFAULT 1,
  location TEXT,
  spy_player_id TEXT,
  scene TEXT,
  mission TEXT,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS players (
  chat_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL DEFAULT '',
  first_name TEXT NOT NULL,
  joined_at INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT 'pending',
  alive INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (chat_id, user_id)
);
CREATE TABLE IF NOT EXISTS votes (
  chat_id TEXT NOT NULL,
  voter_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  PRIMARY KEY (chat_id, voter_id)
);
CREATE INDEX IF NOT EXISTS idx_players_chat ON players(chat_id);
CREATE INDEX IF NOT EXISTS idx_votes_chat ON votes(chat_id);
