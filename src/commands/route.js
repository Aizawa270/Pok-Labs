const { v4: uuidv4 } = require('uuid');

module.exports = {
  name: 'route',
  description: 'Travel to a route: %route <number>',
  async execute({ client, message, args }) {
    const db = client.db;
    const userId = message.author.id;
    const routeNum = parseInt(args[0], 10);
    if (isNaN(routeNum) || routeNum < 1) return message.reply('Provide a valid route number (1-25).');

    const user = db.prepare(`SELECT current_region FROM users WHERE id = ?`).get(userId);
    const region = (user && user.current_region) ? user.current_region : 'Kanto';

    const unlocked = db.prepare(`SELECT 1 FROM user_routes WHERE user_id = ? AND region = ? AND route_number = ?`).get(userId, region, routeNum);
    if (!unlocked) return message.reply(`Route ${routeNum} not unlocked in ${region}.`);

    const spawns = db.prepare(`SELECT * FROM route_spawns WHERE route = ? AND region = ?`).all(routeNum, region);
    if (!spawns || spawns.length === 0) return message.reply('No Pokémon found for this route yet.');

    const total = spawns.reduce((s, r) => s + r.chance, 0);
    let roll = Math.random() * total;
    let chosen = spawns[0];
    for (const s of spawns) {
      if (roll < s.chance) { chosen = s; break; }
      roll -= s.chance;
    }

    const pokedex = client.pokedex || {};
    const species = Object.values(pokedex).find(p => p.id === chosen.pokemon_id) || pokedex[String(chosen.pokemon_id)];
    if (!species) return message.reply('Pokémon data missing for that ID.');

    if (!client.currentEncounter) client.currentEncounter = {};
    client.currentEncounter[userId] = {
      id: uuidv4(),
      species_id: species.id,
      level: Math.max(1, Math.floor(Math.random() * 5 + 2)),
      hp_current: species.baseStats.hp
    };

    const embed = {
      title: `A wild ${species.name} appeared!`,
      description: `Region: ${region} • Route ${routeNum}\nLevel ${client.currentEncounter[userId].level}\nType: ${species.types.join(', ')}`,
      thumbnail: { url: species.sprite || `https://img.pokemondb.net/sprites/sword-shield/icon/${species.name_key}.png` },
      color: 0x00ff00
    };
    message.reply({ embeds: [embed] });
  }
};