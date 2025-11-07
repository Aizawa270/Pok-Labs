// scripts/populate_route_spawns.js
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'db', 'db.sqlite');
const db = new Database(DB_PATH);

const spawnsFile = path.join(__dirname, '..', 'data', 'route_spawns_full.json');
if (!fs.existsSync(spawnsFile)) {
  console.error('Missing route_spawns_full.json (run builder first).');
  process.exit(1);
}
const entries = JSON.parse(fs.readFileSync(spawnsFile, 'utf8'));
if (!Array.isArray(entries)) {
  console.error('Invalid route_spawns_full.json format');
  process.exit(1);
}

const insert = db.prepare(`INSERT INTO route_spawns (route, region, pokemon_id, chance) VALUES (?, ?, ?, ?)`);
const del = db.prepare(`DELETE FROM route_spawns WHERE region = ? AND route = ?`);
const tx = db.transaction((rows) => {
  const byKey = {};
  for (const r of rows) {
    const key = `${r.region}::${r.route}`;
    byKey[key] = byKey[key] || [];
    byKey[key].push(r);
  }
  for (const k of Object.keys(byKey)) {
    const [region, route] = k.split('::');
    del.run(region, route);
    for (const r of byKey[k]) insert.run(r.route, r.region, r.pokemon_id, r.chance);
  }
});
tx(entries);
console.log('Imported route spawns into DB.');