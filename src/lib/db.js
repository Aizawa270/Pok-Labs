const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', '..', 'db', 'db.sqlite');

function ensureDbDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function init() {
  ensureDbDir();
  const db = new Database(DB_PATH);
  // users: basic profile and currency
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      beli INTEGER DEFAULT 0,
      diamonds INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );
  `).run();

  // pokemon_instances: each captured pokemon
  db.prepare(`
    CREATE TABLE IF NOT EXISTS pokemon_instances (
      id TEXT PRIMARY KEY,
      owner_id TEXT,
      species_id INTEGER,
      nickname TEXT,
      level INTEGER,
      exp INTEGER,
      hp_current INTEGER,
      iv TEXT,
      ev TEXT,
      moves TEXT,
      held_item TEXT,
      is_shiny INTEGER DEFAULT 0,
      box_slot INTEGER,
      team_slot INTEGER,
      box_number INTEGER DEFAULT 1,
      FOREIGN KEY(owner_id) REFERENCES users(id)
    );
  `).run();

  // boxes: box metadata (optional)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS boxes (
      owner_id TEXT,
      box_number INTEGER,
      capacity INTEGER DEFAULT 30,
      PRIMARY KEY(owner_id, box_number)
    );
  `).run();

  // market listings
  db.prepare(`
    CREATE TABLE IF NOT EXISTS market_listings (
      id TEXT PRIMARY KEY,
      seller_id TEXT,
      pokemon_id TEXT,
      price_beli INTEGER,
      active INTEGER DEFAULT 1
    );
  `).run();

  // raids
  db.prepare(`
    CREATE TABLE IF NOT EXISTS raids (
      id TEXT PRIMARY KEY,
      species_id INTEGER,
      host_id TEXT,
      created_at INTEGER,
      max_players INTEGER DEFAULT 5
    );
  `).run();

  return db;
}

module.exports = { init, DB_PATH };