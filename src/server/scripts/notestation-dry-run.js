import path from 'node:path';
import { analyzeNsxFile, dryRunNsxFile } from '../importers/notestation/nsx.js';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node src/server/scripts/notestation-dry-run.js <path-to-export.nsx>');
  process.exit(1);
}

const absolutePath = path.resolve(filePath);
const analysis = analyzeNsxFile(absolutePath);
const preview = dryRunNsxFile(absolutePath);

console.log(JSON.stringify({ analysis, preview }, null, 2));
