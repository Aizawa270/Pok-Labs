module.exports = {
  name: 'team',
  description: 'Show your team: %team',
  async execute({ client, message }) {
    const userId = message.author.id;
    const rows = client.db.prepare(`SELECT * FROM pokemon_instances WHERE owner_id = ? AND team_slot IS NOT NULL ORDER BY team_slot ASC`).all(userId);
    if (!rows || rows.length === 0) return message.reply('Your team is empty. Catch Pokémon with %route and %catch.');
    const pokedex = client.pokedex || {};
    const fields = rows.map(r => {
      const species = Object.values(pokedex).find(p => p.id === r.species_id) || pokedex[String(r.species_id)];
      return { name: `Slot ${r.team_slot} — ${r.nickname || (species ? species.name : `#${r.species_id}`)}`, value: `Lv ${r.level} • HP ${r.hp_current}`, inline: false };
    });
    message.reply({ embeds: [{ title: `${message.author.username}'s Team`, fields, color: 0x00ff00 }] });
  }
};