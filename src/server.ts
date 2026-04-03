import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const app = express();
const port = 3000;
const dataDir = path.resolve(__dirname, '..', 'data');
const assetsDir = path.join(dataDir, 'assets');

// Auto-enable local assets if they exist and env var is not set
if (fs.existsSync(assetsDir) && !process.env.DOTA2_LOCAL_ASSETS) {
  process.env.DOTA2_LOCAL_ASSETS = `http://localhost:${port}/assets`;
  console.log(`[Local API] Auto-detected local assets. Mapping STEAM_CDN to ${process.env.DOTA2_LOCAL_ASSETS}`);
}

app.use(cors());

// Serve static assets
app.use('/assets', express.static(path.join(dataDir, 'assets')));

// Log requests
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`[Local API] ${req.method} ${req.url}`);
  next();
});

// Helper to send JSON file
const sendJson = (res: express.Response, filePath: string) => {
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
};

app.get('/herolist', (req, res) => {
  sendJson(res, path.join(dataDir, 'herolist.json'));
});

app.get('/herodata', (req, res) => {
  const heroId = req.query.heroid || req.query.hero_id;
  if (!heroId) return res.status(400).json({ error: 'heroid or hero_id is required' });
  sendJson(res, path.join(dataDir, 'heroes', `${heroId}.json`));
});

app.get('/itemlist', (req, res) => {
  sendJson(res, path.join(dataDir, 'itemlist.json'));
});

app.get('/abilitylist', (req, res) => {
  sendJson(res, path.join(dataDir, 'itemabilities.json'));
});

app.get('/patchnoteslist', (req, res) => {
  sendJson(res, path.join(dataDir, 'patchnoteslist.json'));
});

app.get('/patchnotes', (req, res) => {
  const version = req.query.version;
  if (!version) return res.status(400).json({ error: 'version is required' });
  sendJson(res, path.join(dataDir, 'patches', `${version}.json`));
});

// dotaconstants
const constantsDir = path.join(dataDir, 'constants');
const githubRoot = 'https://raw.githubusercontent.com/odota/dotaconstants/master/build';

const fetchAndSend = async (res: express.Response, fileName: string, localPath: string) => {
  if (fs.existsSync(localPath)) {
    return res.sendFile(localPath);
  }

  try {
    console.log(`[Local API] Missing local ${fileName}, fetching from GitHub...`);
    const url = `${githubRoot}/${fileName}`;
    const response = await axios.get(url);
    
    // Ensure dir exists
    if (!fs.existsSync(path.dirname(localPath))) fs.mkdirSync(path.dirname(localPath), { recursive: true });
    
    // Extract data if it was returned by axios
    const data = response.data;
    fs.writeFileSync(localPath, JSON.stringify(data, null, 2));
    
    res.json(data);
  } catch (error: any) {
    console.error(`[Local API] Failed to fetch ${fileName} from GitHub: ${error.message}`);
    res.status(404).json({ error: `Constant ${fileName} not found locally or on GitHub: ${error.message}` });
  }
};

app.get('/constants/heroes', (req, res) => fetchAndSend(res, 'heroes.json', path.join(constantsDir, 'heroes.json')));
app.get('/constants/abilities', (req, res) => fetchAndSend(res, 'abilities.json', path.join(constantsDir, 'abilities.json')));
app.get('/constants/hero_abilities', (req, res) => fetchAndSend(res, 'hero_abilities.json', path.join(constantsDir, 'hero_abilities.json')));
app.get('/constants/aghs_desc', (req, res) => fetchAndSend(res, 'aghs_desc.json', path.join(constantsDir, 'aghs_desc.json')));
app.get('/constants/items', (req, res) => fetchAndSend(res, 'items.json', path.join(constantsDir, 'items.json')));
app.get('/constants/ability_ids', (req, res) => fetchAndSend(res, 'ability_ids.json', path.join(constantsDir, 'ability_ids.json')));
app.get('/constants/ability_lookup', (req, res) => sendJson(res, path.join(dataDir, 'ability-lookup.json')));

app.listen(port, () => {
  console.log(`Local Dota 2 Datafeed API running at http://localhost:${port}`);
  console.log(`Serving data from ${dataDir}`);
});
