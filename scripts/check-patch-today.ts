import { Dota2Datafeed } from '../src/client';

async function main() {
  const api = new Dota2Datafeed();
  const patches = await api.getPatchList();

  if (!patches || patches.length === 0) {
    console.error('Failed to retrieve patch list.');
    process.exit(1);
  }

  // Patches are ordered, typically oldest to newest or newest to oldest.
  // We sort by timestamp descending (newest first).
  const sortedPatches = patches.sort((a, b) => b.patch_timestamp - a.patch_timestamp);
  const latestPatch = sortedPatches[0];

  const now = new Date();
  const patchDate = new Date(latestPatch.patch_timestamp * 1000);

  // Check if the patch was released within the last 24 hours.
  const isRecent = (now.getTime() - patchDate.getTime()) <= 24 * 60 * 60 * 1000;

  console.log(`Latest patch: ${latestPatch.patch_name} (timestamp: ${latestPatch.patch_timestamp})`);
  console.log(`Is patch within last 24 hours? ${isRecent}`);

  // We write to GITHUB_OUTPUT so the workflow can use it
  if (process.env.GITHUB_OUTPUT) {
    const fs = require('fs');
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `new_patch=${isRecent}\n`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
