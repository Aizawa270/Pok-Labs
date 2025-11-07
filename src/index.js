// src/index.js
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { init: initDb, ensureUserExists } = require('./lib/db');

const PREFIX = process.env.BOT_PREFIX || '%';
const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

// --- Database ---
const db = initDb();
client.db = db;

// --- Data loader ---
function readData(file) {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', file), 'utf8')); }
  catch { return null; }
}
function writeData(file, data) {
  fs.writeFileSync(path.join(__dirname, '..', 'data', file), JSON.stringify(data, null, 2));
}

client.pokedex = readData('pokedex.json') || {};
client.gymsStatic = readData('gyms.json') || [];
client.regionsStatic = readData('regions.json') || [];
client.prefixless = readData('prefixless.json') || [];

// --- Command Collection ---
client.commands = new Collection();
function loadCommands() {
  const cmdsDir = path.join(__dirname, 'commands');
  if (!fs.existsSync(cmdsDir)) return;
  (function walk(dir) {
    for (const it of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, it.name);
      if (it.isDirectory()) { walk(full); continue; }
      if (!it.name.endsWith('.js')) continue;
      delete require.cache[require.resolve(full)];
      const cmd = require(full);
      if (!cmd || !cmd.name) continue;
      client.commands.set(cmd.name, cmd);
      console.log('Loaded command', cmd.name);
    }
  })(cmdsDir);
}
loadCommands();

// --- Ready ---
client.once('ready', () => console.log(`Logged in as ${client.user.tag}`));

// --- Message handler ---
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const userId = message.author.id;
  ensureUserExists(client.db, userId);

  const isAdmin = ADMIN_IDS.includes(userId);
  const content = message.content.trim();
  if (!content) return;

  // Prefix commands
  if (content.startsWith(PREFIX)) {
    const without = content.slice(PREFIX.length).trim();
    const [cmdName, ...args] = without.split(/\s+/);
    return handleCommand(message, cmdName.toLowerCase(), args, isAdmin);
  }

  // Prefixless commands
  if (client.prefixless.includes(userId)) {
    const [cmdName, ...args] = content.split(/\s+/);
    return handleCommand(message, cmdName.toLowerCase(), args, isAdmin);
  }
});

// --- Command executor ---
async function handleCommand(message, cmdName, args, isAdmin) {
  const cmd = client.commands.get(cmdName);
  if (!cmd) return;
  try {
    await cmd.execute({ client, message, args, isAdmin });
  } catch (err) {
    console.error('Command error', err);
    try { await message.reply('An error occurred while running that command.'); } catch {}
  }
}

// --- Login ---
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Missing DISCORD_TOKEN in environment (GitHub Secret).');
  process.exit(1);
}
client.login(token);