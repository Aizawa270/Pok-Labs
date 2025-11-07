module.exports = {
  name: 'pokeinfo',
  description: 'Check info of a Pokémon in your team: %pokeinfo [slot]',
  async execute({ client, message, args }) {
    const slot = parseInt(args[0], 10);
    if (isNaN(slot)) return message.reply('Specify a valid team slot number.');

    const userId = message.author.id;
    const db = client.db;
    const pkm = db
      .prepare(`SELECT * FROM pokemon_instances WHERE owner_id = ? AND team_slot = ?`)
      .get(userId, slot);

    if (!pkm) return message.reply(`No Pokémon in team slot ${slot}.`);

    const species = client.pokedex[pkm.species_id];
    if (!species) return message.reply('Pokémon data missing.');

    const embed = {
      title: `${species.name} (Slot ${slot})`,
      description: `Level: ${pkm.level}\nHP: ${pkm.hp_current}\nType: ${species.types.join(', ')}`,
      thumbnail: {
        url: `https://img.pokemondb.net/sprites/sword-shield/icon/${species.name.toLowerCase()}.png`,
      },
      color: 0x00ff00,
    };

    message.reply({ embeds: [embed] });
  },
};