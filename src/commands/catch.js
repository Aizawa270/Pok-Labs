module.exports = {
  name: 'catch',
  description: 'Catch current wild Pokémon',
  async execute({ client, message, args }) {
    const userId = message.author.id;
    const enc = client.currentEncounter?.[userId];
    if (!enc) return message.reply('No Pokémon to catch.');
    
    // Simple catch logic (always 50% for now)
    const success = Math.random() < 0.5;
    if (success) {
      message.reply(`You caught Pokémon ID ${enc.species_id}!`);
      delete client.currentEncounter[userId];
    } else {
      message.reply('Pokémon escaped!');
    }
  }
};