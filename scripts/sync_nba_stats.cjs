const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'json');
const masterPath = path.join(baseDir, 'nba.json');

if (!fs.existsSync(masterPath)) {
  console.error("Master nba.json file not found at " + masterPath);
  process.exit(1);
}

// Load master players
const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const masterPlayers = masterData.players;

// Map players by name (case-insensitive, trimmed)
const playerMap = new Map();
masterPlayers.forEach(p => {
  playerMap.set(p.Name.trim().toLowerCase(), p);
});

console.log(`Loaded ${playerMap.size} master players from nba.json`);

// Files to sync
const filesToSync = [
  'nba_easy.json',
  'nba_medium.json',
  'nba_hard.json',
  'nbaeasy.json',
  'nbamedium.json',
  'nbahard.json'
];

filesToSync.forEach(fileName => {
  const filePath = path.join(baseDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`File ${fileName} not found, skipping.`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let count = 0;
  let missing = 0;

  data.players.forEach(p => {
    const key = p.Name.trim().toLowerCase();
    const masterPlayer = playerMap.get(key);
    if (masterPlayer) {
      // Synchronize stats exactly
      p["All-Star"] = masterPlayer["All-Star"];
      p.DPOY = masterPlayer.DPOY;
      p.MVP = masterPlayer.MVP;
      p.ROTY = masterPlayer.ROTY;
      p.FMVP = masterPlayer.FMVP;
      p["Six-Man"] = masterPlayer["Six-Man"];
      p["All-NBA"] = masterPlayer["All-NBA"];
      p["Draft-Year"] = masterPlayer["Draft-Year"];
      count++;
    } else {
      console.warn(`Warning: Player "${p.Name}" in ${fileName} not found in master list.`);
      missing++;
    }
  });

  // Save back to file with nice formatting
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Successfully synced ${count} players in ${fileName} (${missing} missing in master).`);
});
