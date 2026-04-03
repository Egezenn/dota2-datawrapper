import fs from 'fs';
import path from 'path';

/**
 * Prepares the data for a static export (e.g., GitHub Pages).
 * Copies data/ and dotaconstants/build/ to docs/public/api and ensures .json extensions.
 */
function copyRecursive(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(child => {
      copyRecursive(path.join(src, child), path.join(dest, child));
    });
  } else {
    // For files, ensure .json if it's a data file with no extension
    let finalDest = dest;
    const ext = path.extname(src);
    if (!ext && src.includes('data')) {
      finalDest += '.json';
    }
    
    // Skip large binary assets if we only want JSON, but here we probably want everything for a full static site
    fs.copyFileSync(src, finalDest);
  }
}

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const dataDir = path.join(rootDir, 'data');
  const targetDir = path.join(rootDir, 'docs', 'public', 'api');

  console.log(`[Static Export] Preparing data in ${targetDir}...`);

  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  // 1. Copy Data (heroes, items, lists)
  if (fs.existsSync(dataDir)) {
    console.log(`[Static Export] Copying all data from ${dataDir}...`);
    const items = fs.readdirSync(dataDir);
    for (const item of items) {
       const srcPath = path.join(dataDir, item);
       if (item === 'assets') {
         copyRecursive(srcPath, path.join(targetDir, item));
       } else if (item === 'constants') {
         // Constants were downloaded by fetch-all to data/constants
         copyRecursive(srcPath, path.join(targetDir, 'constants'));
       } else if (item === 'ability_lookup.json' || item === 'ability-lookup.json') {
         const constTarget = path.join(targetDir, 'constants');
         if (!fs.existsSync(constTarget)) fs.mkdirSync(constTarget, { recursive: true });
         fs.copyFileSync(srcPath, path.join(constTarget, 'ability_lookup.json'));
       } else {
         const destName = item.endsWith('.json') ? item : `${item}.json`;
         if (fs.statSync(srcPath).isDirectory()) {
            copyRecursive(srcPath, path.join(targetDir, item));
         } else {
            fs.copyFileSync(srcPath, path.join(targetDir, destName));
         }
       }
    }
  }

  // 2. Create .nojekyll to prevent Jekyll from skipping underscore files/folders
  const noJekyllPath = path.join(rootDir, 'docs', 'public', '.nojekyll');
  if (!fs.existsSync(noJekyllPath)) {
    fs.writeFileSync(noJekyllPath, '');
    console.log('[Static Export] Created .nojekyll in docs/public');
  }

  console.log('[Static Export] Done. All data bundled in docs/public/api');
}

main().catch(console.error);
