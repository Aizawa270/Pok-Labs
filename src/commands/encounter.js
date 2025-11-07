const { v4: uuidv4 } = require('uuid');

module.exports = {
  name: 'encounter',
  description: 'Encounter a wild Pokémon on current route: %encounter [route]',
  async execute({ client, message, args }) {
    const routeNum = parseInt(args[0], 10);
    if (isNaN(routeNum)) return message.reply('Please provide a valid route number.');

    const userId = message.author.id;
    const db = client.db;

    // Determine region — default Kanto for now
    let currentRegion = 'Kanto';

    const routeCheck = db
      .prepare(
        `SELECT * FROM user_routes WHERE user_id = ? AND region = ? AND route_number = ?`
      )
      .get(userId, currentRegion, routeNum);

    if (!routeCheck) return message.reply(`Route ${routeNum} not unlocked in ${currentRegion}.`);

    // Pick Pokémon for route
    const routeSpawns = db
      .prepare(`SELECT * FROM route_spawns WHERE route = ? AND region = ?`)
      .all(routeNum, currentRegion);

    if (!routeSpawns || routeSpawns.length === 0)
      return message.reply('No Pokémon found for this route yet.');

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

    const pokedex = client.pokedex || {};
    const species = pokedex[selected.pokemon_id];
    if (!species) return message.reply('Pokémon data missing.');

    if (!client.currentEncounter) client.currentEncounter = {};
    client.currentEncounter[userId] = {
      id: uuidv4(),
      species_id: species.id,
      level: Math.floor(Math.random() * 5 + 2),
      hp_current: species.baseStats.hp,
    };

    const embed = {
      title: `Wild ${species.name} appeared!`,
      description: `Level ${client.currentEncounter[userId].level}\nType: ${species.types.join(', ')}`,
      thumbnail: {
        url: `https://img.pokemondb.net/sprites/sword-shield/icon/${species.name.toLowerCase()}.png`,
      },
      color: 0x00ff00,
    };

    message.reply({ embeds: [embed] });
  },
};