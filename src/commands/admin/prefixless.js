const fs = require('fs');
const path = require('path');

function readList() {
  const p = path.join(__dirname, '..', '..', '..', 'data', 'prefixless.json');
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeList(list) {
  const p = path.join(__dirname, '..', '..', '..', 'data', 'prefixless.json');
  fs.writeFileSync(p, JSON.stringify(list, null, 2));
}

module.exports = {
  name: 'prefixless',
  description: 'Admin: manage prefixless users',
  async execute({ message, args, isAdmin }) {
    if (!isAdmin) return message.reply('Admin only.');
    const sub = (args[0] || '').toLowerCase();
    const id = args[1];
    if (!sub || !['add','remove'].includes(sub)) return message.reply('Usage: %prefixless add|remove <userId>');
    if (!id) return message.reply('Please provide a userId.');

    const list = readList();
    if (sub === 'add') {
      if (list.includes(id)) return message.reply('User already in list.');
      list.push(id);
      writeList(list);
      return message.reply(`Added ${id} to prefixless list.`);
    } else {
      const newList = list.filter(x => x !== id);
      writeList(newList);
      return message.reply(`Removed ${id} from prefixless list.`);
    }
  }
};