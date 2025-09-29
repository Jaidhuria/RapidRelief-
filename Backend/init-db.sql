PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS ngos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  registration_number TEXT,
  latitude REAL,
  longitude REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS help_requests (
  id TEXT PRIMARY KEY,
  ngo_id TEXT,
  location TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  need TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(ngo_id) REFERENCES ngos(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS supplies (
  id TEXT PRIMARY KEY,
  item TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);









