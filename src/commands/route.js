const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { ensureUserRoutes } = require('../lib/db');

function readData(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'data', file), 'utf8'));
  } catch {
    return null;
  }
}

module.exports = {
  name: 'route',
  description: 'Travel to a route and encounter wild Pokémon',
  async execute({ client, message, args }) {
    const userId = message.author.id;
    const routeNum = parseInt(args[0], 10);
    if (isNaN(routeNum)) return message.reply('Please provide a valid route number.');

    const db = client.db;

    // --- Step 1: Ensure user has first route unlocked ---
    ensureUserRoutes(db, userId);

    // --- Step 2: Determine current region ---
    // For now, default to Kanto; you can expand to Johto/Hoenn later
    const regions = readData('regions.json') || [];
    let currentRegion = 'Kanto';
    for (const region of regions) {
      if (routeNum >= region.start_route && routeNum <= region.end_route) {
        currentRegion = region.name;
        break;
      }
    }

    // --- Step 3: Check if route is unlocked ---
    const routeCheck = db.prepare(`
      SELECT * FROM user_routes
      WHERE user_id = ? AND region = ? AND route_number = ?
    `).get(userId, currentRegion, routeNum);

    if (!routeCheck) return message.reply(`Route ${routeNum} not unlocked in ${currentRegion}.`);

    // --- Step 4: Pick Pokémon for route ---
    const routeSpawns = db.prepare(`
      SELECT * FROM route_spawns
      WHERE route = ? AND region = ?
    `).all(routeNum, currentRegion);

    if (!routeSpawns || routeSpawns.length === 0) return message.reply('No Pokémon found for this route yet.');

    const totalChance = routeSpawns.reduce((a, p) => a + p.chance, 0);
    let roll = Math.random() * totalChance;
    let selected = null;
    for (const p of routeSpawns) {
      if (roll < p.chance) { selected = p; break; }
      roll -= p.chance;
    }
    if (!selected) selected = routeSpawns[0];

    // --- Step 5: Get species info ---
    const pokedex = client.pokedex || readData('pokedex.json');
    const species = pokedex[selected.pokemon_id];
    if (!species) return message.reply('Pokémon data missing.');

    // --- Step 6: Save encounter in memory ---
    if (!client.currentEncounter) client.currentEncounter = {};
    client.currentEncounter[userId] = {
      id: uuidv4(),
      species_id: species.id,
      level: Math.floor(Math.random() * 5 + 2), // random small level
      hp_current: species.baseStats.hp
    };

    // --- Step 7: Send embed to user ---
    const embed = {
      title: `Wild ${species.name} appeared!`,
      description: `Level ${client.currentEncounter[userId].level}\nType: ${species.types.join(', ')}`,
      thumbnail: { url: `https://img.pokemondb.net/sprites/sword-shield/icon/${species.name.toLowerCase()}.png` },
      color: 0x00ff00,
      fields: [
        { name: 'HP', value: `${species.baseStats.hp}`, inline: true },
        { name: 'Attack', value: `${species.baseStats.atk}`, inline: true },
        { name: 'Defense', value: `${species.baseStats.def}`, inline: true },
        { name: 'Sp. Atk', value: `${species.baseStats.spa}`, inline: true },
        { name: 'Sp. Def', value: `${species.baseStats.spd}`, inline: true },
        { name: 'Speed', value: `${species.baseStats.spe}`, inline: true }
      ]
    };

    message.reply({ embeds: [embed] });
  }
};