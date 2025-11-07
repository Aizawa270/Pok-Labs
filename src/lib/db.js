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

  // --- Stage 1 tables ---

  // users
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      beli INTEGER DEFAULT 0,
      diamonds INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );
  `).run();

  // pokemon_instances
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

  // boxes
  db.prepare(`
    CREATE TABLE IF NOT EXISTS boxes (
      owner_id TEXT,
      box_number INTEGER,
      capacity INTEGER DEFAULT 30,
      PRIMARY KEY(owner_id, box_number)
    );
  `).run();

  // market_listings
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

  // --- Stage 2 tables ---

  // user_routes: tracks which routes are unlocked per user per region
  db.prepare(`
    CREATE TABLE IF NOT EXISTS user_routes (
      user_id TEXT,
      region TEXT,
      route_number INTEGER,
      PRIMARY KEY(user_id, region, route_number)
    );
  `).run();

  // gyms: static info about gym leaders and badges
  db.prepare(`
    CREATE TABLE IF NOT EXISTS gyms (
      name TEXT PRIMARY KEY,
      region TEXT,
      badge_name TEXT,
      leader_sprite TEXT,
      badge_sprite TEXT,
      min_level INTEGER
    );
  `).run();

  // user_badges: badges earned by user
  db.prepare(`
    CREATE TABLE IF NOT EXISTS user_badges (
      user_id TEXT,
      gym_name TEXT,
      earned_at INTEGER,
      PRIMARY KEY(user_id, gym_name)
    );
  `).run();

  // regions: static region info
  db.prepare(`
    CREATE TABLE IF NOT EXISTS regions (
      name TEXT PRIMARY KEY,
      start_route INTEGER,
      end_route INTEGER
    );
  `).run();

  // route_spawns: Pokémon spawn table per route & region
  db.prepare(`
    CREATE TABLE IF NOT EXISTS route_spawns (
      route INTEGER,
      region TEXT,
      pokemon_id INTEGER,
      chance REAL
    );
  `).run();

  return db;
}

module.exports = { init, DB_PATH };