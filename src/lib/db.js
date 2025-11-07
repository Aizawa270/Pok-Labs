// src/lib/db.js
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

  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      current_region TEXT DEFAULT 'Kanto',
      beli INTEGER DEFAULT 0,
      diamonds INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );
  `).run();

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

  db.prepare(`
    CREATE TABLE IF NOT EXISTS user_routes (
      user_id TEXT,
      region TEXT,
      route_number INTEGER,
      PRIMARY KEY(user_id, region, route_number)
    );
  `).run();

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

  db.prepare(`
    CREATE TABLE IF NOT EXISTS user_badges (
      user_id TEXT,
      gym_name TEXT,
      earned_at INTEGER,
      PRIMARY KEY(user_id, gym_name)
    );
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS regions (
      name TEXT PRIMARY KEY,
      start_route INTEGER,
      end_route INTEGER
    );
  `).run();

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

function ensureUserExists(db, userId) {
  db.prepare(`INSERT OR IGNORE INTO users (id) VALUES (?)`).run(userId);
  const row = db.prepare(`SELECT current_region FROM users WHERE id = ?`).get(userId);
  const region = (row && row.current_region) ? row.current_region : 'Kanto';
  db.prepare(`INSERT OR IGNORE INTO user_routes (user_id, region, route_number) VALUES (?, ?, ?)`).run(userId, region, 1);
}

module.exports = { init, DB_PATH, ensureUserExists };