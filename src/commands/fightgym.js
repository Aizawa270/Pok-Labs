const fs = require('fs');
const path = require('path');

function readData(file) {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'data', file), 'utf8')); }
  catch { return null; }
}

module.exports = {
  name: 'fightgym',
  description: 'Battle a gym leader',
  async execute({ client, message, args }) {
    const leaderName = args.join(' ');
    if (!leaderName) return message.reply('Specify a gym leader to battle.');

    const userId = message.author.id;
    const userRegion = 'Kanto'; // Default for now
    const gyms = readData('gyms.json')?.[userRegion];
    if (!gyms) return message.reply('No gyms found.');

    const gym = gyms.find(g => g.leader.toLowerCase() === leaderName.toLowerCase());
    if (!gym) return message.reply('Gym leader not found.');

    // Check if already defeated
    const db = client.db;
    const defeated = db.prepare(`SELECT * FROM user_gyms WHERE user_id = ? AND gym_id = ?`).get(userId, gym.id);
    if (defeated) return message.reply(`You already defeated ${gym.leader}.`);

    // Placeholder: simple battle result (later replace with actual battle engine)
    const won = Math.random() < 0.7; // 70% win chance for now
    if (won) {
      db.prepare(`INSERT OR REPLACE INTO user_gyms (user_id, gym_id, defeated_at) VALUES (?, ?, strftime('%s','now'))`).run(userId, gym.id);
      message.reply(`You defeated ${gym.leader}! You earned the ${gym.badge} badge!`);
    } else {
      message.reply(`You lost to ${gym.leader}. Train your team and try again!`);
    }
  }
};