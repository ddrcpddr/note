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

  test('disables duplicated StarterKit link and underline extensions', () => {
    const source = readText('src/client/main.jsx');

    assert.ok(source.includes('StarterKit.configure({ heading: { levels: [2, 3] }, link: false, underline: false })'));
    assert.ok(source.includes('UnderlineExtension'));
    assert.ok(source.includes('LinkExtension.configure({ openOnClick: false, autolink: true, linkOnPaste: true })'));
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

  test('hides rich text inline attachments from the separate detail attachment list', () => {
    const source = readText('src/client/main.jsx');

    assert.ok(source.includes('const visibleAttachments = (note.attachments || []).filter'));
    assert.ok(source.includes('return !attachment.isInline && !isReferencedInRichText'));
    assert.ok(source.includes('isReferencedInRichText'));
    assert.ok(source.includes("note.sourceType === 'notestation_import' && isImageAttachment && hasRichContent"));
    assert.ok(source.includes('{visibleAttachments.length > 0 && ('));
    assert.ok(source.includes('附件（{visibleAttachments.length}）'));
    assert.ok(source.includes('visibleAttachments.map((attachment, index)'));
  });

  test('refreshes full note detail before rendering imported attachments', () => {
    const source = readText('src/client/main.jsx');

    assert.ok(source.includes('async function openDetail(id)'));
    assert.ok(source.includes("fetch(`/api/notes?id=${encodeURIComponent(id)}`)"));
    assert.ok(source.includes('const normalized = normalizeNote(detailNote, categoriesData)'));
    assert.ok(source.includes('setNotesData((current) => current.some((note) => note.id === id)'));
  });

  test('wires custom categories through app data, note forms, search and category management', () => {
    const source = readText('src/client/main.jsx');

    assert.ok(source.includes('const [categoriesData, setCategoriesData] = useState(fallbackCategories)'));
    assert.ok(source.includes('const nextCategories = normalizeCategories(data.categories)'));
    assert.ok(source.includes('function normalizeNote(note, categoryList = fallbackCategories)'));
    assert.ok(source.includes('function filterNotes(notes, { filter ='));
    assert.ok(source.includes("fetch('/api/categories'"));
    assert.ok(source.includes("fetch('/api/categories/' + categoryId"));
    assert.ok(source.includes('function NewRecordScreen({ members, categories, currentMemberId'));
    assert.ok(source.includes('categoryId: selectedCategoryId'));
    assert.ok(source.includes('function SearchScreen({ notes, categories, members, onOpenDetail })'));
    assert.ok(source.includes("const categoryFilterOptions = ['all', ...categories.slice(0, 7).map((item) => item.id)]"));
    assert.ok(source.includes('function CategoriesScreen({ notes, categories, onSelectCategory, onCreateCategory, onUpdateCategory })'));
    assert.ok(source.includes('新分类'));
  });

  test('keeps an offline create queue and syncs it after the service returns', () => {
    const source = readText('src/client/main.jsx');

    assert.ok(source.includes('const OFFLINE_CREATE_QUEUE_KEY ='));
    assert.ok(source.includes('const OFFLINE_APP_DATA_CACHE_KEY ='));
    assert.ok(source.includes('const OFFLINE_APP_DATA_CACHE_LIMIT = 100'));
    assert.ok(source.includes('function readOfflineCreateQueue()'));
    assert.ok(source.includes('function writeOfflineCreateQueue(queue)'));
    assert.ok(source.includes('function readOfflineAppDataCache()'));
    assert.ok(source.includes('function writeOfflineAppDataCache(snapshot)'));
    assert.ok(source.includes('function mergePendingAndCachedNotes(pendingNotes, cachedNotes)'));
    assert.ok(source.includes('const [offlineCreateQueue, setOfflineCreateQueue] = useState(() => readOfflineCreateQueue())'));
    assert.ok(source.includes('function enqueueOfflineCreate(payload'));
    assert.ok(source.includes("status: '待同步到 NAS'"));
    assert.ok(source.includes('function syncOfflineCreateQueue()'));
    assert.ok(source.includes("fetch('/api/notes'"));
    assert.ok(source.includes('setSelectedId((current) => (current === item.localId ? syncedNote.id : current))'));
    assert.ok(source.includes('offlineQueueCount > 0'));
    assert.ok(source.includes('本机记录待同步'));
    assert.ok(source.includes("setDataMode('offline-cache')"));
    assert.ok(source.includes('writeOfflineAppDataCache({'));
    assert.ok(source.includes('notesData.filter((note) => !note.isOffline).slice(0, OFFLINE_APP_DATA_CACHE_LIMIT)'));
    assert.ok(source.includes('const nextNotes = mergePendingAndCachedNotes(pendingNotes, cachedNotes)'));
  });

  test('keeps member management aligned with compact mobile UI', () => {
    const source = readText('src/client/main.jsx');

    assert.ok(source.includes('function MemberManagementScreen'));
    assert.ok(source.includes('text-[18px] font-semibold leading-6 text-ink">家庭成员身份'));
    assert.ok(source.includes('h-12 w-12 shrink-0 border'));
    assert.ok(source.includes('text-[17px] font-semibold text-ink'));
    assert.ok(source.includes('h-9 rounded-2xl border border-line bg-white px-3 text-[13px] font-medium text-muted'));
    assert.ok(!source.includes('text-[26px] font-bold leading-tight">家庭成员身份'));
    assert.ok(!source.includes('h-16 w-16 shrink-0 border'));
  });
  test('does not ship hardcoded sample notes or related records', () => {
    const source = readText('src/client/main.jsx');
    const defaults = readText('src/shared/defaults.js');

    assert.ok(source.includes('const initialNotes = [];'));
    assert.ok(defaults.includes('export const seedNotes = [];'));
    assert.ok(!source.includes('去年卫生间防水维修'));
    assert.ok(!source.includes('物业维修电话'));
    assert.ok(!source.includes('<RelatedRow title='));
    assert.ok(!source.includes('Note Station 导入记录待整理'));
  });
});
