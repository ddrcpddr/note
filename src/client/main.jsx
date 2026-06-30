import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Cloud,
  Database,
  Download,
  FileText,
  Folder,
  Grid2X2,
  HeartPulse,
  Home,
  Inbox,
  KeyRound,
  Lightbulb,
  ListChecks,
  MoreHorizontal,
  Paperclip,
  PawPrint,
  Plus,
  RotateCw,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Tags,
  Trash2,
  Upload,
  UserRound,
  Wrench,
  X
} from 'lucide-react';
import { categoryImageAssets, illustrationAssets, memberAvatarAssets } from './assetMap.js';
import './styles.css';

const tagTones = {
  todo: 'bg-amber-50 text-amber-500 border border-orange-100',
  important: 'bg-rose-50 text-rose-500 border border-red-100',
  repair: 'bg-teal-50 text-teal-600 border border-teal-100',
  shopping: 'bg-green-50 text-green-600 border border-green-100',
  bill: 'bg-blue-50 text-blue-600 border border-blue-100',
  done: 'bg-green-50 text-green-700 border border-green-100'
};

const categories = [
  { id: 'family', name: '家庭事务', count: 128, update: '今天 10:42 更新', icon: Home, imageSrc: categoryImageAssets.family, tone: 'bg-teal-50 text-teal-700' },
  { id: 'house', name: '房屋 / 设备', count: 86, update: '昨天 18:35 更新', icon: Home, imageSrc: categoryImageAssets.house, tone: 'bg-blue-50 text-blue-700' },
  { id: 'repair', name: '维修 / 售后', count: 64, update: '昨天 09:21 更新', icon: Wrench, imageSrc: categoryImageAssets.repair, tone: 'bg-amber-50 text-amber-500' },
  { id: 'shopping', name: '购物 / 消费', count: 102, update: '今天 08:20 更新', icon: ShoppingBag, imageSrc: categoryImageAssets.shopping, tone: 'bg-green-50 text-green-700' },
  { id: 'account', name: '证件 / 账号', count: 57, update: '5月18日 16:30 更新', icon: KeyRound, imageSrc: categoryImageAssets.account, tone: 'bg-purple-50 text-purple-700' },
  { id: 'kids', name: '孩子 / 教育', count: 41, update: '5月17日 21:10 更新', icon: Star, imageSrc: categoryImageAssets.kids, tone: 'bg-amber-50 text-amber-600' },
  { id: 'health', name: '老人 / 健康', count: 33, update: '5月16日 19:05 更新', icon: HeartPulse, imageSrc: categoryImageAssets.health, tone: 'bg-rose-50 text-rose-500' },
  { id: 'pet', name: '宠物', count: 28, update: '5月15日 17:20 更新', icon: PawPrint, imageSrc: categoryImageAssets.pet, tone: 'bg-green-50 text-green-700' },
  { id: 'work', name: '工作 / 杂事', count: 25, update: '5月14日 14:12 更新', icon: Briefcase, imageSrc: categoryImageAssets.work, tone: 'bg-blue-50 text-blue-700' },
  { id: 'temporary', name: '临时记录', count: 19, update: '今天 09:15 更新', icon: FileText, imageSrc: categoryImageAssets.temporary, tone: 'bg-purple-50 text-purple-600' },
  { id: 'uncategorized', name: '未分类 / 待整理', count: 14, update: '5月12日 11:02 更新', icon: Inbox, imageSrc: categoryImageAssets.uncategorized, tone: 'bg-neutral-100 text-neutral-600' }
];

const memberToneClasses = [
  'bg-teal-50 text-teal-700 border-teal-100',
  'bg-rose-50 text-rose-600 border-rose-100',
  'bg-amber-50 text-amber-600 border-amber-100',
  'bg-blue-50 text-blue-600 border-blue-100',
  'bg-green-50 text-green-700 border-green-100',
  'bg-purple-50 text-purple-600 border-purple-100',
  'bg-neutral-100 text-neutral-600 border-neutral-200'
];

const legacyMemberNames = {
  dad: '我',
  mom: '爱人',
  elder: '我',
  history: '我',
  老人: '我',
  历史导入: '我',
  爸爸: '我',
  妈妈: '爱人'
};

const fallbackMembers = [
  { id: 'self', name: '我', avatar: '我', avatarImage: memberAvatarAssets.self, colorClass: memberToneClasses[0], isCurrent: true },
  { id: 'partner', name: '爱人', avatar: '爱', avatarImage: memberAvatarAssets.partner, colorClass: memberToneClasses[1] }
];

const initialNotes = [
  {
    id: 'leak',
    title: '下午联系师傅看漏水',
    summary: '主卧卫生间天花板有渗水，联系王师傅下午 3 点上门查看。',
    content:
      '主卧卫生间天花板有渗水，联系王师傅下午 3 点上门查看。需要拍照留存，顺便问一下厨房水龙头是否也能一起检查。物业说如果确认是楼上管线问题，需要再联系楼上邻居一起处理。',
    category: '家庭事务',
    categoryId: 'family',
    categoryIcon: Home,
    categoryColor: 'text-teal-600',
    icon: Wrench,
    iconTone: 'bg-amber-50 text-amber-500',
    tags: [
      { label: '待办', tone: tagTones.todo },
      { label: '重要', tone: tagTones.important },
      { label: '维修', tone: tagTones.repair }
    ],
    time: '今天 10:42',
    member: '我',
    attachmentCount: 2,
    status: '已保存到 NAS',
    source: '手动创建',
    createdAt: '2026年6月28日 10:42',
    updatedAt: '今天 11:05',
    attachments: ['卫生间天花板渗水.jpg', '维修记录模板.docx']
  },
  {
    id: 'bp',
    title: '买了老人血压计',
    summary: '欧姆龙 J710，上臂式，家里老人用更方便。',
    content: '欧姆龙 J710，上臂式，家里老人用更方便。包装和发票先放在电视柜下面。',
    category: '购物 / 消费',
    categoryId: 'shopping',
    categoryIcon: ShoppingBag,
    categoryColor: 'text-teal-600',
    icon: ShoppingBag,
    iconTone: 'bg-green-50 text-green-600',
    tags: [
      { label: '购物', tone: tagTones.shopping },
      { label: '重要', tone: tagTones.important }
    ],
    time: '昨天 18:35',
    member: '爱人',
    attachmentCount: 1,
    status: '已保存到 NAS',
    source: '手动创建',
    createdAt: '2026年6月27日 18:35',
    updatedAt: '昨天 18:52',
    attachments: ['电子发票.pdf']
  },
  {
    id: 'imported',
    title: 'Note Station 导入记录待整理',
    summary: '从 Note Station 导入的历史记录，需要统一分类和标签。',
    content: '从 Note Station 导入的历史记录，需要统一分类和标签。先保留原始路径和来源，稍后慢慢整理。',
    category: '临时记录',
    categoryId: 'temporary',
    categoryIcon: Folder,
    categoryColor: 'text-teal-600',
    icon: Download,
    iconTone: 'bg-purple-50 text-purple-600',
    tags: [{ label: '待办', tone: tagTones.todo }],
    time: '昨天 09:21',
    member: '我',
    attachmentCount: 3,
    status: '已保存到 NAS',
    source: 'Note Station 导入',
    createdAt: '2026年6月27日 09:21',
    updatedAt: '昨天 09:35',
    attachments: ['notestation_export.zip']
  }
];

const recordTypes = [
  { label: '普通记录', icon: FileText },
  { label: '家庭事务', icon: Home },
  { label: '维修维护', icon: Wrench },
  { label: '购物消费', icon: ShoppingBag },
  { label: '账号资料', icon: UserRound },
  { label: '重要备忘', icon: Star },
  { label: '临时想法', icon: Lightbulb }
];

