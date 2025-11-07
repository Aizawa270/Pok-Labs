module.exports = {
  name: 'bag',
  description: 'Show your items',
  async execute({ client, message }) {
    const userId = message.author.id;
    const db = client.db;

    // Make sure you have this table in db.js:
    // CREATE TABLE IF NOT EXISTS user_items (
    //   user_id TEXT,
    //   name TEXT,
    //   quantity INTEGER DEFAULT 0,
    //   PRIMARY KEY(user_id, name)
    // );

    const items = db.prepare(`SELECT * FROM user_items WHERE user_id = ?`).all(userId);
    if (!items || items.length === 0) return message.reply('Your bag is empty.');

    let desc = '';
    for (const item of items) {
      desc += `${item.name}: ${item.quantity}\n`;
    }

    message.reply({ content: desc });
  }
};