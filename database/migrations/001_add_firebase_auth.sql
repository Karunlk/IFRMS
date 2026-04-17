-- Migration: Add Firebase authentication fields to users table
-- Run this script on existing installations to support Firebase authentication.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ALTER COLUMN password DROP NOT NULL;

-- Index for fast firebase_uid lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users (firebase_uid)
  WHERE firebase_uid IS NOT NULL;
