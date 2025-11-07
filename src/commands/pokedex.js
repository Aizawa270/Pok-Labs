module.exports = {
  name: 'pokedex',
  description: 'Check Pokémon info by name or ID: %pokedex [name/id]',
  async execute({ client, message, args }) {
    if (!args.length) return message.reply('Specify a Pokémon name or ID.');

    const query = args.join(' ').toLowerCase();
    const pokedex = client.pokedex || {};
    const species =
      Object.values(pokedex).find(p => p.name.toLowerCase() === query) || pokedex[query];

    if (!species) return message.reply('Pokémon not found.');

    const embed = {
      title: `${species.name} (#${species.id})`,
      description: `Type: ${species.types.join(', ')}\nBase Stats: HP ${species.baseStats.hp} / ATK ${species.baseStats.atk} / DEF ${species.baseStats.def}`,
      thumbnail: {
        url: `https://img.pokemondb.net/sprites/sword-shield/icon/${species.name.toLowerCase()}.png`,
      },
      color: 0x00ccff,
    };

    message.reply({ embeds: [embed] });
  },
};