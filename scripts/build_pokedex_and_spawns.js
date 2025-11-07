// scripts/build_pokedex_and_spawns.js
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const OUT_POKEDEX = path.join(__dirname, '..', 'data', 'pokedex.json');
const OUT_SPAWNS = path.join(__dirname, '..', 'data', 'route_spawns_full.json');

const START = 1;
const END = 493;

function idToRegion(id) {
  if (id >= 1 && id <= 151) return 'Kanto';
  if (id >= 152 && id <= 251) return 'Johto';
  if (id >= 252 && id <= 386) return 'Hoenn';
  if (id >= 387 && id <= 493) return 'Sinnoh';
  return 'Kanto';
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('Builder: fetching Pokémon 1..493 from PokeAPI...');
  const pokedex = {};
  const spawns = [];

  for (let id = START; id <= END; id++) {
    let data = null;
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
      if (res.ok) data = await res.json();
      else { console.warn(`HTTP ${res.status} for id ${id}`); }
    } catch (err) {
      console.warn('Fetch error', err.message);
    }
    if (!data) { console.warn(`Skipping id ${id}`); continue; }

    const name_key = data.name.toLowerCase();
    const types = data.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1));
    const statsObj = {};
    for (const s of data.stats) statsObj[s.stat.name] = s.base_stat;
    const baseStats = {
      hp: statsObj['hp'] || 1,
      atk: statsObj['attack'] || 1,
      def: statsObj['defense'] || 1,
      spa: statsObj['special-attack'] || 1,
      spd: statsObj['special-defense'] || 1,
      spe: statsObj['speed'] || 1
    };
    let sprite = null;
    if (data.sprites && data.sprites.other && data.sprites.other['official-artwork'] && data.sprites.other['official-artwork'].front_default) {
      sprite = data.sprites.other['official-artwork'].front_default;
    } else if (data.sprites && data.sprites.front_default) sprite = data.sprites.front_default;
    else sprite = `https://img.pokemondb.net/sprites/sword-shield/icon/${name_key}.png`;

    pokedex[id] = {
      id,
      name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
      name_key,
      types,
      baseStats,
      generation: (id <= 151 ? 1 : (id <= 251 ? 2 : (id <= 386 ? 3 : 4))),
      sprite
    };

    const region = idToRegion(id);
    const numRoutes = Math.random() < 0.35 ? 1 : (Math.random() < 0.6 ? 2 : 3);
    const chosen = new Set();
    while (chosen.size < numRoutes) chosen.add(Math.floor(Math.random() * 25) + 1);
    for (const route of chosen) {
      const statSum = baseStats.hp + baseStats.atk + baseStats.def + baseStats.spa + baseStats.spd + baseStats.spe;
      const rarityFactor = Math.max(1, Math.min(6, Math.floor(statSum / 100)));
      const chance = parseFloat((Math.random() * (0.18 / rarityFactor) + 0.02).toFixed(4));
      spawns.push({ route, region, pokemon_id: id, chance });
    }

    if (id % 50 === 0) console.log(`Fetched up to id ${id}`);
    await sleep(200);
  }

  fs.writeFileSync(OUT_POKEDEX, JSON.stringify(pokedex, null, 2));
  fs.writeFileSync(OUT_SPAWNS, JSON.stringify(spawns, null, 2));
  console.log('Builder finished: wrote pokedex.json and route_spawns_full.json');
})();