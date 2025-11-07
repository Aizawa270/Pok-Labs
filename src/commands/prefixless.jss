// src/commands/prefixless.js
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'prefixless',
  description: 'Add or remove users from prefixless list (Admin only)',
  async execute({ client, message, args, isAdmin }) {
    if (!isAdmin) return message.reply('Only admins can manage prefixless users.');

    const action = args[0];
    const userId = args[1];
    if (!action || !userId) return message.reply('Usage: %prefixless add|remove <userId>');

    const filePath = path.join(__dirname, '..', '..', 'data', 'prefixless.json');
    if (!client.prefixless) client.prefixless = [];

    if (action === 'add') {
      if (!client.prefixless.includes(userId)) client.prefixless.push(userId);
      message.reply(`User ${userId} added to prefixless list.`);
    } else if (action === 'remove') {
      client.prefixless = client.prefixless.filter(id => id !== userId);
      message.reply(`User ${userId} removed from prefixless list.`);
    } else return message.reply('Invalid action, use add or remove.');

    // save to file
    fs.writeFileSync(filePath, JSON.stringify(client.prefixless, null, 2));
  }
};