import path from 'node:path';
import { analyzeNsxFile, dryRunNsxFile } from '../importers/notestation/nsx.js';

const args = process.argv.slice(2);
const includeContent = args.includes('--include-content');
const filePath = args.find((arg) => arg !== '--include-content');

if (!filePath) {
  console.error('Usage: node src/server/scripts/notestation-dry-run.js [--include-content] <path-to-export.nsx>');
  process.exit(1);
}

const absolutePath = path.resolve(filePath);
const analysis = analyzeNsxFile(absolutePath);
const preview = dryRunNsxFile(absolutePath, { includeContent });

console.log(JSON.stringify({ analysis, preview }, null, 2));
