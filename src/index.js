require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { init: initDb, ensureUserRoutes } = require('./lib/db');

const PREFIX = process.env.BOT_PREFIX || '%';
const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
const SHINY_RATE = parseInt(process.env.SHINY_RATE || '4096', 10);

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

// --- JSON helpers ---
function readData(file) {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', file), 'utf8')); }
  catch (e) { return null; }
}

function writeData(file, obj) {
  fs.writeFileSync(path.join(__dirname, '..', 'data', file), JSON.stringify(obj, null, 2));
}

// Load pokedex
client.pokedex = readData('pokedex.json') || {};

// --- Commands ---
client.commands = new Collection();

function loadCommands() {
  const cmdsDir = path.join(__dirname, 'commands');
  if (!fs.existsSync(cmdsDir)) return;
  
  (function walk(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const it of items) {
      const full = path.join(dir, it.name);
      if (it.isDirectory()) { walk(full); continue; }
      if (!it.name.endsWith('.js')) continue;
      const cmd = require(full);
      if (!cmd || !cmd.name) continue;
      client.commands.set(cmd.name, cmd);
      console.log('Loaded command', cmd.name);
    }
  })(cmdsDir);

  console.log(`Total commands loaded: ${client.commands.size}`);
}

loadCommands();

// --- Ready ---
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// --- Message handling ---
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;

  // Ensure first route unlocked for Stage 2
  ensureUserRoutes(client.db, userId);

  const content = message.content.trim();
  const isAdmin = ADMIN_IDS.includes(userId);

  // --- Prefix commands ---
  if (content.startsWith(PREFIX)) {
    const without = content.slice(PREFIX.length).trim();
    const [cmdName, ...args] = without.split(/\s+/);
    return handleCommand(message, cmdName.toLowerCase(), args, isAdmin);
  }

  // --- Prefixless commands ---
  const prefixlessList = readData('prefixless.json') || [];
  if (prefixlessList.includes(userId)) {
    const [cmdName, ...args] = content.split(/\s+/);
    return handleCommand(message, cmdName.toLowerCase(), args, isAdmin);
  }
});

// --- Command dispatcher ---
async function handleCommand(message, cmdName, args, isAdmin) {
  const cmd = client.commands.get(cmdName);
  if (!cmd) return; // ignore unknown

  try {
    await cmd.execute({ client, message, args, isAdmin, SHINY_RATE });
  } catch (err) {
    console.error('Command error', err);
    message.reply('An error occurred while running that command.');
  }
}

// --- Login ---
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Missing DISCORD_TOKEN in .env');
  process.exit(1);
}

client.login(token);