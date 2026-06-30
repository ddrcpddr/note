import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

const repoRoot = process.cwd();

function readText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Frontend mobile interactions', () => {
  test('wires the home today card to the new-record screen', () => {
    const source = readText('src/client/main.jsx');

    assert.match(source, /function HomeScreen\([^)]*onCreateNote/);
    assert.match(source, /onCreateNote=\{\(\) => navigate\('new'\)\}/);
    assert.match(source, /<TodayCard onCreateNote=\{onCreateNote\} \/>/);
    assert.match(source, /function TodayCard\(\{ onCreateNote \}\)/);
    assert.match(source, /<button[\s\S]*aria-label="快速记录"[\s\S]*onClick=\{onCreateNote\}/);
    assert.doesNotMatch(source, /function TodayCard\(\) \{[\s\S]*<section className="soft-card mt-4/);
  });
});
