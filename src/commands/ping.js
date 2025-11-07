module.exports = {
  name: 'ping',
  description: 'Ping the bot to check latency: %ping',
  async execute({ client, message }) {
    const sent = await message.reply('Pinging...');
    sent.edit(`Pong! Latency: ${sent.createdTimestamp - message.createdTimestamp}ms`);
  },
};