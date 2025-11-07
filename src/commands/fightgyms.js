module.exports = {
  name: 'fightgyms',
  description: 'Challenge a gym: %fightgyms <gym name>',
  async execute({ client, message, args }) {
    if (!args.length) return message.reply('Usage: %fightgyms <gym name>');
    const db = client.db;
    const userId = message.author.id;
    const gymName = args.join(' ').trim();

    let gyms = [];
    try { gyms = require('../../data/gyms.json'); } catch (e) { gyms = client.gymsStatic || []; }
    const gym = gyms.find(g => g.name.toLowerCase() === gymName.toLowerCase());
    if (!gym) return message.reply('Gym not found. Use %gyms to view gyms in your region.');

    const have = db.prepare(`SELECT 1 FROM user_badges WHERE user_id = ? AND gym_name = ?`).get(userId, gym.name);
    if (have) return message.reply(`You already earned the ${gym.badge_name}.`);

    const team = db.prepare(`SELECT * FROM pokemon_instances WHERE owner_id = ? AND team_slot IS NOT NULL ORDER BY team_slot`).all(userId);
    if (!team || team.length === 0) return message.reply('You have no Pokémon in your team. Catch some first.');

    const avgLevel = Math.floor(team.reduce((s, p) => s + (p.level || 1), 0) / team.length);

    if (avgLevel < (gym.min_level || 1)) {
      return message.reply(`Your team's average level is ${avgLevel}. You need an average level of at least ${gym.min_level} to beat this gym.`);
    }

    db.prepare(`INSERT OR IGNORE INTO user_badges (user_id, gym_name, earned_at) VALUES (?, ?, strftime('%s','now'))`).run(userId, gym.name);

    const embed = {
      title: `Victory — ${gym.name}`,
      description: `You defeated the ${gym.name} leader and earned the **${gym.badge_name}**!`,
      fields: [
        { name: 'Team Avg Level', value: String(avgLevel), inline: true },
        { name: 'Badge', value: gym.badge_name, inline: true }
      ],
      color: 0x00cc66
    };

    message.reply({ embeds: [embed] });
  }
};