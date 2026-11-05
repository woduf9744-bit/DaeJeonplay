-- DESIGN DRAFT ONLY. Not applied to a running DB.
-- PostgreSQL schema proposal. Requires auth, roles, validation and migrations before production.
CREATE TABLE IF NOT EXISTS places (
  place_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food','explore','culture','experience','science')),
  district TEXT,
  address TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  description TEXT,
  source_url TEXT,
  checked_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS place_photos (
  photo_id BIGSERIAL PRIMARY KEY,
  place_id TEXT NOT NULL REFERENCES places(place_id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  license TEXT NOT NULL,
  author TEXT,
  source_url TEXT,
  is_actual_place_photo BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  checked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS festivals (
  festival_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  venue TEXT,
  source_url TEXT,
  checked_at TIMESTAMPTZ,
  CHECK (starts_on <= ends_on)
);

CREATE TABLE IF NOT EXISTS quests (
  quest_id TEXT PRIMARY KEY,
  place_id TEXT REFERENCES places(place_id) ON DELETE CASCADE,
  festival_id TEXT REFERENCES festivals(festival_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instruction TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food','explore','culture','experience','science')),
  xp INT NOT NULL CHECK (xp BETWEEN 0 AND 300),
  CHECK ((place_id IS NOT NULL)::INT + (festival_id IS NOT NULL)::INT = 1)
);

-- Production user_id must map to a verified auth identity (e.g., Supabase auth.users).
CREATE TABLE IF NOT EXISTS quest_completions (
  user_id UUID NOT NULL,
  quest_id TEXT NOT NULL REFERENCES quests(quest_id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verification_status TEXT NOT NULL DEFAULT 'demo'
    CHECK (verification_status IN ('demo','pending','verified','rejected')),
  photo_object_key TEXT,
  PRIMARY KEY (user_id, quest_id)
);

-- Server must award XP only after valid completion and in one DB transaction.
CREATE TABLE IF NOT EXISTS xp_ledger (
  user_id UUID NOT NULL,
  quest_id TEXT NOT NULL REFERENCES quests(quest_id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  xp INT NOT NULL CHECK (xp >= 0),
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, quest_id)
);

-- RAG document rights + provenance metadata.
CREATE TABLE IF NOT EXISTS place_documents (
  document_id BIGSERIAL PRIMARY KEY,
  place_id TEXT REFERENCES places(place_id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  content TEXT NOT NULL,
  usage_license TEXT NOT NULL,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
