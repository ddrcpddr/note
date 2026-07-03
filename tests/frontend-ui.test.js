import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

const repoRoot = process.cwd();

function readText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Frontend mobile interactions', () => {
  test('uses a grouped rich text toolbar instead of one long icon strip', () => {
    const source = readText('src/client/main.jsx');

    assert.ok(source.includes('const toolbarGroups = ['));
    assert.ok(source.includes("const [activeToolbarGroup, setActiveToolbarGroup] = useState('basic')"));
    assert.ok(source.includes('activeTools.map(([key, label, Icon, action, isActive])'));
    assert.ok(source.includes('grid grid-cols-4 gap-1.5'));
    assert.ok(!source.includes('tools.map(([key, label, Icon, action, isActive])'));
    assert.ok(!source.includes('scroll-row -mx-1 mb-3 flex gap-2 px-1 pb-1'));
  });

  test('refreshes rich text toolbar state immediately after editor transactions', () => {
    const source = readText('src/client/main.jsx');

    assert.ok(source.includes('const [toolbarRevision, setToolbarRevision] = useState(0)'));
    assert.ok(source.includes('function refreshToolbarState()'));
    assert.ok(source.includes('onSelectionUpdate()'));
    assert.ok(source.includes('onTransaction()'));
    assert.ok(source.includes('data-toolbar-revision={toolbarRevision}'));
    assert.ok(source.includes('onMouseDown={(event) => event.preventDefault()}'));
  });

  test('lets the rich text fixed text color button toggle off', () => {
    const source = readText('src/client/main.jsx');

    assert.ok(source.includes('function toggleTextColor()'));
    assert.ok(source.includes("editor.chain().focus().unsetColor().run()"));
    assert.ok(source.includes("['color', '文字色', Palette, toggleTextColor"));
  });

  test('styles italic text inside both rich text display and editor surfaces', () => {
    const styles = readText('src/client/styles.css');

    assert.ok(styles.includes('.rich-text-content em,'));
    assert.ok(styles.includes('.rich-text-editor em,'));
    assert.ok(styles.includes('transform: skewX(-10deg);'));
  });

  test('keeps attachment upload inside the rich text editor only', () => {
    const source = readText('src/client/main.jsx');

    assert.ok(source.includes("['attach', '附件', Paperclip, () => attachmentInputRef.current?.click()]"));
    assert.ok(source.includes('ref={attachmentInputRef}'));
    assert.ok(!source.includes('record-attachment-input'));
    assert.ok(!source.includes('function attachmentLabel('));
    assert.ok(!source.includes('setAttachmentFiles'));
  });

  test('wires Note Station import page to a real nsx file picker', () => {
    const source = readText('src/client/main.jsx');

    assert.ok(source.includes('const nsxInputRef = useRef(null)'));
    assert.ok(source.includes('accept=".nsx"'));
    assert.ok(source.includes('onChange={handleNsxFileChange}'));
    assert.ok(source.includes("nsxInputRef.current?.click()"));
    assert.ok(source.includes('selectedNsxFile?.name'));
    assert.ok(source.includes("'Content-Type': 'application/octet-stream'"));
    assert.ok(source.includes("'X-File-Name': encodeURIComponent(selectedNsxFile.name)"));
    assert.ok(source.includes('body: selectedNsxFile'));
    assert.ok(source.includes('disabled={canPreview && !canCommitPreview}'));
    assert.ok(source.includes('等待网页解析接入'));
    assert.ok(source.includes("/api/imports/notestation/dry-run"));
  });

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