function App() {
  const [notesData, setNotesData] = useState(initialNotes);
  const [members, setMembers] = useState(fallbackMembers);
  const [currentMemberId, setCurrentMemberId] = useState('self');
  const [dataMode, setDataMode] = useState('mock');
  const [screen, setScreen] = useState('home');
  const [selectedId, setSelectedId] = useState('leak');
  const [homeFilter, setHomeFilter] = useState('all');
  const [homeMember, setHomeMember] = useState('all');
  const [homeCategory, setHomeCategory] = useState('all');
  const [toast, setToast] = useState('');
  const selectedNote = useMemo(() => notesData.find((note) => note.id === selectedId) ?? notesData[0], [notesData, selectedId]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const response = await fetch('/api/app-data');
        if (!response.ok) {
          throw new Error('app data unavailable');
        }

        const data = await response.json();
        if (!isMounted) return;

        const loadedMembers = data.members?.length ? data.members.map((member, index) => normalizeMember(member, index)) : fallbackMembers;
        const nextMembers = keepDefaultMembers(loadedMembers);
        const nextNotes = data.notes?.length ? data.notes.map(normalizeNote) : initialNotes;
        const currentMember = nextMembers.find((member) => member.isCurrent) ?? nextMembers[0] ?? fallbackMembers[0];

        setMembers(nextMembers);
        setCurrentMemberId(currentMember.id);
        setNotesData(nextNotes);
        setSelectedId(nextNotes[0]?.id ?? 'leak');
        setDataMode('sqlite');
      } catch {
        if (!isMounted) return;
        setDataMode('mock');
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  function openDetail(id) {
    setSelectedId(id);
    setScreen('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openEdit() {
    setScreen('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigate(nextScreen) {
    setScreen(nextScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  }

  function openSearch() {
    navigate('search');
  }

  function applyCategory(categoryId) {
    setHomeCategory(categoryId);
    setHomeFilter('all');
    navigate('home');
  }

  async function createMockNote(draft) {
    const category = findCategoryForType(draft.type);
    const body = draft.body.trim() || '刚刚新建的一条家庭记录，稍后可以继续补充细节。';
    const title = draft.title.trim() || body.slice(0, 24);
    const selectedMemberId = draft.memberId || currentMemberId;
    const currentMember = members.find((member) => member.id === selectedMemberId) ?? members[0] ?? fallbackMembers[0];

    if (dataMode === 'sqlite') {
      try {
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content: body,
            categoryId: category.id,
            memberId: currentMember.id,
            noteType: draft.type,
            tags: draft.tags,
            attachments: draft.attachments?.length ? draft.attachments : draft.hasAttachment ? [{ fileName: '家庭记录附件.jpg', originalName: '家庭记录附件.jpg' }] : []
          })
        });

        if (!response.ok) {
          throw new Error('save failed');
        }

        const data = await response.json();
        const note = normalizeNote(data.note);
        setNotesData((current) => [note, ...current]);
        setSelectedId(note.id);
        setScreen('detail');
        showToast('记录已保存到本地数据库');
        return;
      } catch {
        showToast('暂时没有连上家庭记录服务，已先留在当前页面');
      }
    }

    const note = {
      id: `mock-${Date.now()}`,
      title,
      summary: body.slice(0, 42),
      content: body,
      category: category.name,
      categoryId: category.id,
      categoryIcon: category.icon,
      categoryColor: 'text-teal-600',
      icon: category.icon,
      iconTone: category.tone,
      tags: draft.tags.map((label) => ({ label, tone: tagTones[findTagTone(label)] ?? tagTones.done })),
      time: '刚刚',
      member: currentMember.name,
      memberId: currentMember.id,
      attachmentCount: draft.attachments?.length || (draft.hasAttachment ? 1 : 0),
      status: '仅当前页面可见',
      source: '手动创建',
      createdAt: '今天 刚刚',
      updatedAt: '刚刚',
      attachments: draft.attachments?.length ? draft.attachments.map((attachment) => attachment.originalName || attachment.fileName) : draft.hasAttachment ? ['家庭记录附件.jpg'] : []
    };

    setNotesData((current) => [note, ...current]);
    setSelectedId(note.id);
    setScreen('detail');
    showToast('记录已临时保存在当前页面');

    window.setTimeout(() => {
      setNotesData((current) =>
        current.map((item) => (item.id === note.id ? { ...item, status: '等待家庭记录服务恢复', updatedAt: '刚刚' } : item))
      );
    }, 900);
  }

  async function updateExistingNote(draft) {
    const category = draft.categoryId ? categories.find((item) => item.id === draft.categoryId) ?? findCategoryForType(draft.type) : findCategoryForType(draft.type);
    const body = draft.body.trim() || draft.title.trim() || '未命名记录';
    const title = draft.title.trim() || body.slice(0, 24);
    const selectedMemberId = draft.memberId || currentMemberId;
    const currentMember = members.find((member) => member.id === selectedMemberId) ?? members[0] ?? fallbackMembers[0];

    if (dataMode === 'sqlite') {
      try {
        const response = await fetch(`/api/notes/${draft.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content: body,
            categoryId: category.id,
            memberId: currentMember.id,
            noteType: draft.type,
            tags: draft.tags
          })
        });

        if (!response.ok) {
          throw new Error('update failed');
        }

        const data = await response.json();
        const note = normalizeNote(data.note);
        setNotesData((current) => current.map((item) => (item.id === note.id ? note : item)));
        setSelectedId(note.id);
        setScreen('detail');
        showToast('记录已更新');
        return;
      } catch {
        showToast('暂时没有连上家庭记录服务，修改未保存');
        return;
      }
    }

    setNotesData((current) => current.map((item) => (
      item.id === draft.id
        ? {
            ...item,
            title,
            summary: body.slice(0, 42),
            content: body,
            category: category.name,
            categoryId: category.id,
            categoryIcon: category.icon,
            icon: category.icon,
            iconTone: category.tone,
            tags: draft.tags.map((label) => ({ label, tone: tagTones[findTagTone(label)] ?? tagTones.done })),
            member: currentMember.name,
            memberId: currentMember.id,
            updatedAt: '刚刚'
          }
        : item
    )));
    setScreen('detail');
    showToast('记录已在当前页面更新');
  }

  function removeNoteFromCurrentView(noteId, message) {
    const nextNotes = notesData.filter((note) => note.id !== noteId);
    setNotesData(nextNotes);
    setSelectedId(nextNotes[0]?.id ?? '');
    setScreen('home');
    showToast(message);
  }

  async function archiveNote(noteId) {
    if (dataMode === 'sqlite') {
      try {
        const response = await fetch('/api/notes/' + noteId + '/archive', { method: 'POST' });
        if (!response.ok) throw new Error('archive failed');
        removeNoteFromCurrentView(noteId, '记录已归档');
        return;
      } catch {
        showToast('暂时没有连上家庭记录服务，归档未保存');
        return;
      }
    }

    removeNoteFromCurrentView(noteId, '记录已在当前页面归档');
  }

  async function deleteNote(noteId) {
    if (dataMode === 'sqlite') {
      try {
        const response = await fetch('/api/notes/' + noteId, { method: 'DELETE' });
        if (!response.ok) throw new Error('delete failed');
        removeNoteFromCurrentView(noteId, '记录已删除');
        return;
      } catch {
        showToast('暂时没有连上家庭记录服务，删除未保存');
        return;
      }
    }

    removeNoteFromCurrentView(noteId, '记录已从当前页面移除');
  }

  async function switchCurrentMember(memberId) {
    const nextMember = members.find((member) => member.id === memberId);
    if (!nextMember) return;

    setCurrentMemberId(memberId);
    setMembers((current) => current.map((member) => ({ ...member, isCurrent: member.id === memberId })));

    if (dataMode === 'sqlite') {
      try {
        await fetch('/api/members/current', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId })
        });
      } catch {
        showToast('成员切换已在当前页面生效');
      }
    }
  }

  return (
    <main className="mobile-shell">
      {screen === 'home' && (
        <HomeScreen
          notes={notesData}
          filter={homeFilter}
          member={homeMember}
          category={homeCategory}
          onFilterChange={setHomeFilter}
          onMemberChange={setHomeMember}
          onCategoryChange={setHomeCategory}
          onOpenDetail={openDetail}
          onOpenSearch={openSearch}
          members={members}
        />
      )}
      {screen === 'new' && (
        <NewRecordScreen
          members={members}
          currentMemberId={currentMemberId}
          onBack={() => navigate('home')}
          onSave={createMockNote}
        />
      )}
      {screen === 'edit' && selectedNote && (
        <NewRecordScreen
          mode="edit"
          initialNote={selectedNote}
          members={members}
          currentMemberId={currentMemberId}
          onBack={() => navigate('detail')}
          onSave={updateExistingNote}
        />
      )}
      {screen === 'detail' && selectedNote && <DetailScreen note={selectedNote} onBack={() => navigate('home')} onEdit={openEdit} onArchive={archiveNote} onDelete={deleteNote} />}
      {screen === 'search' && <SearchScreen notes={notesData} members={members} onOpenDetail={openDetail} />}
      {screen === 'categories' && <CategoriesScreen notes={notesData} onSelectCategory={applyCategory} />}
      {screen === 'import' && (
        <ImportScreen
          currentMemberId={currentMemberId}
          onBack={() => navigate('settings')}
          onImported={(importedNotes) => {
            const normalized = importedNotes.map(normalizeNote);
            setNotesData((current) => {
              const existingIds = new Set(current.map((note) => note.id));
              return [...normalized.filter((note) => !existingIds.has(note.id)), ...current];
            });
            showToast('导入摘要已更新');
          }}
        />
      )}
      {screen === 'settings' && (
        <SettingsScreen
          members={members}
          currentMemberId={currentMemberId}
          onSwitchMember={switchCurrentMember}
          onOpenImport={() => navigate('import')}
          onOpenMembers={() => navigate('members')}
        />
      )}
      {screen === 'members' && (
        <MemberManagementScreen
          members={members}
          currentMemberId={currentMemberId}
          onBack={() => navigate('settings')}
          onSwitchMember={switchCurrentMember}
        />
      )}

      {(screen === 'home' || screen === 'categories') && (
        <button
          className={`fixed bottom-[104px] right-[max(24px,calc((100vw-430px)/2+24px))] z-40 grid place-items-center rounded-full bg-teal-600 text-white shadow-float ${screen === 'categories' ? 'h-[82px] w-[82px] content-center gap-0.5' : 'h-[74px] w-[74px]'}`}
          type="button"
          aria-label="新建记录"
          onClick={() => navigate('new')}
        >
          <Plus size={screen === 'categories' ? 34 : 36} strokeWidth={2.6} />
          {screen === 'categories' && <span className="text-[12px] font-medium leading-none">记一件事</span>}
        </button>
      )}

      {!['detail', 'new', 'edit', 'import', 'members'].includes(screen) && <BottomNav active={screen} onChange={navigate} />}
      {toast && (
        <div className="fixed bottom-[96px] left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#173f3b] px-5 py-3 text-[15px] font-medium text-white shadow-float">
          {toast}
        </div>
      )}
    </main>
  );
}

function findTagTone(label) {
  if (label === '待办') return 'todo';
  if (label === '重要') return 'important';
  if (label === '维修') return 'repair';
  if (label === '购物') return 'shopping';
  if (label === '账单') return 'bill';
  return 'done';
}

function normalizeMember(member, index = 0) {
  const displayName = legacyMemberNames[member.id] || legacyMemberNames[member.name] || member.name || '家庭成员';
  return {
    id: member.id,
    name: displayName,
    editableName: displayName,
    originalName: member.name,
    avatar: member.avatar || displayName.slice(0, 1) || '家',
    avatarImage: member.avatarImage || memberAvatarAssets[member.id] || memberAvatarAssets[displayName === '爱人' ? 'partner' : 'self'],
    colorClass: member.colorClass || memberToneClasses[index % memberToneClasses.length],
    isCurrent: Boolean(member.isCurrent)
  };
}

function normalizeNote(note) {
  const category = categories.find((item) => item.id === note.categoryId) ?? categories.find((item) => item.id === 'uncategorized') ?? categories[0];
  const tags = Array.isArray(note.tags) ? note.tags.map((tag) => tag.label || tag.name || tag).filter(Boolean) : [];
  const attachments = Array.isArray(note.attachments) ? note.attachments : [];
  const sourceType = note.sourceType || 'manual';

  return {
    id: note.id,
    title: note.title,
    summary: note.summary || note.content?.slice(0, 42) || note.title,
    content: note.content || note.summary || note.title,
    category: displayCategoryName(note.categoryName || category.name, category.id),
    categoryId: note.categoryId || category.id,
    categoryIcon: category.icon,
    categoryImageSrc: category.imageSrc,
    categoryColor: 'text-teal-600',
    icon: category.icon,
    iconTone: category.tone,
    tags: tags.map((label) => ({ label, tone: tagTones[findTagTone(label)] ?? tagTones.done })),
    time: formatShortTime(note.occurredAt || note.createdAt),
    member: displayMemberName(note.memberName || note.member || '我', note.memberId),
    memberId: note.memberId || 'self',
    memberAvatar: note.memberAvatar || displayMemberName(note.memberName || note.member || '我', note.memberId).slice(0, 1),
    memberAvatarImage: note.memberAvatarImage || memberAvatarAssets[note.memberId] || null,
    attachmentCount: attachments.length,
    status: note.saveStatus === 'saved' ? '已保存到 NAS' : '保存中',
    source: sourceType === 'notestation_import' ? 'Note Station 导入' : '手动创建',
    sourceType,
    isArchived: Boolean(note.isArchived),
    originalPath: note.originalPath || '',
    originalCategory: displayCategoryName(note.originalCategory || '', note.categoryId),
    originalCreatedAt: note.originalCreatedAt ? formatLongTime(note.originalCreatedAt) : '',
    originalUpdatedAt: note.originalUpdatedAt ? formatLongTime(note.originalUpdatedAt) : '',
    createdAt: formatLongTime(note.createdAt),
    updatedAt: formatShortTime(note.updatedAt),
    attachments: attachments.map((attachment) => attachment.originalName || attachment.fileName || attachment)
  };
}

function keepDefaultMembers(memberList) {
  const visible = fallbackMembers.map((fallback) => memberList.find((member) => member.name === fallback.name) || fallback);
  if (!visible.some((member) => member.isCurrent)) {
    return visible.map((member, index) => ({ ...member, isCurrent: index === 0 }));
  }
  return visible;
}

function displayMemberName(name, memberId) {
  return legacyMemberNames[memberId] || legacyMemberNames[name] || name || '我';
}

function displayCategoryName(name, categoryId) {
  if (categoryId === 'uncategorized' || name === '未分类') return '未分类 / 待整理';
  return name;
}

function formatShortTime(value) {
  if (!value) return '刚刚';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatLongTime(value) {
  if (!value) return '刚刚';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function findCategoryForType(type) {
  if (type.includes('维修')) return categories.find((item) => item.id === 'repair');
  if (type.includes('购物')) return categories.find((item) => item.id === 'shopping');
  if (type.includes('账号')) return categories.find((item) => item.id === 'account');
  if (type.includes('临时')) return categories.find((item) => item.id === 'temporary');
  return categories.find((item) => item.name === type) ?? categories[0];
}

function attachmentLabel(isEditing, initialNote, attachmentFiles, hasAttachment) {
  if (isEditing) return `附件暂不在编辑里修改（${initialNote?.attachmentCount || 0}）`;
  if (attachmentFiles.length === 1) return attachmentFiles[0].name;
  if (attachmentFiles.length > 1) return `已选择 ${attachmentFiles.length} 个附件`;
  if (hasAttachment) return '已添加附件';
  return '添加照片 / 文件';
}

function fileToAttachmentPayload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve({
        fileName: file.name,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size,
        contentBase64: result.includes(',') ? result.split(',')[1] : result
      });
    };
    reader.onerror = () => reject(reader.error || new Error('attachment read failed'));
    reader.readAsDataURL(file);
  });
}

function recordTypeForNote(note) {
  if (note.categoryId === 'repair') return '维修维护';
  if (note.categoryId === 'shopping') return '购物消费';
  if (note.categoryId === 'account') return '账号资料';
  if (note.categoryId === 'temporary') return '临时想法';
  return recordTypes.some((recordType) => recordType.label === note.category) ? note.category : '家庭事务';
}

function filterNotes(notes, { filter = 'all', member = 'all', category = 'all', query = '', tag = 'all', source = 'all' }) {
  const keyword = query.trim().toLowerCase();
  const categoryItem = categories.find((item) => item.id === category);

  return notes.filter((note) => {
    const tags = note.tags.map((item) => item.label);
    const matchesQuick =
      filter === 'all' ||
      (filter === 'todo' && tags.includes('待办')) ||
      (filter === 'important' && tags.includes('重要')) ||
      (filter === 'attachments' && note.attachmentCount > 0);
    const matchesMember = member === 'all' || note.member === member;
    const matchesCategory =
      category === 'all' ||
      note.categoryId === category ||
      note.category === category ||
      (categoryItem && tags.some((tagLabel) => categoryItem.name.includes(tagLabel)));
    const matchesTag = tag === 'all' || tags.includes(tag);
    const matchesSource = source === 'all' || note.sourceType === source;
    const matchesQuery =
      !keyword ||
      [note.title, note.summary, note.content, note.category, note.member, note.source, ...tags]
        .join(' ')
        .toLowerCase()
        .includes(keyword);

    return matchesQuick && matchesMember && matchesCategory && matchesTag && matchesSource && matchesQuery;
  });
}

function AvatarMark({ src, label, className = 'h-6 w-6', imageClassName = '' }) {
  if (src) {
    return <img className={`${className} rounded-full object-cover ${imageClassName}`} src={src} alt={`${label}头像`} loading="lazy" />;
  }
  return <span className={`grid shrink-0 place-items-center rounded-full bg-white/70 text-[12px] ${className}`}>{label?.slice(0, 1) || '家'}</span>;
}

function CategoryMark({ src, fallback: Fallback, label, className = 'h-6 w-6', iconSize = 18 }) {
  if (src) {
    return <img className={`${className} shrink-0 rounded-full object-cover`} src={src} alt={`${label}图标`} loading="lazy" />;
  }
  return <Fallback className="shrink-0" size={iconSize} />;
}

function IllustrationImage({ src, alt, className = 'mx-auto h-32 w-full max-w-[220px]' }) {
  if (!src) return null;
  return <img className={`${className} object-contain`} src={src} alt={alt} loading="lazy" />;
}

function HomeScreen({ notes, filter, member, category, members, onFilterChange, onMemberChange, onCategoryChange, onOpenDetail, onOpenSearch }) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const hasAdvancedFilter = member !== 'all' || category !== 'all';
  const visibleNotes = filterNotes(notes, { filter, member, category });
  const categoryName = categories.find((item) => item.id === category)?.name ?? '全部分类';
  return (
    <>
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[25px] font-bold leading-none text-teal-600">家事记</h1>
            <Home className="mt-0.5 text-teal-600" size={25} strokeWidth={2.2} />
          </div>
          <p className="mt-2 text-[15px] text-muted">记录家里的大小事</p>
        </div>
        <div className="flex gap-3 pt-2 text-teal-700">
          <Clock3 size={26} />
          <MoreHorizontal size={26} className="text-ink" />
        </div>
      </header>
      <SearchPill placeholder="搜索记录、标签或内容" onClick={onOpenSearch} />
      <QuickFilters active={filter} onChange={onFilterChange} showMore={showMoreFilters} onToggleMore={() => setShowMoreFilters((value) => !value)} />
      {(showMoreFilters || hasAdvancedFilter) && (
        <section className="mt-3 rounded-[20px] border border-line/70 bg-white/80 px-3 py-3 shadow-[0_6px_18px_rgba(39,43,48,0.045)]">
          <p className="px-1 text-[13px] text-muted">更多筛选</p>
          <MemberFilters members={members} active={member} onChange={onMemberChange} />
          <CategoryFilters active={category} onChange={onCategoryChange} />
        </section>
      )}
      <TodayCard />
      <SectionHeader
        title={category === 'all' ? '最新记录' : categoryName}
        trailing={<><RotateCw size={18} /> {visibleNotes.length} 条</>}
      />
      <section className="mt-3 space-y-4">
        {visibleNotes.map((note) => (
          <RecordCard key={note.id} note={note} onClick={() => onOpenDetail(note.id)} />
        ))}
        {visibleNotes.length === 0 && <EmptyState title="这里暂时没有记录" desc="换个分类、成员或筛选条件看看，也可以先新建一条。" image={illustrationAssets.emptyHome} />}
      </section>
    </>
  );
}

function NewRecordScreen({ members, currentMemberId, onBack, onSave, mode = 'create', initialNote = null }) {
  const isEditing = mode === 'edit' && initialNote;
  const [title, setTitle] = useState(initialNote?.title || '');
  const [body, setBody] = useState(initialNote?.content || '');
  const [type, setType] = useState(initialNote ? recordTypeForNote(initialNote) : '家庭事务');
  const [tags, setTags] = useState(initialNote?.tags?.length ? initialNote.tags.map((tag) => tag.label) : ['待办', '重要']);
  const [hasAttachment, setHasAttachment] = useState(Boolean(initialNote?.attachmentCount));
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(initialNote?.memberId || currentMemberId);
  const currentMember = members.find((member) => member.id === selectedMemberId) ?? members[0] ?? fallbackMembers[0];
  const tagOptions = ['待办', '重要', '维修', '购物', '账单'];

  function toggleTag(label) {
    setTags((current) => (current.includes(label) ? current.filter((item) => item !== label) : [...current, label]));
  }

  async function save() {
    const originalType = initialNote ? recordTypeForNote(initialNote) : null;
    const preservedCategoryId = isEditing && type === originalType ? initialNote.categoryId : undefined;
    const attachments = isEditing ? [] : await Promise.all(attachmentFiles.map(fileToAttachmentPayload));
    onSave({ id: initialNote?.id, title, body, type, categoryId: preservedCategoryId, memberId: currentMember.id, tags: tags.length ? tags : ['待办'], hasAttachment: hasAttachment || attachments.length > 0, attachments });
  }

  return (
    <>
      <TopBar title={isEditing ? "编辑记录" : "新记录"} onBack={onBack} action="保存" onAction={save} />
      <section className="soft-card mt-5 flex h-[58px] items-center gap-4 px-5 text-[19px] text-muted">
        <span className="text-[28px]">T</span>
        <input
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="标题（可选）"
        />
      </section>
      <section className="soft-card mt-4 min-h-[214px] p-5">
        <div className="flex gap-4 text-[17px] text-muted">
          <FileText className="mt-1 shrink-0" size={25} />
          <textarea
            className="min-h-[156px] min-w-0 flex-1 resize-none bg-transparent leading-relaxed outline-none placeholder:text-muted"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="写下家里的小事、账单、维修、临时备忘..."
          />
        </div>
        <div className="mt-4 text-right text-[15px] text-muted">{body.length}/1000</div>
      </section>
      <section className="mt-5 flex items-center justify-between gap-3 rounded-[20px] border border-line/70 bg-white/80 px-4 py-3 shadow-[0_6px_18px_rgba(39,43,48,0.045)]">
        <div className="flex min-w-0 items-center gap-3">
          <AvatarMark src={currentMember.avatarImage} label={currentMember.name} className={`h-9 w-9 shrink-0 border ${currentMember.colorClass}`} />
          <div className="min-w-0">
            <p className="truncate text-[15px] text-muted">当前成员</p>
            <p className="truncate text-[17px] font-semibold text-ink">{currentMember.name}</p>
          </div>
        </div>
        <div className="scroll-row flex max-w-[190px] gap-2 pb-1">
          {members.map((member) => (
            <button
              className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-[14px] ${selectedMemberId === member.id ? member.colorClass : 'border-line bg-white text-muted'}`}
              key={member.id}
              type="button"
              onClick={() => setSelectedMemberId(member.id)}
            >
              {member.name}
            </button>
          ))}
        </div>
      </section>
      <SectionTitle>记录类型</SectionTitle>
      <section className="grid grid-cols-4 gap-3">
        {recordTypes.map((recordType) => {
          const Icon = recordType.icon;
          return (
            <button
              className={`soft-card flex h-[80px] flex-col items-center justify-center gap-2 px-1 text-[15px] ${
                type === recordType.label ? 'border-teal-600 bg-teal-50 text-teal-700' : 'text-ink'
              }`}
              key={recordType.label}
              type="button"
              onClick={() => setType(recordType.label)}
            >
              <Icon size={25} strokeWidth={2.1} />
              {recordType.label}
            </button>
          );
        })}
      </section>
      <SectionTitle>标签</SectionTitle>
      <section className="soft-card flex flex-wrap gap-3 p-4">
        {tagOptions.map((label) => (
          <button
            className={`tag ${tags.includes(label) ? tagTones[findTagTone(label)] : 'border border-line bg-white text-muted'}`}
            key={label}
            type="button"
            onClick={() => toggleTag(label)}
          >
            {label} {tags.includes(label) && <X className="ml-1" size={14} />}
          </button>
        ))}
        <span className="inline-flex items-center rounded-xl border border-dashed border-line px-3 py-1.5 text-[15px] text-muted">
          <Plus size={17} /> 添加标签
        </span>
      </section>
      <SectionTitle>附件</SectionTitle>
      {!isEditing && (
        <input
          className="hidden"
          id="record-attachment-input"
          multiple
          type="file"
          onChange={(event) => {
            const files = Array.from(event.target.files || []);
            setAttachmentFiles(files);
            setHasAttachment(files.length > 0);
          }}
        />
      )}
      <label className={`soft-card flex min-h-[72px] w-full items-center justify-between px-5 py-4 text-left ${isEditing ? 'opacity-75' : 'cursor-pointer'}`} htmlFor={isEditing ? undefined : 'record-attachment-input'}>
        <span className="inline-flex min-w-0 items-center gap-4 text-[17px] text-muted">
          <Paperclip className="shrink-0 text-teal-600" size={28} />
          <span className="min-w-0">{attachmentLabel(isEditing, initialNote, attachmentFiles, hasAttachment)}</span>
        </span>
        {hasAttachment ? <CheckCircle2 className="shrink-0 text-teal-600" /> : <ChevronRight className="shrink-0 text-muted" />}
      </label>
      <div className="bottom-action-bar flex h-[92px] items-center gap-4 px-5 py-4">
        <button className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl text-[17px] font-medium text-teal-600" type="button">
          <FileText size={22} /> {isEditing ? '保留原附件' : '存为模板'}
        </button>
        <button className="flex h-14 flex-[1.6] items-center justify-center gap-2 rounded-2xl bg-teal-600 text-[18px] font-semibold text-white shadow-float" type="button" onClick={save}>
          <Check size={24} /> {isEditing ? '保存修改' : '保存记录'}
        </button>
      </div>
    </>
  );
}

