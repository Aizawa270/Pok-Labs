module.exports = {
  name: 'encounter',
  description: 'Show current wild Pokémon encounter',
  async execute({ client, message }) {
    const userId = message.author.id;
    const enc = client.currentEncounter?.[userId];
    if (!enc) return message.reply('No Pokémon currently encountered.');
    
    message.reply(`You see a wild Pokémon (ID: ${enc.species_id}) at Level ${enc.level}.`);
  }
};