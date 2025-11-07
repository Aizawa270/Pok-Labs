module.exports = {
  name: 'ping',
  description: 'Ping',
  async execute({ message }) {
    const sent = await message.reply('Pinging...');
    sent.edit(`Pong! ${sent.createdTimestamp - message.createdTimestamp}ms`);
  }
};