function SearchScreen({ notes, members, onOpenDetail }) {
  const [query, setQuery] = useState('漏水');
  const [category, setCategory] = useState('all');
  const [tag, setTag] = useState('待办');
  const [member, setMember] = useState('all');
  const [range, setRange] = useState('全部时间');
  const [source, setSource] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const hasAdvancedSearch = member !== 'all' || source !== 'all';
  const results = filterNotes(notes, { query, category, tag, member, source });
  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setTag('all');
    setMember('all');
    setSource('all');
    setRange('全部时间');
  };

  return (
    <>
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[25px] font-bold leading-none text-[#093f3e]">搜索</h1>
          <p className="mt-2 text-[15px] text-muted">快速找到你需要的记录</p>
        </div>
        <button className="chip mt-3 px-3">
          <Clock3 size={19} /> 历史
        </button>
      </header>
      <section className="soft-card mt-5 flex h-[62px] items-center gap-4 px-5">
        <Search size={29} className="text-muted" />
        <input
          className="min-w-0 flex-1 bg-transparent text-[20px] font-medium outline-none placeholder:text-muted"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="输入关键词"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="清空搜索">
            <X size={23} className="text-muted" />
          </button>
        )}
        <span className="h-8 w-px bg-line" />
        <span className="text-[17px] font-medium text-teal-600">搜索</span>
      </section>
      <section className="soft-card mt-5 divide-y divide-line p-4">
        <FilterRow title="分类" options={['all', 'family', 'repair', 'shopping', 'temporary']} labels={{ all: '全部', family: '家庭事务', repair: '维修', shopping: '购物', temporary: '临时' }} active={category} onChange={setCategory} />
        <FilterRow title="标签" options={['all', '待办', '重要', '维修', '购物']} labels={{ all: '全部' }} active={tag} onChange={setTag} />
        <FilterRow title="时间范围" options={['全部时间', '本月', '今年']} active={range} onChange={setRange} />
        <div className="flex items-center justify-between gap-3 py-3">
          <span className="text-[16px] font-medium">更多</span>
          <button
            className={`chip ${showAdvancedFilters ? 'border-teal-600 bg-teal-50 text-teal-700' : ''}`}
            type="button"
            onClick={() => setShowAdvancedFilters((value) => !value)}
          >
            成员 / 来源 <MoreHorizontal size={18} />
          </button>
        </div>
        {(showAdvancedFilters || hasAdvancedSearch) && (
          <div className="space-y-1 pt-3">
            <FilterRow title="成员" options={['all', ...members.map((item) => item.name)]} labels={{ all: '全部成员' }} active={member} onChange={setMember} />
            <FilterRow title="来源" options={['all', 'manual', 'notestation_import']} labels={{ all: '全部', manual: '手动创建', notestation_import: 'Note Station 导入' }} active={source} onChange={setSource} />
          </div>
        )}
      </section>
      <SectionHeader
        title={`找到 ${results.length} 条相关记录`}
        trailing={<button type="button" onClick={clearFilters} className="text-muted">清除筛选</button>}
      />
      <section className="mt-3 space-y-4">
        {results.map((note) => (
          <RecordCard key={note.id} note={note} onClick={() => onOpenDetail(note.id)} />
        ))}
      </section>
      {results.length === 0 && <EmptyState title="没有找到匹配记录" desc="可以换个关键词，或少选一些分类、标签和成员条件。" image={illustrationAssets.emptySearch} />}
    </>
  );
}

