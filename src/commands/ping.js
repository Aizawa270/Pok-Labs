module.exports = {
  name: 'ping',
  description: 'Ping command',
  async execute({ message }) {
    const sent = await message.reply('Pinging...');
    const diff = sent.createdTimestamp - message.createdTimestamp;
    sent.edit(`Pong! ${diff}ms`);
  }
};