module.exports = {
  name: 'gyms',
  description: 'List all gyms in your current region: %gyms',
  async execute({ client, message }) {
    if (!client.gymsStatic || client.gymsStatic.length === 0)
      return message.reply('No gyms data available.');

    const embed = {
      title: 'Gym Leaders',
      description: client.gymsStatic.map(g => `${g.name} — Badge: ${g.badge_name}`).join('\n'),
      color: 0xffcc00,
    };

    message.reply({ embeds: [embed] });
  },
};