const { v4: uuidv4 } = require('uuid');

module.exports = {
  name: 'route',
  description: 'Travel to a route and encounter wild Pokémon: %route [number]',
  async execute({ client, message, args }) {
    const routeNum = parseInt(args[0], 10);
    if (isNaN(routeNum)) return message.reply('Provide a valid route number.');

    const userId = message.author.id;
    const db = client.db;

    let currentRegion = 'Kanto'; // later update based on user progress

    const routeUnlocked = db
      .prepare(`SELECT * FROM user_routes WHERE user_id = ? AND region = ? AND route_number = ?`)
      .get(userId, currentRegion, routeNum);

    if (!routeUnlocked) return message.reply(`Route ${routeNum} not unlocked.`);

    const routeSpawns = db
      .prepare(`SELECT * FROM route_spawns WHERE route = ? AND region = ?`)
      .all(routeNum, currentRegion);

    if (!routeSpawns.length) return message.reply('No Pokémon on this route.');

    const totalChance = routeSpawns.reduce((a, p) => a + p.chance, 0);
    let roll = Math.random() * totalChance;
    let selected = null;

    for (const p of routeSpawns) {
      if (roll < p.chance) {
        selected = p;
        break;
      }
      roll -= p.chance;
    }
    if (!selected) selected = routeSpawns[0];

    const species = client.pokedex[selected.pokemon_id];
    if (!species) return message.reply('Pokémon data missing.');

    if (!client.currentEncounter) client.currentEncounter = {};
    client.currentEncounter[userId] = {
      id: uuidv4(),
      species_id: species.id,
      level: Math.floor(Math.random() * 5 + 2),
      hp_current: species.baseStats.hp,
    };

    message.reply(`A wild ${species.name} appeared at Route ${routeNum}!`);
  },
};