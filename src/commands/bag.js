module.exports = {
  name: 'bag',
  description: 'Check your items in bag: %bag',
  async execute({ client, message }) {
    const userId = message.author.id;
    const db = client.db;

    const userBoxes = db
      .prepare(
        `SELECT * FROM boxes WHERE owner_id = ?`
      )
      .all(userId);

    if (!userBoxes || userBoxes.length === 0) {
      return message.reply("Your bag is empty.");
    }

    let msg = "**Your Boxes:**\n";
    userBoxes.forEach(box => {
      msg += `Box #${box.box_number} — Capacity: ${box.capacity}\n`;
    });

    message.reply(msg);
  },
};