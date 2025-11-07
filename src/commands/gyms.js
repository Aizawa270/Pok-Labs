module.exports = {
  name: 'gyms',
  description: 'List gyms for your current region',
  async execute({ client, message }) {
    const userId = message.author.id;
    const db = client.db;
    const userRow = db.prepare(`SELECT current_region FROM users WHERE id = ?`).get(userId);
    const region = (userRow && userRow.current_region) ? userRow.current_region : 'Kanto';

    let gyms = [];
    try { gyms = require('../../data/gyms.json'); } catch (e) { gyms = client.gymsStatic || []; }
    const regionGyms = gyms.filter(g => g.region && g.region.toLowerCase() === region.toLowerCase());

    const badges = db.prepare(`SELECT gym_name FROM user_badges WHERE user_id = ?`).all(userId).map(r => r.gym_name);

    if (!regionGyms || regionGyms.length === 0) return message.reply(`No gyms set for region ${region}.`);

    const fields = regionGyms.map(g => {
      const earned = badges.includes(g.name) ? '✅' : '❌';
      return { name: `${g.name} ${earned}`, value: `Badge: ${g.badge_name} • Min Lv: ${g.min_level}`, inline: false };
    });

    const embed = {
      title: `${region} Gyms`,
      description: `Use %fightgyms <gym name> to challenge a leader.`,
      fields,
      color: 0xffcc00
    };

    message.reply({ embeds: [embed] });
  }
};