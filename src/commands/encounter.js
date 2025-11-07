module.exports = {
  name: 'encounter',
  description: 'Show your current wild encounter (if any)',
  async execute({ client, message }) {
    const userId = message.author.id;
    if (!client.currentEncounter || !client.currentEncounter[userId]) return message.reply('No active wild encounter. Use %route <n> to find wild Pokémon.');
    const enc = client.currentEncounter[userId];
    const pokedex = client.pokedex || {};
    const species = Object.values(pokedex).find(p => p.id === enc.species_id) || pokedex[String(enc.species_id)];
    const embed = {
      title: `Wild ${species ? species.name : '#'+enc.species_id} • Lv ${enc.level}`,
      description: `HP: ${enc.hp_current}\nUse %catch to try to catch it.`,
      thumbnail: { url: species ? (species.sprite || `https://img.pokemondb.net/sprites/sword-shield/icon/${species.name_key}.png`) : undefined },
      color: 0x88cc00
    };
    message.reply({ embeds: [embed] });
  }
};