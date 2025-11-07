const fs = require('fs');
const path = require('path');

function readData(file) {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'data', file), 'utf8')); }
  catch { return null; }
}

module.exports = {
  name: 'gyms',
  description: 'List all gyms in your current region',
  async execute({ client, message }) {
    const userId = message.author.id;
    const db = client.db;

    const userRegion = 'Kanto'; // For now; can expand later
    const gyms = readData('gyms.json')?.[userRegion];
    if (!gyms) return message.reply('No gyms found for your region.');

    let desc = '';
    for (const gym of gyms) {
      const defeated = db.prepare(`SELECT * FROM user_gyms WHERE user_id = ? AND gym_id = ?`).get(userId, gym.id);
      desc += `${gym.name} - Leader: ${gym.leader} ${defeated ? '✅' : '❌'}\n`;
    }

    message.reply({ content: desc });
  }
};