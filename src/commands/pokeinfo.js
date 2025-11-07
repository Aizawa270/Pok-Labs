module.exports = {
  name: 'pokeinfo',
  description: 'Show Pokémon info from team slot',
  async execute({ client, message, args }) {
    const slot = parseInt(args[0], 10);
    if (isNaN(slot)) return message.reply('Provide a team slot number.');

    const db = client.db;
    const userId = message.author.id;
    const poke = db.prepare(`SELECT * FROM pokemon_instances WHERE owner_id = ? AND team_slot = ?`).get(userId, slot);
    if (!poke) return message.reply('No Pokémon in that slot.');

    const pokedex = client.pokedex;
    const species = pokedex[poke.species_id];
    if (!species) return message.reply('Pokédex data missing.');

    const embed = {
      title: species.name,
      description: `Level ${poke.level}\nHP: ${poke.hp_current}/${species.baseStats.hp}\nType: ${species.types.join(', ')}`,
      thumbnail: { url: `https://img.pokemondb.net/sprites/sword-shield/icon/${species.name.toLowerCase()}.png` },
      color: 0x00ff00
    };

    message.reply({ embeds: [embed] });
  }
};