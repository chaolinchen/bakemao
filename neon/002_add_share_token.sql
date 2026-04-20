-- Migration: add share_token to recipes
-- 於 Neon Dashboard → SQL Editor（prod + dev branch）各執行一次

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS recipes_share_token_idx
  ON recipes(share_token)
  WHERE share_token IS NOT NULL;
