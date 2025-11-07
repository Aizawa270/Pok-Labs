const fs = require('fs');
const path = require('path');

function readData(file) {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'data', file), 'utf8')); }
  catch { return null; }
}

module.exports = {
  name: 'pokedex',
  description: 'Show Pokémon info from Gen 1–4',
  async execute({ client, message, args }) {
    const name = args[0];
    if (!name) return message.reply('Provide a Pokémon name.');

    const pokedex = client.pokedex || readData('pokedex.json');
    const species = Object.values(pokedex).find(p => p.name.toLowerCase() === name.toLowerCase());
    if (!species) return message.reply('Pokémon not found.');

    const embed = {
      title: `${species.name} (Gen ${species.generation})`,
      description: `Type: ${species.types.join(', ')}\nHP: ${species.baseStats.hp} | Atk: ${species.baseStats.atk} | Def: ${species.baseStats.def} | SpA: ${species.baseStats.spa} | SpD: ${species.baseStats.spd} | Spe: ${species.baseStats.spe}`,
      thumbnail: { url: `https://img.pokemondb.net/sprites/sword-shield/icon/${species.name.toLowerCase()}.png` },
      color: 0x00ff00
    };

    message.reply({ embeds: [embed] });
  }
};