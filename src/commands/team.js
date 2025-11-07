module.exports = {
  name: 'team',
  description: 'View your current team: %team',
  async execute({ client, message }) {
    const userId = message.author.id;
    const db = client.db;

    const team = db
      .prepare(`SELECT * FROM pokemon_instances WHERE owner_id = ? AND team_slot IS NOT NULL ORDER BY team_slot`)
      .all(userId);

    if (!team.length) return message.reply('Your team is empty.');

    const lines = team.map(p => {
      const species = client.pokedex[p.species_id];
      return `Slot ${p.team_slot}: ${species ? species.name : `#${p.species_id}`} (Lvl ${p.level})`;
    });

    message.reply(`**Your Team:**\n${lines.join('\n')}`);
  },
};