function CategoriesScreen({ notes, onSelectCategory }) {
  const [query, setQuery] = useState('');
  const importedToReviewCount = notes.filter((note) => note.sourceType === 'notestation_import' && note.categoryId === 'uncategorized').length;
  const visibleCategories = categories
    .map((category) => ({
      ...category,
      count: notes.filter((note) => note.categoryId === category.id).length,
      update: notes.some((note) => note.categoryId === category.id) ? '最近有更新' : category.update
    }))
    .filter((category) => category.name.includes(query.trim()));
  return (
    <>
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[25px] font-bold leading-none text-[#093f3e]">分类</h1>
          <p className="mt-2 text-[15px] text-muted">按家里的事情慢慢整理</p>
        </div>
        <button className="grid h-12 w-12 place-items-center rounded-full bg-white text-teal-600 shadow-card">
          <Grid2X2 size={25} />
        </button>
      </header>
      <section className="soft-card mt-6 flex h-[58px] w-full items-center gap-4 rounded-[20px] bg-[#f4f3ef] px-5 text-left text-[20px] text-[#8b8e94] shadow-card">
        <Search size={28} className="text-[#777b82]" />
        <input
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#8b8e94]"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索分类"
        />
      </section>
      <section className="mt-5 grid grid-cols-2 gap-3">
        {visibleCategories.map((category) => {
          const Icon = category.icon;
          return (
            <button className="soft-card flex min-h-[106px] w-full items-center gap-2.5 p-3 text-left" key={category.id} type="button" onClick={() => onSelectCategory(category.id)}>
              <div className={`circle-icon h-12 w-12 bg-white ${category.tone}`}>
                <CategoryMark src={category.imageSrc} fallback={Icon} label={category.name} className="h-10 w-10" iconSize={27} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[17px] font-bold leading-tight">{category.name}</h2>
                <p className="mt-2 text-[13px] font-medium text-teal-600">{category.count} 条记录</p>
                <p className="mt-1 text-[12px] text-muted">{category.update}</p>
                {category.id === 'uncategorized' && importedToReviewCount > 0 && (
                  <p className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                    {importedToReviewCount} 条导入记录待整理
                  </p>
                )}
              </div>
              <ChevronRight className="shrink-0 text-muted" size={16} />
            </button>
          );
        })}
        {visibleCategories.length === 0 && <EmptyState title="暂时没有这个分类" desc="后续可以在分类管理中添加新的家庭分类。" image={illustrationAssets.emptyHome} />}
      </section>
    </>
  );
}

function ImportScreen({ currentMemberId, onBack, onImported }) {
  const [stage, setStage] = useState(1);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const steps = [
    ['1', '选择文件'],
    ['2', '预览记录'],
    ['3', '确认导入'],
    ['4', '导入完成']
  ];
  const canPreview = stage >= 2;

  async function createPreview() {
    setError('');
    try {
      const response = await fetch('/api/imports/notestation/sample-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: currentMemberId })
      });
      if (!response.ok) throw new Error('无法创建导入预览');
      const data = await response.json();
      setPreview(data);
      setStage(2);
    } catch (previewError) {
      setError(previewError.message || '导入预览没有完成，已有记录不会被修改。');
    }
  }

  async function commitImport() {
    if (!preview?.importId) return;
    setError('');
    try {
      const response = await fetch(`/api/imports/notestation/${preview.importId}/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: currentMemberId })
      });
      if (!response.ok) throw new Error('确认导入失败');
      const data = await response.json();
      setPreview(data);
      onImported(data.notes || []);
      setStage(4);
    } catch (commitError) {
      setError(commitError.message || '导入没有完成，已有记录不会被修改。');
    }
  }

  function handlePrimaryAction() {
    if (stage === 1) {
      createPreview();
      return;
    }
    if (stage === 2) {
      setStage(3);
      return;
    }
    if (stage === 3) {
      commitImport();
    }
  }

  return (
    <>
      <TopBar title="导入 Note Station" onBack={onBack} />
      <section className="mt-6 flex items-start justify-between gap-1">
        {steps.map(([num, label], index) => (
          <div className="flex min-w-0 flex-1 flex-col items-center gap-3 text-center" key={num}>
            <div className={`grid h-11 w-11 place-items-center rounded-full border text-[18px] ${stage === index + 1 ? 'border-teal-600 bg-teal-600 text-white' : stage > index + 1 ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-line bg-white text-muted'}`}>
              {stage > index + 1 ? <Check size={20} /> : num}
            </div>
            <p className={stage >= index + 1 ? 'text-[13px] leading-tight text-teal-600' : 'text-[13px] leading-tight text-muted'}>{label}</p>
          </div>
        ))}
      </section>
      <section className="soft-card mt-5 p-4">
        <div className="flex items-center gap-4">
          <div className="grid h-[72px] w-14 shrink-0 place-items-center rounded-xl bg-teal-600 text-[20px] font-bold text-white">
            ZIP
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[20px] font-bold">{canPreview ? preview?.fileName || 'Note Station 导入摘要' : '等待选择 .nsx 导出文件'}</h2>
            <p className="mt-1 text-[15px] text-muted">{canPreview ? '2.4 MB · 2025-05-18 20:11' : '先查看内容，再决定是否导入'}</p>
          </div>
        </div>
        <span className="mt-4 inline-flex items-center gap-2 text-[16px] font-medium text-teal-600">
          {canPreview ? <><CheckCircle2 size={22} /> 已解析</> : <><Upload size={22} /> 选择导出文件</>}
        </span>
      </section>
      {error && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[15px] text-amber-600">
          {error}
        </div>
      )}
      {canPreview && preview && (
        <>
          <section className="soft-card mt-4 p-5">
            <div className="grid grid-cols-4 gap-3">
              {[
                ['记录', `${preview.totalCount} 条`, FileText, 'text-teal-600'],
                ['分类', `${preview.originalCategoryCount} 个`, Folder, 'text-blue-600'],
                ['附件', `${preview.attachmentCount} 个`, Paperclip, 'text-teal-600'],
                ['失败项', `${preview.failedCount} 个`, AlertCircle, 'text-amber-500']
              ].map(([label, value, Icon, tone]) => (
                <div className="rounded-2xl bg-soft px-2 py-3 text-center" key={label}>
                  <Icon className={`mx-auto ${tone}`} size={28} />
                  <p className="mt-2 text-[13px] text-muted">{label}</p>
                  <p className="mt-1 text-[16px] font-bold">{stage === 4 && label === '失败项' ? '已跳过' : value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-teal-50 px-4 py-3 text-[15px] text-teal-700">
              <ShieldCheck className="mt-0.5 shrink-0" size={21} /> <span>{stage === 4 ? '导入完成后可查看摘要；失败项会保留，不会静默丢失。' : '导入前会先预览并自动备份，现有记录不会被覆盖。'}</span>
            </div>
          </section>
          <section className="soft-card mt-4 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[19px] font-bold">预览记录（{preview.records.length} 条）</h2>
              <span className="text-[16px] text-teal-600">查看全部</span>
            </div>
            {preview.records.map((record) => (
              <div className="mt-4 flex gap-3 border-t border-line pt-4" key={record.originalId}>
                <div className="circle-icon bg-teal-50 text-teal-600">
                  <FileText size={28} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[17px] font-bold">{record.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">{record.content}</p>
                  <p className="mt-1 text-[13px] text-muted">{record.originalPath}</p>
                </div>
                <span className="tag h-fit shrink-0 bg-teal-50 text-teal-600">{record.originalCategory}</span>
              </div>
            ))}
          </section>
          {preview.failures.length > 0 && (
            <section className="soft-card mt-4 p-5">
              <h2 className="text-[19px] font-bold">失败项</h2>
              {preview.failures.map((failure) => (
                <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-[15px] text-amber-700" key={failure.id}>
                  <p className="font-semibold">{failure.originalTitle}</p>
                  <p className="mt-1">{failure.errorMessage}</p>
                  <p className="mt-1 text-[13px]">{failure.originalPath}</p>
                </div>
              ))}
            </section>
          )}
          <section className="soft-card mt-4 p-5">
            <h2 className="text-[19px] font-bold">检测到的分类</h2>
            <div className="scroll-row mt-4 flex gap-2">
              {[...new Set(preview.records.map((record) => record.originalCategory))].map((label) => (
                <span className="chip" key={label}>{label}</span>
              ))}
            </div>
            <p className="mt-4 text-[15px] text-muted">无法准确映射的记录会先放入未分类 / 待整理，并保留原始路径方便之后整理。</p>
          </section>
        </>
      )}
      <div className="bottom-action-bar grid h-[88px] grid-cols-2 gap-4 px-4 py-4">
        <button className="rounded-2xl border border-teal-600 text-[17px] font-medium text-teal-600" type="button" onClick={() => { setStage(1); setPreview(null); }}>
          {canPreview ? '重新选择文件' : '取消'}
        </button>
        <button className="rounded-2xl bg-teal-600 text-[17px] font-semibold text-white shadow-float" type="button" onClick={handlePrimaryAction}>
          {stage === 1 ? '预览记录' : stage === 2 ? '继续确认' : stage === 3 ? '开始导入' : '已完成'}
        </button>
      </div>
    </>
  );
}

function DetailScreen({ note, onBack, onEdit, onArchive, onDelete }) {
  const [showActions, setShowActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const Icon = note.icon;
  const CategoryIcon = note.categoryIcon;
  return (
    <>
      <TopBar title="记录详情" onBack={onBack} action="编辑" onAction={onEdit} />
      <section className="soft-card mt-5 p-4">
        <div className="flex gap-4">
          <div className={`circle-icon h-[72px] w-[72px] bg-white ${note.iconTone}`}>
            <CategoryMark src={note.categoryImageSrc || categoryImageAssets[note.categoryId]} fallback={Icon} label={note.category} className="h-14 w-14" iconSize={38} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between gap-2">
              <h2 className="min-w-0 text-[16px] font-bold leading-tight" style={{ overflowWrap: 'anywhere' }}>{note.title}</h2>
              <span className="text-[25px] text-muted">☆</span>
            </div>
            <div className={`mt-3 flex items-center gap-2 text-[17px] font-medium ${note.categoryColor}`}>
              <CategoryMark src={note.categoryImageSrc || categoryImageAssets[note.categoryId]} fallback={CategoryIcon} label={note.category} className="h-6 w-6" iconSize={23} /> {note.category} <ChevronRight size={18} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span className={`tag ${tag.tone}`} key={tag.label}>{tag.label}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 space-y-3.5 border-t border-line pt-5 text-[16px] text-muted">
          <MetaRow icon={CalendarDays} label="创建" value={note.createdAt} />
          <MetaRow icon={Clock3} label="更新" value={note.updatedAt} />
          <MetaRow icon={FileText} label="来源" value={note.source} />
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-[14px] font-medium text-teal-700"><UserRound size={16} /> {note.member}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1.5 text-[14px] font-medium text-muted"><Cloud size={16} /> {note.status}</span>
          </div>
        </div>
        {note.sourceType === 'notestation_import' && (
          <div className="mt-5 rounded-2xl bg-teal-50/70 p-4 text-[15px] leading-relaxed text-muted">
            <p className="font-semibold text-teal-700">Note Station 来源信息</p>
            <div className="mt-3 space-y-2">
              <p className="break-words"><span className="text-[#24312f]">原始分类：</span>{note.originalCategory || '未分类 / 待整理'}</p>
              <p className="break-words"><span className="text-[#24312f]">原始路径：</span>{note.originalPath || '已标记为 Note Station 导入，原始路径待整理'}</p>
            </div>
          </div>
        )}
      </section>
      <section className="soft-card mt-4 p-5">
        <h2 className="flex items-center gap-3 text-[20px] font-bold text-teal-600"><ListChecks size={22} /> 内容</h2>
        <p className="mt-4 text-[18px] leading-[1.8]">{note.content}</p>
      </section>
      <section className="soft-card mt-4 p-5">
        <h2 className="flex items-center gap-3 text-[20px] font-bold text-teal-600"><Paperclip size={23} /> 附件（{note.attachments.length}）</h2>
        <div className="mt-4 space-y-3">
          {note.attachments.map((name) => (
            <div className="flex items-center justify-between rounded-2xl border border-line p-3" key={name}>
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-teal-50 text-teal-600"><FileText size={29} /></div>
                <div>
                  <p className="text-[16px] font-medium">{name}</p>
                  <p className="mt-1 text-[14px] text-muted">保存在 NAS 附件目录</p>
                </div>
              </div>
              <Download className="text-teal-600" size={24} />
            </div>
          ))}
        </div>
      </section>
      <section className="soft-card mt-4 p-5">
        <h2 className="text-[20px] font-bold text-teal-600">关联记录</h2>
        <RelatedRow title="去年卫生间防水维修" meta="维修 · 已完成" />
        <RelatedRow title="物业维修电话" meta="家庭事务 · 联系方式" />
      </section>
      {showActions && (
        <section className="fixed bottom-[92px] left-1/2 z-40 w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2 rounded-3xl border border-line bg-white p-3 shadow-float">
          <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left" type="button" onClick={() => onArchive(note.id)}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-50 text-teal-600"><Archive size={21} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-semibold text-[#24312f]">归档记录</span>
              <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">从首页和搜索中隐藏，数据仍保留在数据库里。</span>
            </span>
          </button>
          <button className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left" type="button" onClick={() => (confirmDelete ? onDelete(note.id) : setConfirmDelete(true))}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-rose-50 text-rose-600"><Trash2 size={21} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-semibold text-rose-600">{confirmDelete ? '确认删除' : '删除记录'}</span>
              <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">软删除记录，不会删除附件文件。</span>
            </span>
          </button>
        </section>
      )}
      <div className="bottom-action-bar flex h-[78px] items-center justify-between px-8 py-3">
        <button className="flex flex-col items-center gap-1 text-muted" type="button" onClick={() => { setShowActions((value) => !value); setConfirmDelete(false); }}>
          {showActions ? <X size={28} /> : <MoreHorizontal size={28} />}<span className="text-[13px]">更多</span>
        </button>
        <button className="inline-flex h-[52px] items-center gap-3 rounded-2xl bg-teal-600 px-7 py-3 text-[18px] font-semibold text-white shadow-float" type="button"><Share2 size={25} /> 分享记录</button>
      </div>
    </>
  );
}

function formatStoragePath(value, fallback) {
  if (!value) return fallback;
  const normalized = String(value).replace(/\\/g, '/');
  const dataIndex = normalized.lastIndexOf('/data/');
  if (dataIndex >= 0) return normalized.slice(dataIndex + 1);
  if (normalized.startsWith('data/')) return normalized;
  return fallback;
}

function MemberManagementScreen({ members, currentMemberId, onBack, onSwitchMember }) {
  return (
    <>
      <TopBar title="成员管理" onBack={onBack} />
      <section className="soft-card mt-5 p-4">
        <div className="flex items-start gap-4">
          <div className="circle-icon bg-teal-50 text-teal-600"><UserRound size={34} /></div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[26px] font-bold leading-tight">家庭成员身份</h1>
            <p className="mt-2 text-[16px] leading-relaxed text-muted">当前版本先固定“我”和“爱人”两个成员，并支持切换当前记录人。</p>
          </div>
        </div>
      </section>
      <SectionTitle>当前成员</SectionTitle>
      <section className="soft-card p-4">
        {members.filter((member) => member.id === currentMemberId).map((member) => (
          <div className="flex items-center gap-4" key={member.id}>
            <AvatarMark src={member.avatarImage} label={member.name} className={`h-16 w-16 shrink-0 border ${member.colorClass}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[22px] font-bold">{member.name}</p>
              <p className="mt-1 text-[15px] text-muted">新建记录会默认归到这个成员名下</p>
            </div>
            <CheckCircle2 className="shrink-0 text-teal-600" size={26} />
          </div>
        ))}
      </section>
      <SectionTitle>家庭成员列表</SectionTitle>
      <section className="space-y-3">
        {members.map((member) => {
          const isCurrent = member.id === currentMemberId;
          return (
            <article className="soft-card p-4" key={member.id}>
              <div className="flex items-center gap-4">
                <AvatarMark src={member.avatarImage} label={member.name} className={`h-14 w-14 shrink-0 border ${member.colorClass}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <h2 className="truncate text-[20px] font-bold">{member.name}</h2>
                    {isCurrent && <span className="tag bg-teal-50 text-teal-600">当前</span>}
                  </div>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">当前先支持切换记录人；改名、头像和颜色稍后再开放。</p>
                </div>
                <button className="shrink-0 text-teal-600" type="button" onClick={() => onSwitchMember(member.id)} aria-label={`切换到${member.name}`}>
                  {isCurrent ? <CheckCircle2 size={25} /> : <ChevronRight size={24} />}
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button className="rounded-2xl border border-line bg-white px-3 py-2 text-[14px] text-muted opacity-60" type="button" disabled>改名</button>
                <button className="rounded-2xl border border-line bg-white px-3 py-2 text-[14px] text-muted opacity-60" type="button" disabled>头像</button>
                <button className="rounded-2xl border border-line bg-white px-3 py-2 text-[14px] text-muted opacity-60" type="button" disabled>颜色</button>
              </div>
            </article>
          );
        })}
      </section>
      <section className="mt-4 rounded-2xl border border-dashed border-line bg-white/70 p-4 text-[15px] leading-relaxed text-muted">
        当前版本先固定使用“我”和“爱人”；新增成员、改名和头像颜色编辑以后再做。
      </section>
    </>
  );
}
function SettingsScreen({ members, currentMemberId, onSwitchMember, onOpenImport, onOpenMembers }) {
  const [nasOnline, setNasOnline] = useState(true);
  const [lastBackup, setLastBackup] = useState('今天 09:30');
  const [backupState, setBackupState] = useState('idle');
  const [storageStatus, setStorageStatus] = useState(null);
  const [storageMessage, setStorageMessage] = useState('');

  useEffect(() => {
    async function loadStorageStatus() {
      try {
        const response = await fetch('/api/storage/status');
        if (!response.ok) throw new Error('storage unavailable');
        const data = await response.json();
        setStorageStatus(data);
        if (data.latestBackup?.createdAt) {
          setLastBackup(formatShortTime(data.latestBackup.createdAt));
        } else {
          setLastBackup('尚未备份');
        }
      } catch {
        setStorageMessage('还没有连上家庭记录服务，当前先显示默认本地路径。');
      }
    }

    loadStorageStatus();
  }, []);

  async function runBackup() {
    if (!nasOnline) {
      setBackupState('failed');
      try {
        await fetch('/api/storage/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nasOnline: false })
        });
      } catch {
        // The visible state already tells the story for the mock prototype.
      }
      return;
    }

    setBackupState('running');
    try {
      const response = await fetch('/api/storage/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nasOnline: true })
      });
      if (!response.ok) throw new Error('backup failed');
      const data = await response.json();
      setStorageStatus(data);
      setLastBackup('刚刚');
      setBackupState('done');
      setStorageMessage('备份完成，已保存到 data/backups/。');
    } catch {
      setBackupState('failed');
      setStorageMessage('备份没有完成，请确认家庭记录服务可以写入数据目录。');
    }
  }

  async function exportJson() {
    try {
      const response = await fetch('/api/storage/export-json', { method: 'POST' });
      if (!response.ok) throw new Error('export failed');
      const data = await response.json();
      setStorageMessage('导出完成，JSON 文件已保存到 data/exports/。');
    } catch {
      setStorageMessage('JSON 没有导出成功，请确认服务端正在运行后再试。');
    }
  }

  return (
    <>
      <header className="relative min-h-[142px]">
        <div>
          <h1 className="text-[25px] font-bold leading-none text-[#093f3e]">设置</h1>
          <p className="mt-2 text-[15px] text-muted">数据在自己手里更安心 <span className="text-[#ff8a4d]">♥</span></p>
        </div>
        <div className="absolute right-0 top-0 h-24 w-32">
          <div className="absolute bottom-0 left-4 h-14 w-16 rounded-[50%] bg-[#e9dfcf]" />
          <div className="absolute bottom-9 left-12 h-16 w-1 rounded-full bg-[#9aaa76]" />
          <div className="absolute bottom-16 left-9 h-4 w-8 rotate-[-28deg] rounded-full bg-[#9aaa76]" />
          <div className="absolute bottom-20 left-14 h-4 w-8 rotate-[22deg] rounded-full bg-[#9aaa76]" />
          <div className="absolute right-0 top-8 h-16 w-14 rounded-sm border-[6px] border-[#d6a979] bg-[#f7f0e2]" />
        </div>
      </header>
      <SectionTitle>数据备份</SectionTitle>
      <section className="soft-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className={`circle-icon ${nasOnline ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-500'}`}><Cloud size={35} /></div>
            <div className="min-w-0">
              <p className="text-[20px] font-semibold">上次备份：{lastBackup}</p>
              <p className="mt-1 flex items-center gap-2 text-[16px] text-muted">
                {nasOnline ? '备份成功，数据安全' : '暂时连不上家庭 NAS'}
                {nasOnline ? <CheckCircle2 size={18} className="text-teal-600" /> : <AlertCircle size={18} className="text-amber-500" />}
              </p>
            </div>
          </div>
          <button
            className={`shrink-0 rounded-2xl px-4 py-3 text-[17px] font-semibold shadow-card ${nasOnline ? 'bg-teal-600 text-white' : 'bg-amber-50 text-amber-600'}`}
            type="button"
            onClick={runBackup}
          >
            {backupState === 'running' ? '备份中' : '立即备份'}
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-soft/80 px-4 py-3 text-[14px] text-muted">
          <span>备份状态测试</span>
          <div className="flex gap-2">
            <button className={`rounded-full border px-3 py-1.5 font-medium ${nasOnline ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-line bg-white text-muted'}`} type="button" onClick={() => setNasOnline(true)}>
              正常
            </button>
            <button className={`rounded-full border px-3 py-1.5 font-medium ${!nasOnline ? 'border-amber-400 bg-amber-50 text-amber-600' : 'border-line bg-white text-muted'}`} type="button" onClick={() => setNasOnline(false)}>
              离线
            </button>
          </div>
        </div>
        {backupState === 'done' && (
          <div className="mt-4 rounded-2xl bg-teal-50 px-4 py-4 text-center">
            <IllustrationImage src={illustrationAssets.backupSuccess} alt="备份成功" className="mx-auto h-28 w-full max-w-[200px]" />
            <p className="mt-2 text-[15px] font-medium text-teal-600">已完成一次备份。</p>
          </div>
        )}
        {backupState === 'failed' && (
          <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-4 text-center">
            <IllustrationImage src={illustrationAssets.backupUnavailable} alt="备份不可用" className="mx-auto h-28 w-full max-w-[200px]" />
            <p className="mt-2 text-[15px] font-medium text-amber-600">当前没有连上家庭 NAS，请恢复局域网连接后再试。</p>
          </div>
        )}
        {storageMessage && <p className="mt-4 break-all text-[14px] leading-relaxed text-muted">{storageMessage}</p>}
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-teal-50 px-4 py-3 text-[15px] text-teal-700">
          <ShieldCheck size={20} className="shrink-0" />
          <span>定期备份可以防止意外丢失，建议每天或每周备份一次。</span>
        </div>
      </section>
      <SectionTitle>导出</SectionTitle>
      <section className="soft-card divide-y divide-line">
        <SettingsRow title="导出 JSON" desc="导出所有记录为 JSON 文件" icon={FileText} action="导出" onClick={exportJson} />
      </section>
      <SectionTitle>附件目录</SectionTitle>
      <section className="soft-card">
        <SettingsRow title="附件目录" desc={formatStoragePath(storageStatus?.dataPaths?.attachmentsDir, 'data/attachments/')} icon={Folder} action=">" />
      </section>
      <SectionTitle>数据库位置</SectionTitle>
      <section className="soft-card divide-y divide-line">
        <SettingsRow title="数据库位置" desc={formatStoragePath(storageStatus?.dataPaths?.dbPath, 'data/database/app.db')} icon={Database} action=">" />
        <SettingsRow title="备份目录" desc={formatStoragePath(storageStatus?.dataPaths?.backupsDir, 'data/backups/')} icon={Database} action=">" />
        <SettingsRow title="导出目录" desc={formatStoragePath(storageStatus?.dataPaths?.exportsDir, 'data/exports/')} icon={Folder} action=">" />
        <SettingsRow title="导入 Note Station" desc="导入旧记录并保留来源信息" icon={FileText} action=">" onClick={onOpenImport} />
      </section>
      <SectionTitle>家庭成员</SectionTitle>
      <section className="soft-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[20px] font-semibold">当前记录人</p>
            <p className="mt-1 text-[15px] text-muted">新建记录会默认归到当前成员名下</p>
          </div>
          <UserRound className="text-teal-600" size={32} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {members.map((member) => (
            <button
              className={`rounded-2xl border px-4 py-3 text-left ${currentMemberId === member.id ? member.colorClass : 'border-line bg-white text-muted'}`}
              key={member.id}
              type="button"
              onClick={() => onSwitchMember(member.id)}
            >
              <span className="inline-flex items-center gap-2 text-[17px] font-medium">
                <AvatarMark src={member.avatarImage} label={member.name} className="h-7 w-7" />
                {member.name}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-[14px] leading-relaxed text-muted">当前默认成员固定为“我”和“爱人”；改名、头像和颜色编辑以后再做。</p>
        <button className="mt-4 flex h-12 w-full items-center justify-between rounded-2xl border border-line bg-white px-4 text-left text-[17px] font-medium text-teal-700" type="button" onClick={onOpenMembers}>
          成员管理
          <ChevronRight size={19} />
        </button>
      </section>
      <div className="mt-6 rounded-2xl border border-orange-200 bg-amber-50 px-4 py-3 text-[15px] leading-relaxed text-[#a35b00]">
        所有数据仅保存在家庭 NAS 或局域网服务器中，家事记不会上传任何内容。
      </div>
    </>
  );
}

function SearchPill({ placeholder, onClick }) {
  return (
    <button className="mt-6 flex h-[58px] w-full items-center gap-4 rounded-[20px] bg-[#f4f3ef] px-5 text-left text-[20px] text-[#8b8e94] shadow-card" type="button" onClick={onClick}>
      <Search size={28} className="text-[#777b82]" />
      <span className="min-w-0 flex-1 truncate">{placeholder}</span>
    </button>
  );
}

function QuickFilters({ active, onChange, showMore = false, onToggleMore }) {
  const filters = [
    { key: 'all', label: '全部', icon: Tags },
    { key: 'todo', label: '待办', icon: Clock3, iconClass: 'text-amber-500' },
    { key: 'important', label: '重要', textIcon: '☆' },
    { key: 'attachments', label: '有附件', icon: Paperclip, iconClass: 'text-teal-600' }
  ];

  return (
    <section className="scroll-row mt-5 flex gap-2.5 pb-1">
      {filters.map((item) => {
        const Icon = item.icon;
        return (
          <button className={`chip ${active === item.key ? 'chip-active' : ''}`} key={item.key} type="button" onClick={() => onChange(item.key)}>
            {Icon && <Icon size={19} className={active === item.key ? '' : item.iconClass} />}
            {item.textIcon && <span className={active === item.key ? '' : 'text-amber-500'}>{item.textIcon}</span>}
            {item.label}
          </button>
        );
      })}
      <button className={`chip ${showMore ? 'border-teal-600 bg-teal-50 text-teal-700' : ''}`} type="button" onClick={onToggleMore}>
        更多 <MoreHorizontal size={18} />
      </button>
    </section>
  );
}

function MemberFilters({ members, active, onChange }) {
  const options = [{ key: 'all', label: '全部成员', avatar: '全', avatarImage: null, colorClass: 'border-line bg-white text-muted' }, ...members.map((member) => ({ key: member.name, label: member.name, avatar: member.avatar, avatarImage: member.avatarImage, colorClass: member.colorClass }))];

  return (
    <section className="scroll-row mt-3 flex gap-2 pb-1">
      {options.map((member) => (
        <button
          key={member.key}
          type="button"
          onClick={() => onChange(member.key)}
          className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-[14px] ${
            active === member.key ? member.colorClass : 'border-line bg-white text-muted'
          }`}
        >
          <AvatarMark src={member.avatarImage} label={member.label} className="h-6 w-6" />
          {member.label}
        </button>
      ))}
    </section>
  );
}

function CategoryFilters({ active, onChange }) {
  const options = [{ id: 'all', name: '全部分类' }, ...categories.slice(0, 5)];

  return (
    <section className="scroll-row mt-3 flex gap-2 pb-1">
      {options.map((category) => (
        <button
          className={`chip ${active === category.id ? 'border-teal-600 bg-teal-50 text-teal-700' : ''}`}
          key={category.id}
          type="button"
          onClick={() => onChange(category.id)}
        >
          {category.name}
        </button>
      ))}
    </section>
  );
}

function TodayCard() {
  return (
    <section className="soft-card mt-4 flex items-center justify-between bg-teal-50/60 p-4">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <CalendarDays className="text-teal-600" size={30} />
        <div className="min-w-0">
          <h2 className="text-[21px] font-bold text-teal-600">今天要记</h2>
          <p className="mt-1 truncate text-[15px] text-muted">随手记一条，闪念不丢失</p>
        </div>
      </div>
      <div className="h-12 w-px shrink-0 bg-line" />
      <div className="flex shrink-0 items-center gap-2 text-[16px] font-semibold text-teal-600"><FileText size={22} /> 快速记录</div>
    </section>
  );
}

function RecordCard({ note, onClick }) {
  const Icon = note.icon;
  const CategoryIcon = note.categoryIcon;
  return (
    <article className="soft-card p-4" onClick={onClick}>
      <div className="flex gap-4">
        <div className={`circle-icon bg-white ${note.iconTone}`}><CategoryMark src={note.categoryImageSrc || categoryImageAssets[note.categoryId]} fallback={Icon} label={note.category} className="h-11 w-11" iconSize={32} /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 text-[16px] font-bold leading-snug" style={{ overflowWrap: 'anywhere' }}>{note.title}</h3>
            <MoreHorizontal size={22} className="shrink-0 text-ink" />
          </div>
          <p className="record-summary mt-2 text-[16px] leading-relaxed text-muted">{note.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {note.tags.map((tag) => <span className={`tag ${tag.tone}`} key={tag.label}>{tag.label}</span>)}
          </div>
          <div className="mt-3 border-t border-line pt-3 text-[14px] text-muted">
            <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
              <span className="inline-flex items-center gap-1.5"><Clock3 size={17} /> {note.time}</span>
              <span className={`inline-flex min-w-0 items-center gap-1.5 font-medium ${note.categoryColor}`}><CategoryMark src={note.categoryImageSrc || categoryImageAssets[note.categoryId]} fallback={CategoryIcon} label={note.category} className="h-[18px] w-[18px]" iconSize={18} /> <span className="truncate">{note.category}</span></span>
              <span className="inline-flex items-center gap-1.5"><Paperclip size={17} /> {note.attachmentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function TopBar({ title, onBack, action, onAction }) {
  return (
    <header className="grid grid-cols-[44px_minmax(0,1fr)_64px] items-center">
      <button className="text-ink" onClick={onBack} type="button" aria-label="返回"><ArrowLeft size={34} /></button>
      <h1 className="truncate text-center text-[22px] font-semibold">{title}</h1>
      <button className="text-right text-[17px] font-medium text-teal-600" type="button" onClick={onAction}>{action}</button>
    </header>
  );
}

function FilterRow({ title, options, active, onChange, labels = {} }) {
  return (
    <div className="grid grid-cols-[76px_1fr] gap-3 py-3 first:pt-0 last:pb-0">
      <span className="pt-2 text-[16px] font-medium">{title}</span>
      <div className="scroll-row flex gap-2">
        {options.map((option) => (
          <button
            className={`chip ${option === active ? 'border-teal-600 bg-teal-50 text-teal-700' : ''}`}
            key={option}
            type="button"
            onClick={() => onChange(option)}
          >
            {labels[option] ?? option}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ title, desc, image }) {
  return (
    <section className="mt-5 rounded-[22px] border border-dashed border-line bg-white/70 p-5 text-center">
      {image ? <IllustrationImage src={image} alt={title} /> : <Search className="mx-auto text-muted" size={42} />}
      <p className="mt-3 text-[17px] font-medium">{title}</p>
      <p className="mt-1 text-[15px] leading-relaxed text-muted">{desc}</p>
    </section>
  );
}

function MetaRow({ icon: Icon, label, value, emphasize = false }) {
  return (
    <div className="flex items-center gap-4">
      <Icon size={22} className="text-muted" />
      <span>{label}：</span>
      <span className={emphasize ? 'font-medium text-teal-600' : ''}>{value}</span>
    </div>
  );
}

function RelatedRow({ title, meta }) {
  return (
    <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
      <div>
        <p className="text-[16px] font-medium">{title}</p>
        <p className="mt-1 text-[14px] text-muted">{meta}</p>
      </div>
      <ChevronRight className="text-muted" />
    </div>
  );
}

function SectionHeader({ title, trailing }) {
  return (
    <section className="mt-8 flex items-center justify-between">
      <h2 className="text-[18px] font-medium">{title}</h2>
      <span className="inline-flex items-center gap-1 text-[15px] text-muted">{trailing}</span>
    </section>
  );
}

function SectionTitle({ children }) {
  return <h2 className="mb-3 mt-6 text-[21px] font-semibold">{children}</h2>;
}

function SettingsRow({ title, desc, icon: Icon, action, disabled = false, onClick }) {
  return (
    <button
      className={`flex w-full items-center justify-between gap-4 p-5 text-left ${disabled ? 'opacity-55' : ''}`}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center gap-4">
        <div className="circle-icon bg-teal-50 text-teal-700"><Icon size={31} /></div>
        <div className="min-w-0">
          <p className="text-[18px] font-semibold">{title}</p>
          <p className="mt-1 break-all text-[15px] leading-relaxed text-muted">{desc}</p>
        </div>
      </div>
      {action === '>' ? <ChevronRight className="shrink-0 text-muted" size={20} /> : <span className="shrink-0 text-[15px] text-muted">{action}</span>}
    </button>
  );
}

function BottomNav({ active, onChange }) {
  const items = [
    { key: 'home', label: '首页', icon: Home },
    { key: 'categories', label: '分类', icon: Grid2X2 },
    { key: 'search', label: '搜索', icon: Search },
    { key: 'settings', label: '设置', icon: Settings }
  ];
  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;
        return (
          <button className={`nav-item ${isActive ? 'nav-active' : ''}`} key={item.key} onClick={() => onChange(item.key)} type="button">
            <Icon size={28} strokeWidth={isActive ? 2.7 : 2.2} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

createRoot(document.getElementById('root')).render(<App />);
