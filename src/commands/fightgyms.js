module.exports = {
  name: 'fightgyms',
  description: 'Challenge a gym leader: %fightgyms [gym name]',
  async execute({ client, message, args }) {
    const db = client.db;
    const gymName = args.join(' ');
    if (!gymName) return message.reply('Please specify a gym name.');

    const gym = client.gymsStatic.find(g => g.name.toLowerCase() === gymName.toLowerCase());
    if (!gym) return message.reply('Gym not found.');

    // Check if user already earned badge
    const badge = db
      .prepare(`SELECT * FROM user_badges WHERE user_id = ? AND gym_name = ?`)
      .get(message.author.id, gym.name);

    if (badge) return message.reply(`You already earned the ${gym.badge_name}.`);

    // Placeholder for battle logic — assume user wins
    db.prepare(`INSERT INTO user_badges (user_id, gym_name, earned_at) VALUES (?, ?, strftime('%s','now'))`)
      .run(message.author.id, gym.name);

    message.reply(`You defeated ${gym.name} and earned the **${gym.badge_name}**!`);
  },
};