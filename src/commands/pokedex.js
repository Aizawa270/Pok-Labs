module.exports = {
  name: 'pokedex',
  description: 'Show pokedex entry: %pokedex <name|id>',
  async execute({ client, message, args }) {
    if (!args[0]) return message.reply('Usage: %pokedex <name|id>');
    const q = args.join(' ').toLowerCase();
    const pokedex = client.pokedex || {};
    let entry = pokedex[q] || pokedex[Number(q)];
    if (!entry) {
      entry = Object.values(pokedex).find(e => (e.name_key && e.name_key === q) || (e.name && e.name.toLowerCase() === q));
    }
    if (!entry) return message.reply('Pokémon not found.');
    const embed = {
      title: `${entry.name} (#${entry.id})`,
      description: `Types: ${entry.types.join(', ')}`,
      thumbnail: { url: entry.sprite || `https://img.pokemondb.net/sprites/home/normal/${entry.name_key}.png` },
      fields: [
        { name: 'HP', value: String(entry.baseStats.hp), inline: true },
        { name: 'Atk', value: String(entry.baseStats.atk), inline: true },
        { name: 'Def', value: String(entry.baseStats.def), inline: true },
        { name: 'SpA', value: String(entry.baseStats.spa), inline: true },
        { name: 'SpD', value: String(entry.baseStats.spd), inline: true },
        { name: 'Spe', value: String(entry.baseStats.spe), inline: true }
      ],
      color: 0x00ff00
    };
    message.reply({ embeds: [embed] });
  }
};