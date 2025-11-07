module.exports = {
  name: 'team',
  description: 'Show your Pokémon team',
  async execute({ client, message }) {
    const userId = message.author.id;
    const db = client.db;

    const team = db.prepare(`
      SELECT * FROM pokemon_instances 
      WHERE owner_id = ? AND team_slot IS NOT NULL 
      ORDER BY team_slot ASC
    `).all(userId);

    if (!team || team.length === 0) return message.reply('Your team is empty.');

    const pokedex = client.pokedex;
    let desc = '';
    for (const poke of team) {
      const species = pokedex[poke.species_id];
      if (!species) continue;
      desc += `Slot ${poke.team_slot}: ${species.name} Lv.${poke.level} HP:${poke.hp_current}/${species.baseStats.hp} Type:${species.types.join(', ')}\n`;
    }

    message.reply({ content: desc });
  }
};