import './webviewCompat.js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import {
  AlertCircle,
  Undo2,
  Underline,
  Table2,
  Strikethrough,
  Redo2,
  Palette,
  Highlighter,
  Code2,
  AlignRight,
  AlignLeft,
  AlignCenter,
  Archive,
  Bold,
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
  Heading2,
  Heading3,
  Home,
  Inbox,
  Italic,
  KeyRound,
  Lightbulb,
  Link,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  MoreHorizontal,
  Paperclip,
  PawPrint,
  Plus,
  Quote,
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
import {
  deleteLocalNote,
  markMutationFailed,
  markMutationSynced,
  queueLocalMutation,
  readLocalSnapshot,
  readPendingMutations,
  saveLocalSnapshot,
  upsertLocalNote
} from './offlineStore.js';
import './styles.css';

function getAndroidServerUrl() {
  try {
    const value = window.HomeNoteAndroid?.getServerUrl?.();
    return typeof value === 'string' ? value.trim() : '';
  } catch {
    return '';
  }
}

function canUseRemoteApi() {
  return window.location.protocol !== 'file:' || Boolean(getAndroidServerUrl());
}

function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : '/' + path;
  const androidServerUrl = window.location.protocol === 'file:' ? getAndroidServerUrl() : '';
  if (window.location.protocol === 'file:' && !androidServerUrl) return null;
  if (!androidServerUrl) return normalizedPath;
  return androidServerUrl.replace(/\/+$/, '') + normalizedPath;
}

function fetchApi(path, options) {
  if (!canUseRemoteApi()) throw new Error('remote api unavailable in offline Android mode');
  const url = apiUrl(path);
  if (!url) throw new Error('remote api unavailable in offline Android mode');
  return fetch(url, options);
}

if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(apiUrl('/sw.js')).catch(() => {});
  });
}

const tagTones = {
  todo: 'bg-amber-50 text-amber-500 border border-orange-100',
  important: 'bg-rose-50 text-rose-500 border border-red-100',
  repair: 'bg-teal-50 text-teal-600 border border-teal-100',
  shopping: 'bg-green-50 text-green-600 border border-green-100',
  bill: 'bg-blue-50 text-blue-600 border border-blue-100',
  done: 'bg-green-50 text-green-700 border border-green-100'
};

const categoryIconMap = {
  family: Home,
  house: Home,
  repair: Wrench,
  shopping: ShoppingBag,
  account: KeyRound,
  kids: Star,
  health: HeartPulse,
  pet: PawPrint,
  work: Briefcase,
  temporary: FileText,
  uncategorized: Inbox,
  home: Home,
  wrench: Wrench,
  cart: ShoppingBag,
  key: KeyRound,
  star: Star,
  lightbulb: Lightbulb,
  folder: Folder,
  file: FileText,
  car: Briefcase
};

const categoryToneMap = {
  family: 'bg-teal-50 text-teal-700',
  house: 'bg-blue-50 text-blue-700',
  repair: 'bg-amber-50 text-amber-500',
  shopping: 'bg-green-50 text-green-700',
  account: 'bg-purple-50 text-purple-700',
  kids: 'bg-amber-50 text-amber-600',
  health: 'bg-rose-50 text-rose-500',
  pet: 'bg-green-50 text-green-700',
  work: 'bg-blue-50 text-blue-700',
  temporary: 'bg-purple-50 text-purple-600',
  uncategorized: 'bg-neutral-100 text-neutral-600'
};

const categoryColorOptions = ['#3DAA6C', '#2F7DB8', '#D88722', '#8C67C8', '#D9685B', '#557C93'];
const categoryIconOptions = [
  ['folder', '文件夹', Folder],
  ['home', '家庭', Home],
  ['wrench', '维修', Wrench],
  ['shopping', '购物', ShoppingBag],
  ['key', '账号', KeyRound],
  ['star', '重要', Star],
  ['lightbulb', '想法', Lightbulb],
  ['file', '记录', FileText]
];

const fallbackCategories = [
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

function normalizeCategories(categoryList = []) {
  const source = Array.isArray(categoryList) && categoryList.length ? categoryList : fallbackCategories;
  return source.map((category, index) => normalizeCategory(category, index));
}

function normalizeCategory(category, index = 0) {
  const fallback = fallbackCategories.find((item) => item.id === category.id);
  const iconKey = category.icon || fallback?.id || fallback?.iconKey || 'folder';
  const Icon = typeof iconKey === 'string' ? categoryIconMap[iconKey] || categoryIconMap[category.id] || fallback?.icon || Folder : iconKey;
  const tone = fallback?.tone || categoryToneMap[category.id] || 'bg-teal-50 text-teal-700';
  return {
    id: category.id,
    name: displayCategoryName(category.name || fallback?.name || '未分类 / 待整理', category.id),
    slug: category.slug || category.id,
    color: category.color || fallback?.color || categoryColorOptions[index % categoryColorOptions.length],
    iconKey: typeof iconKey === 'string' ? iconKey : category.id,
    icon: Icon,
    imageSrc: category.imageSrc || fallback?.imageSrc || categoryImageAssets[category.id] || null,
    tone,
    count: Number(category.noteCount ?? category.count ?? fallback?.count ?? 0),
    noteCount: Number(category.noteCount ?? category.count ?? fallback?.count ?? 0),
    update: category.update || (Number(category.noteCount ?? category.count ?? 0) > 0 ? '最近有更新' : fallback?.update || '暂无记录'),
    isSystem: Boolean(category.isSystem ?? fallback?.isSystem ?? false)
  };
}

function applyCategoryDisplay(note, categoryList = fallbackCategories) {
  const category = categoryList.find((item) => item.id === note.categoryId) ?? categoryList.find((item) => item.id === 'uncategorized') ?? categoryList[0] ?? fallbackCategories[0];
  return {
    ...note,
    category: displayCategoryName(category.name, category.id),
    categoryId: category.id,
    categoryIcon: category.icon,
    categoryImageSrc: category.imageSrc,
    categoryColor: 'text-teal-600',
    icon: category.icon,
    iconTone: category.tone
  };
}


const memberColorClasses = {
  teal: 'bg-teal-50 text-teal-700 border-teal-100',
  rose: 'bg-rose-50 text-rose-600 border-rose-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  green: 'bg-green-50 text-green-700 border-green-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100',
  neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200'
};

const memberColorOptions = [
  ['teal', '松石'],
  ['rose', '暖粉'],
  ['amber', '暖黄'],
  ['blue', '浅蓝'],
  ['green', '青绿'],
  ['purple', '淡紫'],
  ['neutral', '灰白']
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
  { id: 'self', name: '我', avatar: '我', color: 'teal', avatarImage: memberAvatarAssets.self, colorClass: memberColorClasses.teal, isCurrent: true },
  { id: 'partner', name: '爱人', avatar: '爱', color: 'rose', avatarImage: memberAvatarAssets.partner, colorClass: memberColorClasses.rose }
];

const initialNotes = [];
const OFFLINE_APP_DATA_CACHE_KEY = 'home-notes-offline-app-data-cache-v1';
const OFFLINE_APP_DATA_CACHE_LIMIT = 100;

function readOfflineAppDataCache() {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(OFFLINE_APP_DATA_CACHE_KEY) || 'null');
    if (!parsed || !Array.isArray(parsed.notes)) return null;
    return {
      notes: parsed.notes,
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      members: Array.isArray(parsed.members) ? parsed.members : [],
      currentMemberId: typeof parsed.currentMemberId === 'string' ? parsed.currentMemberId : 'self',
      savedAt: parsed.savedAt || null
    };
  } catch {
    return null;
  }
}

function writeOfflineAppDataCache(snapshot) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(OFFLINE_APP_DATA_CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    // Cached app data is only a fallback; quota failures must not block daily notes.
  }
}

function isPendingLocalNote(note) {
  return Boolean(note?.isOffline) || ['local-only', 'dirty', 'pending', 'failed'].includes(note?.syncStatus);
}

function pickPendingLocalNotes(snapshot, categoryList) {
  if (!snapshot?.notes?.length) return [];
  return snapshot.notes.filter(isPendingLocalNote).map((note) => normalizeNote(note, categoryList));
}


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
  const [offlineCreateQueue, setOfflineCreateQueue] = useState([]);
  const offlineSyncingRef = useRef(false);
  const [offlineSyncing, setOfflineSyncing] = useState(false);
  const [categoriesData, setCategoriesData] = useState(fallbackCategories);
  const [members, setMembers] = useState(fallbackMembers);
  const [currentMemberId, setCurrentMemberId] = useState('self');
  const [dataMode, setDataMode] = useState('mock');
  const [screen, setScreen] = useState('home');
  const [selectedId, setSelectedId] = useState('leak');
  const [homeFilter, setHomeFilter] = useState('all');
  const [homeMember, setHomeMember] = useState('all');
  const [homeCategory, setHomeCategory] = useState('all');
  const [toast, setToast] = useState('');
  const [accessLocked, setAccessLocked] = useState(false);
  const [accessMessage, setAccessMessage] = useState('');
  const [accessNonce, setAccessNonce] = useState(0);
  const selectedNote = useMemo(() => notesData.find((note) => note.id === selectedId) ?? notesData[0], [notesData, selectedId]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const accessResponse = await fetchApi('/api/access/status');
        if (accessResponse.ok) {
          const access = await accessResponse.json();
          if (access.accessRequired && !access.unlocked) {
            setAccessLocked(true);
            setAccessMessage('');
            setDataMode('locked');
            return;
          }
        }

        const response = await fetchApi('/api/app-data');
        if (!response.ok) {
          throw new Error('app data unavailable');
        }

        const data = await response.json();
        if (!isMounted) return;

        const loadedMembers = data.members?.length ? data.members.map((member, index) => normalizeMember(member, index)) : fallbackMembers;
        const nextMembers = keepDefaultMembers(loadedMembers);
        const nextCategories = normalizeCategories(data.categories);
        const nextNotes = Array.isArray(data.notes) ? data.notes.map((note) => normalizeNote(note, nextCategories)) : initialNotes;
        const localSnapshot = await readLocalSnapshot();
        const pendingNotes = pickPendingLocalNotes(localSnapshot, nextCategories);
        const pendingMutations = await readPendingMutations();
        const currentMember = nextMembers.find((member) => member.isCurrent) ?? nextMembers[0] ?? fallbackMembers[0];

        await saveLocalSnapshot({
          members: nextMembers,
          categories: nextCategories,
          tags: data.tags || [],
          currentMemberId: currentMember.id,
          notes: nextNotes,
          savedAt: new Date().toISOString()
        });

        setMembers(nextMembers);
        setCategoriesData(nextCategories);
        setCurrentMemberId(currentMember.id);
        setNotesData([...pendingNotes, ...nextNotes]);
        setSelectedId((pendingNotes[0] || nextNotes[0])?.id ?? null);
        setOfflineCreateQueue(pendingMutations);
        setAccessLocked(false);
        setDataMode('sqlite');
      } catch {
        if (!isMounted) return;
        const localSnapshot = await readLocalSnapshot();
        if (localSnapshot) {
          const localCategories = normalizeCategories(localSnapshot.categories);
          const localMembers = keepDefaultMembers(localSnapshot.members.length ? localSnapshot.members.map((member, index) => normalizeMember(member, index)) : fallbackMembers);
          const localNotes = localSnapshot.notes.map((note) => normalizeNote(note, localCategories));
          const currentMember = localMembers.find((member) => member.id === localSnapshot.currentMemberId)
            ?? localMembers.find((member) => member.isCurrent)
            ?? localMembers[0]
            ?? fallbackMembers[0];
          const nextNotes = localNotes;
          setMembers(localMembers.map((member) => ({ ...member, isCurrent: member.id === currentMember.id })));
          setCategoriesData(localCategories);
          setCurrentMemberId(currentMember.id);
          setNotesData(nextNotes);
          setSelectedId(nextNotes[0]?.id ?? null);
          setOfflineCreateQueue(await readPendingMutations());
          setDataMode('offline-first');
          return;
        }

        const cached = readOfflineAppDataCache();
        if (cached) {
          const cachedCategories = normalizeCategories(cached.categories);
          const cachedMembers = keepDefaultMembers(cached.members.length ? cached.members.map((member, index) => normalizeMember(member, index)) : fallbackMembers);
          const cachedNotes = cached.notes.map((note) => normalizeNote(note, cachedCategories));
          const currentMember = cachedMembers.find((member) => member.id === cached.currentMemberId)
            ?? cachedMembers.find((member) => member.isCurrent)
            ?? cachedMembers[0]
            ?? fallbackMembers[0];
          const nextNotes = cachedNotes;
          setMembers(cachedMembers.map((member) => ({ ...member, isCurrent: member.id === currentMember.id })));
          setCategoriesData(cachedCategories);
          setCurrentMemberId(currentMember.id);
          setNotesData(nextNotes);
          setSelectedId(nextNotes[0]?.id ?? null);
          setOfflineCreateQueue(await readPendingMutations());
          setDataMode('offline-cache');
          return;
        }

        setMembers(fallbackMembers);
        setCategoriesData(fallbackCategories);
        setCurrentMemberId('self');
        setNotesData([]);
        setSelectedId(null);
        setOfflineCreateQueue(await readPendingMutations());
        setDataMode('offline-first');
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [accessNonce]);

  async function openDetail(id) {
    setSelectedId(id);
    setScreen('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (dataMode !== 'sqlite') return;
    try {
      const response = await fetchApi(`/api/notes?id=${encodeURIComponent(id)}`);
      if (!response.ok) return;
      const data = await response.json();
      const detailNote = data.notes?.[0];
      if (!detailNote) return;
      const normalized = normalizeNote(detailNote, categoriesData);
      setNotesData((current) => current.some((note) => note.id === id)
        ? current.map((note) => (note.id === id ? normalized : note))
        : [normalized, ...current]);
    } catch {
      // Keep the list item as a usable fallback when detail refresh fails.
    }
  }

  function openEdit() {
    setScreen('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function unlockAccess(pin) {
    try {
      const response = await fetchApi('/api/access/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });

      if (!response.ok) {
        setAccessMessage('口令不正确，请再试一次');
        return;
      }

      setAccessLocked(false);
      setAccessMessage('');
      setAccessNonce((value) => value + 1);
    } catch {
      setAccessMessage('暂时没有连上家庭记录服务');
    }
  }

  function navigate(nextScreen) {
    setScreen(nextScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  }

  function retryRemoteConnection() {
    showToast('正在尝试连接家庭记录服务');
    setAccessNonce((value) => value + 1);
  }

  function buildLocalNoteFromDraftPayload(payload, { category, currentMember, title, body, bodyHtml }, syncStatus, localId, existingNote = {}) {
    return {
      ...existingNote,
      id: localId,
      title,
      summary: body.slice(0, 42),
      content: body,
      contentHtml: bodyHtml || null,
      contentJson: payload.contentJson || null,
      richContent: bodyHtml ? { format: 'html', html: bodyHtml, source: 'content_html' } : existingNote.richContent || null,
      category: category.name,
      categoryId: category.id,
      categoryIcon: category.icon,
      categoryImageSrc: category.imageSrc,
      categoryColor: 'text-teal-600',
      icon: category.icon,
      iconTone: category.tone,
      tags: payload.tags.map((label) => ({ label, tone: tagTones[findTagTone(label)] ?? tagTones.done })),
      time: existingNote.time || '刚刚',
      member: currentMember.name,
      memberId: currentMember.id,
      memberAvatar: currentMember.avatar,
      memberAvatarImage: currentMember.avatarImage,
      attachmentCount: payload.attachments?.length || existingNote.attachmentCount || 0,
      status: syncStatus === 'synced' ? '已保存到 NAS' : '待同步到 NAS',
      source: existingNote.source || '手动创建',
      sourceType: existingNote.sourceType || 'manual',
      isOffline: syncStatus !== 'synced',
      syncStatus,
      createdAt: existingNote.createdAt || '今天 刚刚',
      updatedAt: '刚刚',
      attachments: payload.attachments?.length ? payload.attachments : existingNote.attachments || []
    };
  }

  async function saveLocalFirstDraft(action, payload, context, existingNote = {}) {
    const localId = action === 'create'
      ? 'local-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
      : existingNote.id;
    const syncStatus = action === 'create' ? 'local-only' : 'dirty';
    const localNote = buildLocalNoteFromDraftPayload(payload, context, syncStatus, localId, existingNote);

    await upsertLocalNote(localNote);
    await queueLocalMutation({
      action,
      localId,
      noteId: localId,
      serverId: action === 'update' && !String(localId).startsWith('local-') ? localId : null,
      payload
    });
    await refreshPendingMutationState();

    setNotesData((current) => (
      current.some((item) => item.id === localId)
        ? current.map((item) => (item.id === localId ? localNote : item))
        : [localNote, ...current]
    ));
    setSelectedId(localId);
    setScreen('detail');
    showToast(dataMode === 'sqlite' ? '记录已先保存到本机，正在同步 NAS' : '记录已保存在本机，恢复连接后会同步');

    if (dataMode === 'sqlite') window.setTimeout(() => syncPendingLocalMutations(), 0);
    return localNote;
  }

  async function refreshPendingMutationState() {
    setOfflineCreateQueue(await readPendingMutations());
  }

  async function syncPendingLocalMutations() {
    if (offlineSyncingRef.current || dataMode !== 'sqlite') return;
    const mutations = await readPendingMutations();
    if (!mutations.length) return;

    offlineSyncingRef.current = true;
    setOfflineSyncing(true);
    let syncedCount = 0;

    try {
      for (const mutation of mutations) {
        try {
          const isUpdate = mutation.action === 'update';
          const endpoint = isUpdate ? '/api/notes/' + encodeURIComponent(mutation.serverId || mutation.noteId) : '/api/notes';
          const response = await fetchApi(endpoint, {
            method: isUpdate ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mutation.payload)
          });
          if (!response.ok) throw new Error('local first sync failed');

          const data = await response.json();
          const syncedNote = normalizeNote(data.note, categoriesData);
          await upsertLocalNote({ ...syncedNote, syncStatus: 'synced', isOffline: false });
          if (mutation.localId && mutation.localId !== syncedNote.id) await deleteLocalNote(mutation.localId);
          await markMutationSynced(mutation.id);
          setNotesData((current) => {
            const withoutLocal = current.filter((note) => note.id !== mutation.localId && note.id !== syncedNote.id);
            return [syncedNote, ...withoutLocal];
          });
          setSelectedId((current) => (current === mutation.localId || current === mutation.noteId ? syncedNote.id : current));
          syncedCount += 1;
        } catch (error) {
          await markMutationFailed(mutation, error?.message || 'sync failed');
          break;
        }
      }
      await refreshPendingMutationState();
      if (syncedCount) showToast('已同步 ' + syncedCount + ' 条本机记录');
    } finally {
      offlineSyncingRef.current = false;
      setOfflineSyncing(false);
    }
  }

  useEffect(() => {
    if (dataMode === 'sqlite') {
      syncPendingLocalMutations();
    }
  }, [dataMode, offlineCreateQueue.length]);

  useEffect(() => {
    function handleOnline() {
      if (offlineCreateQueue.length > 0) retryRemoteConnection();
    }

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [offlineCreateQueue.length]);

  useEffect(() => {
    if (dataMode === 'locked') return;
    const savedAt = new Date().toISOString();
    saveLocalSnapshot({
      members,
      categories: categoriesData,
      currentMemberId,
      notes: notesData.slice(0, OFFLINE_APP_DATA_CACHE_LIMIT),
      savedAt
    });

    if (dataMode !== 'sqlite') return;
    writeOfflineAppDataCache({
      members,
      categories: categoriesData,
      currentMemberId,
      notes: notesData.filter((note) => !note.isOffline).slice(0, OFFLINE_APP_DATA_CACHE_LIMIT),
      savedAt
    });
  }, [dataMode, notesData, categoriesData, members, currentMemberId]);

  function openSearch() {
    navigate('search');
  }

  function applyCategory(categoryId) {
    setHomeCategory(categoryId);
    setHomeFilter('all');
    navigate('home');
  }

  async function bulkCategorizeImported(categoryId) {
    const noteIds = notesData
      .filter((note) => note.sourceType === 'notestation_import' && note.categoryId === 'uncategorized')
      .map((note) => note.id);
    const category = categoriesData.find((item) => item.id === categoryId);

    if (!noteIds.length || !category) {
      showToast('暂时没有导入记录需要整理');
      return;
    }

    if (dataMode === 'sqlite') {
      try {
        const response = await fetchApi('/api/notes/bulk-categorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noteIds, categoryId })
        });
        if (!response.ok) throw new Error('bulk categorize failed');
        const data = await response.json();
        const updated = new Map((data.notes || []).map((note) => [note.id, normalizeNote(note, categoriesData)]));
        setNotesData((current) => current.map((note) => updated.get(note.id) || note));
        showToast(data.updatedCount ? `已整理 ${data.updatedCount} 条导入记录` : '没有符合条件的导入记录');
        return;
      } catch {
        showToast('暂时没有连上家庭记录服务，整理未保存');
        return;
      }
    }

    setNotesData((current) => current.map((note) => (
      noteIds.includes(note.id)
        ? {
            ...note,
            category: category.name,
            categoryId: category.id,
            categoryIcon: category.icon,
            categoryImageSrc: category.imageSrc,
            icon: category.icon,
            iconTone: category.tone,
            updatedAt: '刚刚'
          }
        : note
    )));
    showToast(`已整理 ${noteIds.length} 条导入记录`);
  }

  async function createMockNote(draft) {
    const category = draft.categoryId ? categoriesData.find((item) => item.id === draft.categoryId) ?? findCategoryForType(draft.type, categoriesData) : findCategoryForType(draft.type, categoriesData);
    const body = draft.body.trim() || '刚刚新建的一条家庭记录，稍后可以继续补充细节。';
    const bodyHtml = draft.bodyHtml || '';
    const title = draft.title.trim() || body.slice(0, 24);
    const selectedMemberId = draft.memberId || currentMemberId;
    const currentMember = members.find((member) => member.id === selectedMemberId) ?? members[0] ?? fallbackMembers[0];
    const payload = {
      title,
      content: body,
      contentHtml: bodyHtml || undefined,
      contentJson: draft.bodyJson || undefined,
      categoryId: category.id,
      memberId: currentMember.id,
      noteType: draft.type,
      tags: draft.tags,
      attachments: draft.attachments?.length ? draft.attachments : []
    };

    await saveLocalFirstDraft('create', payload, { category, currentMember, title, body, bodyHtml });
  }

  async function updateExistingNote(draft) {
    const category = draft.categoryId ? categoriesData.find((item) => item.id === draft.categoryId) ?? findCategoryForType(draft.type, categoriesData) : findCategoryForType(draft.type, categoriesData);
    const body = draft.body.trim() || draft.title.trim() || '未命名记录';
    const bodyHtml = draft.bodyHtml || '';
    const title = draft.title.trim() || body.slice(0, 24);
    const selectedMemberId = draft.memberId || currentMemberId;
    const currentMember = members.find((member) => member.id === selectedMemberId) ?? members[0] ?? fallbackMembers[0];

    const payload = {
      title,
      content: body,
      contentHtml: bodyHtml || undefined,
      contentJson: draft.bodyJson || undefined,
      categoryId: category.id,
      memberId: currentMember.id,
      noteType: draft.type,
      tags: draft.tags,
      attachments: draft.attachments?.length ? draft.attachments : []
    };
    const existingNote = notesData.find((item) => item.id === draft.id) || selectedNote || {};

    await saveLocalFirstDraft('update', payload, { category, currentMember, title, body, bodyHtml }, existingNote);
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
        const response = await fetchApi('/api/notes/' + noteId + '/archive', { method: 'POST' });
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
        const response = await fetchApi('/api/notes/' + noteId, { method: 'DELETE' });
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

  async function updateMemberProfile(memberId, profile) {
    const nextName = profile.name.trim() || '家人';
    const nextAvatar = profile.avatar.trim().slice(0, 2) || nextName.slice(0, 1);
    const nextColor = profile.color || 'teal';

    if (dataMode === 'sqlite') {
      try {
        const response = await fetchApi('/api/members/' + memberId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: nextName, avatar: nextAvatar, color: nextColor })
        });
        if (!response.ok) throw new Error('member update failed');
        const data = await response.json();
        setMembers(keepDefaultMembers((data.members || []).map((member, index) => normalizeMember(member, index))));
        setNotesData((current) => current.map((note) => (note.memberId === memberId ? { ...note, member: nextName, memberAvatar: nextAvatar } : note)));
        showToast('成员资料已更新');
        return;
      } catch {
        showToast('暂时没有连上家庭记录服务，成员资料未保存');
        return;
      }
    }

    setMembers((current) => current.map((member) => (
      member.id === memberId
        ? { ...member, name: nextName, avatar: nextAvatar, color: nextColor, colorClass: memberColorClasses[nextColor] || member.colorClass }
        : member
    )));
    setNotesData((current) => current.map((note) => (note.memberId === memberId ? { ...note, member: nextName, memberAvatar: nextAvatar } : note)));
    showToast('成员资料已在当前页面更新');
  }

  async function switchCurrentMember(memberId) {
    const nextMember = members.find((member) => member.id === memberId);
    if (!nextMember) return;

    setCurrentMemberId(memberId);
    setMembers((current) => current.map((member) => ({ ...member, isCurrent: member.id === memberId })));

    if (dataMode === 'sqlite') {
      try {
        await fetchApi('/api/members/current', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId })
        });
      } catch {
        showToast('成员切换已在当前页面生效');
      }
    }
  }

  function applyCategoryList(categoryList) {
    const nextCategories = normalizeCategories(categoryList);
    setCategoriesData(nextCategories);
    setNotesData((current) => current.map((note) => applyCategoryDisplay(note, nextCategories)));
  }

  async function createCategory(draft) {
    const payload = { name: draft.name, color: draft.color, icon: draft.icon };

    if (dataMode === 'sqlite') {
      try {
        const response = await fetchApi('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'category create failed');
        applyCategoryList(data.categories || []);
        showToast('分类已添加');
        return true;
      } catch {
        showToast('暂时没有连上家庭记录服务，分类未保存');
        return false;
      }
    }

    const localCategory = normalizeCategory({
      id: 'local_category_' + Date.now().toString(36),
      name: payload.name,
      color: payload.color,
      icon: payload.icon,
      isSystem: false
    }, categoriesData.length);
    applyCategoryList([...categoriesData, localCategory]);
    showToast('分类已在当前页面添加');
    return true;
  }

  async function updateCategory(categoryId, draft) {
    const payload = { name: draft.name, color: draft.color, icon: draft.icon };

    if (dataMode === 'sqlite') {
      try {
        const response = await fetchApi('/api/categories/' + categoryId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'category update failed');
        applyCategoryList(data.categories || []);
        showToast('分类已更新');
        return true;
      } catch {
        showToast('暂时没有连上家庭记录服务，分类未保存');
        return false;
      }
    }

    applyCategoryList(categoriesData.map((category) => (category.id === categoryId ? { ...category, ...payload } : category)));
    showToast('分类已在当前页面更新');
    return true;
  }

  if (accessLocked) {
    return <AccessLockScreen message={accessMessage} onUnlock={unlockAccess} />;
  }

  return (
    <main className="mobile-shell">
      {screen === 'home' && (
        <HomeScreen
          notes={notesData}
          categories={categoriesData}
          offlineQueueCount={offlineCreateQueue.length}
          offlineSyncing={offlineSyncing}
          filter={homeFilter}
          member={homeMember}
          category={homeCategory}
          onFilterChange={setHomeFilter}
          onMemberChange={setHomeMember}
          onCategoryChange={setHomeCategory}
          onOpenDetail={openDetail}
          onOpenSearch={openSearch}
          onCreateNote={() => navigate('new')}
          onSyncNow={retryRemoteConnection}
          members={members}
        />
      )}
      {screen === 'new' && (
        <NewRecordScreen
          members={members}
          categories={categoriesData}
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
          categories={categoriesData}
          currentMemberId={currentMemberId}
          onBack={() => navigate('detail')}
          onSave={updateExistingNote}
        />
      )}
      {screen === 'detail' && selectedNote && <DetailScreen note={selectedNote} onBack={() => navigate('home')} onEdit={openEdit} onArchive={archiveNote} onDelete={deleteNote} />}
      {screen === 'search' && <SearchScreen notes={notesData} categories={categoriesData} members={members} onOpenDetail={openDetail} />}
      {screen === 'categories' && <CategoriesScreen notes={notesData} categories={categoriesData} onSelectCategory={applyCategory} onCreateCategory={createCategory} onUpdateCategory={updateCategory} onBulkCategorizeImported={bulkCategorizeImported} />}
      {screen === 'import' && (
        <ImportScreen
          currentMemberId={currentMemberId}
          onBack={() => navigate('settings')}
          onImported={(importedNotes) => {
            const normalized = importedNotes.map((note) => normalizeNote(note, categoriesData));
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
          onUpdateMember={updateMemberProfile}
        />
      )}

      {(screen === 'home' || screen === 'categories') && (
        <button
          className={`fixed bottom-[72px] right-[max(20px,calc((100vw-390px)/2+20px))] z-40 grid place-items-center rounded-full bg-teal-600 text-white shadow-float ${screen === 'categories' ? 'h-[66px] w-[66px] content-center gap-0.5' : 'h-14 w-14'}`}
          type="button"
          aria-label="新建记录"
          onClick={() => navigate('new')}
        >
          <Plus size={screen === 'categories' ? 28 : 26} strokeWidth={2.6} />
          {screen === 'categories' && <span className="text-[10px] font-medium leading-none">记一件事</span>}
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
    color: member.color || (member.id === 'partner' ? 'rose' : 'teal'),
    colorClass: member.colorClass || memberColorClasses[member.color] || memberToneClasses[index % memberToneClasses.length],
    isCurrent: Boolean(member.isCurrent)
  };
}

function normalizeNote(note, categoryList = fallbackCategories) {
  const category = categoryList.find((item) => item.id === note.categoryId) ?? categoryList.find((item) => item.id === 'uncategorized') ?? categoryList[0] ?? fallbackCategories[0];
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
    contentText: note.contentText || note.content || '',
    contentHtml: note.contentHtml || null,
    contentJson: note.contentJson || null,
    sourceHtml: note.sourceHtml || null,
    richContent: note.richContent || null,
    createdAt: formatLongTime(note.createdAt),
    updatedAt: formatShortTime(note.updatedAt),
    attachments: attachments.map((attachment) => (typeof attachment === 'string' ? { originalName: attachment, fileName: attachment } : attachment))
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

function parseAppDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const text = String(value).trim();
  const sqliteUtcMatch = text.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})(?:\.\d+)?$/);
  const normalized = sqliteUtcMatch ? `${sqliteUtcMatch[1]}T${sqliteUtcMatch[2]}Z` : text;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatShortTime(value) {
  if (!value) return '刚刚';
  const date = parseAppDate(value);
  if (!date) return String(value);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatLongTime(value) {
  if (!value) return '刚刚';
  const date = parseAppDate(value);
  if (!date) return String(value);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function findCategoryForType(type, categoryList = fallbackCategories) {
  if (type.includes('维修')) return categoryList.find((item) => item.id === 'repair') ?? categoryList[0];
  if (type.includes('购物')) return categoryList.find((item) => item.id === 'shopping') ?? categoryList[0];
  if (type.includes('账号')) return categoryList.find((item) => item.id === 'account') ?? categoryList[0];
  if (type.includes('临时')) return categoryList.find((item) => item.id === 'temporary') ?? categoryList[0];
  return categoryList.find((item) => item.name === type) ?? categoryList.find((item) => item.id === 'family') ?? categoryList[0] ?? fallbackCategories[0];
}

function makeDraftRef(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
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

function formatBytes(size = 0) {
  const bytes = Number(size || 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function recordTypeForNote(note) {
  if (note.categoryId === 'repair') return '维修维护';
  if (note.categoryId === 'shopping') return '购物消费';
  if (note.categoryId === 'account') return '账号资料';
  if (note.categoryId === 'temporary') return '临时想法';
  return recordTypes.some((recordType) => recordType.label === note.category) ? note.category : '家庭事务';
}

function filterNotes(notes, { filter = 'all', member = 'all', category = 'all', query = '', tag = 'all', source = 'all' }, categoryList = fallbackCategories) {
  const keyword = query.trim().toLowerCase();
  const categoryItem = categoryList.find((item) => item.id === category);

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

function AccessLockScreen({ message, onUnlock }) {
  const [pin, setPin] = useState('');

  async function submit(event) {
    event.preventDefault();
    await onUnlock(pin);
  }

  return (
    <main className="mobile-shell flex min-h-screen flex-col justify-center">
      <section className="soft-card p-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-50 text-teal-600">
          <ShieldCheck size={34} />
        </div>
        <h1 className="mt-5 text-[25px] font-bold text-[#153b37]">输入访问口令</h1>
        <p className="mt-2 text-[12px] leading-relaxed text-muted">这是家里的生活记录，只在家庭设备上输入一次即可继续使用。</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <input
            className="h-14 w-full rounded-2xl border border-line bg-white px-4 text-center text-[22px] tracking-[0.24em] outline-none focus:border-teal-500"
            inputMode="numeric"
            type="password"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            placeholder="••••"
          />
          {message && <p className="text-[14px] text-rose-500">{message}</p>}
          <button className="h-14 w-full rounded-2xl bg-teal-600 text-[15px] font-semibold text-white shadow-float" type="submit">
            进入家事记
          </button>
        </form>
      </section>
    </main>
  );
}

function HomeScreen({ notes, categories, offlineQueueCount, offlineSyncing, filter, member, category, members, onFilterChange, onMemberChange, onCategoryChange, onOpenDetail, onOpenSearch, onCreateNote, onSyncNow }) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const hasAdvancedFilter = member !== 'all' || category !== 'all';
  const visibleNotes = filterNotes(notes, { filter, member, category }, categories);
  const categoryName = categories.find((item) => item.id === category)?.name ?? '全部分类';
  return (
    <>
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-bold leading-none text-teal-600">家事记</h1>
            <Home className="mt-0.5 text-teal-600" size={20} strokeWidth={2.2} />
          </div>
          <p className="mt-1 text-[11px] text-muted">记录家里的大小事</p>
        </div>
        <div className="flex gap-2 pt-1 text-muted">
          <Clock3 size={20} />
          <MoreHorizontal size={20} className="text-ink" />
        </div>
      </header>
      <SearchPill placeholder="搜索记录、标签或内容" onClick={onOpenSearch} />
      <QuickFilters active={filter} onChange={onFilterChange} showMore={showMoreFilters} onToggleMore={() => setShowMoreFilters((value) => !value)} />
      {offlineQueueCount > 0 && (
        <section className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-700">
          <span>{offlineSyncing ? '正在同步本机记录...' : '有 ' + offlineQueueCount + ' 条本机记录待同步'}</span>
          <button
            type="button"
            className="shrink-0 rounded-full border border-amber-200 bg-white px-3 py-1 text-[12px] font-semibold text-amber-700 disabled:opacity-60"
            onClick={onSyncNow}
            disabled={offlineSyncing}
          >
            尝试同步
          </button>
        </section>
      )}
      {(showMoreFilters || hasAdvancedFilter) && (
        <section className="mt-3 rounded-2xl border border-line/70 bg-white px-3 py-3 shadow-card">
          <p className="px-1 text-[12px] text-muted">更多筛选</p>
          <MemberFilters members={members} active={member} onChange={onMemberChange} />
          <CategoryFilters categories={categories} active={category} onChange={onCategoryChange} />
        </section>
      )}
      <TodayCard onCreateNote={onCreateNote} />
      <SectionHeader
        title={category === 'all' ? '最新记录' : categoryName}
        trailing={<><RotateCw size={18} /> {visibleNotes.length} 条</>}
      />
      <section className="mt-3 space-y-2.5">
        {visibleNotes.map((note) => (
          <RecordCard key={note.id} note={note} onClick={() => onOpenDetail(note.id)} />
        ))}
        {visibleNotes.length === 0 && <EmptyState title="这里暂时没有记录" desc="换个分类、成员或筛选条件看看，也可以先新建一条。" image={illustrationAssets.emptyHome} />}
      </section>
    </>
  );
}

function clientPlainTextToRichTextHtml(value) {
  const text = String(value || '').replace(/\r\n/g, '\n').trim();
  if (!text) return '';
  return text
    .split(/\n{2,}/)
    .map((paragraph) => '<p>' + escapeClientHtml(paragraph).replace(/\n/g, '<br>') + '</p>')
    .join('');
}

function escapeClientHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

class RichTextEditorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'rich text editor unavailable' };
  }

  componentDidCatch(error) {
    console.error('Rich text editor failed; using plain text fallback.', error);
  }

  render() {
    if (this.state.hasError) {
      return <PlainTextEditorFallback {...this.props.fallbackProps} errorMessage={this.state.message} />;
    }
    return this.props.children;
  }
}

function PlainTextEditorFallback({ plainTextFallback = '', onChange, errorMessage = '' }) {
  const [text, setText] = useState(plainTextFallback || '');

  useEffect(() => {
    const html = clientPlainTextToRichTextHtml(text);
    onChange?.({ html, text: text.trim(), json: null });
  }, [text]);

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-700">
        当前手机 WebView 对富文本编辑器兼容性不足，已切换为纯文本编辑模式，避免白屏。{errorMessage ? ' 错误：' + errorMessage : ''}
      </div>
      <textarea
        className="min-h-[180px] w-full resize-none rounded-2xl border border-line bg-white px-4 py-3 text-[16px] leading-relaxed outline-none focus:border-teal-500"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="写下家里的小事、账单、维修、临时备忘..."
      />
    </div>
  );
}

function SafeRichTextEditor(props) {
  return (
    <RichTextEditorErrorBoundary fallbackProps={props}>
      <RichTextEditor {...props} />
    </RichTextEditorErrorBoundary>
  );
}

const RichImageExtension = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      draftRef: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-draft-ref'),
        renderHTML: (attributes) => (attributes.draftRef ? { 'data-draft-ref': attributes.draftRef } : {})
      },
      attachmentId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-attachment-id'),
        renderHTML: (attributes) => (attributes.attachmentId ? { 'data-attachment-id': attributes.attachmentId } : {})
      }
    };
  }
});

function RichTextEditor({ initialHtml = '', initialJson = null, plainTextFallback = '', onChange, onAttachmentDraft }) {
  const imageInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const [toolbarRevision, setToolbarRevision] = useState(0);
  const initialContent = useMemo(() => {
    if (initialJson) {
      try {
        return typeof initialJson === 'string' ? JSON.parse(initialJson) : initialJson;
      } catch {
        return initialHtml || clientPlainTextToRichTextHtml(plainTextFallback);
      }
    }
    return initialHtml || clientPlainTextToRichTextHtml(plainTextFallback);
  }, [initialHtml, initialJson, plainTextFallback]);

  function refreshToolbarState() {
    setToolbarRevision((revision) => revision + 1);
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: false, underline: false }),
      UnderlineExtension,
      LinkExtension.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      RichImageExtension.configure({ allowBase64: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: '写下家里的小事、账单、维修、临时备忘...' })
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'rich-text-editor min-h-[156px] outline-none'
      }
    },
    onUpdate({ editor: activeEditor }) {
      emitEditorChange(activeEditor);
      refreshToolbarState();
    },
    onSelectionUpdate() {
      refreshToolbarState();
    },
    onTransaction() {
      refreshToolbarState();
    },
    onFocus() {
      refreshToolbarState();
    },
    onBlur() {
      refreshToolbarState();
    }
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(initialContent || '', false);
    emitEditorChange(editor);
  }, [editor, initialContent]);

  function emitEditorChange(activeEditor = editor) {
    if (!activeEditor) return;
    onChange({ html: activeEditor.getHTML(), text: activeEditor.getText().trim(), json: activeEditor.getJSON() });
  }

  async function insertImageFile(file) {
    if (!editor || !file) return;
    const payload = await fileToAttachmentPayload(file);
    const draftRef = makeDraftRef('image');
    const nextPayload = { ...payload, draftRef, contentRefId: draftRef, kind: 'image', isInline: true };
    onAttachmentDraft?.(nextPayload);
    const src = `data:${nextPayload.mimeType};base64,${nextPayload.contentBase64}`;
    editor.chain().focus().setImage({ src, alt: nextPayload.originalName, draftRef }).run();
  }

  async function insertAttachmentFile(file) {
    if (!editor || !file) return;
    const payload = await fileToAttachmentPayload(file);
    const draftRef = makeDraftRef('file');
    const nextPayload = { ...payload, draftRef, contentRefId: draftRef, kind: 'file', isInline: true };
    onAttachmentDraft?.(nextPayload);
    editor.chain().focus().insertContent(`<p><a href="#attachment-${draftRef}">附件：${escapeClientHtml(nextPayload.originalName)}</a></p>`).run();
  }

  function handlePaste(event) {
    const imageFiles = Array.from(event.clipboardData?.files || []).filter((file) => file.type.startsWith('image/'));
    if (!imageFiles.length) return;
    event.preventDefault();
    imageFiles.forEach((file) => insertImageFile(file));
  }

  function setLink() {
    if (!editor) return;
    const currentHref = editor.getAttributes('link').href || '';
    const href = window.prompt('输入链接地址', currentHref);
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run();
  }

  function toggleTextColor() {
    if (!editor) return;
    const color = '#0F766E';
    if (editor.isActive('textStyle', { color })) {
      editor.chain().focus().unsetColor().run();
      return;
    }
    editor.chain().focus().setColor(color).run();
  }

  const toolbarGroups = [
    {
      id: 'basic',
      label: '常用',
      tools: [
        ['undo', '撤销', Undo2, () => editor?.chain().focus().undo().run()],
        ['redo', '重做', Redo2, () => editor?.chain().focus().redo().run()],
        ['bold', '加粗', Bold, () => editor?.chain().focus().toggleBold().run(), () => editor?.isActive('bold')],
        ['italic', '斜体', Italic, () => editor?.chain().focus().toggleItalic().run(), () => editor?.isActive('italic')],
        ['underline', '下划线', Underline, () => editor?.chain().focus().toggleUnderline().run(), () => editor?.isActive('underline')],
        ['strike', '删除线', Strikethrough, () => editor?.chain().focus().toggleStrike().run(), () => editor?.isActive('strike')],
        ['h2', '标题', Heading2, () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), () => editor?.isActive('heading', { level: 2 })],
        ['h3', '小标题', Heading3, () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), () => editor?.isActive('heading', { level: 3 })]
      ]
    },
    {
      id: 'list',
      label: '列表',
      tools: [
        ['ul', '无序', List, () => editor?.chain().focus().toggleBulletList().run(), () => editor?.isActive('bulletList')],
        ['ol', '有序', ListOrdered, () => editor?.chain().focus().toggleOrderedList().run(), () => editor?.isActive('orderedList')],
        ['task', '待办', ListChecks, () => editor?.chain().focus().toggleTaskList().run(), () => editor?.isActive('taskList')],
        ['quote', '引用', Quote, () => editor?.chain().focus().toggleBlockquote().run(), () => editor?.isActive('blockquote')],
        ['code', '代码', Code2, () => editor?.chain().focus().toggleCodeBlock().run(), () => editor?.isActive('codeBlock')]
      ]
    },
    {
      id: 'insert',
      label: '插入',
      tools: [
        ['link', '链接', Link, setLink, () => editor?.isActive('link')],
        ['image', '图片', Upload, () => imageInputRef.current?.click()],
        ['attach', '附件', Paperclip, () => attachmentInputRef.current?.click()],
        ['table', '表格', Table2, () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), () => editor?.isActive('table')]
      ]
    },
    {
      id: 'style',
      label: '更多',
      tools: [
        ['left', '左对齐', AlignLeft, () => editor?.chain().focus().setTextAlign('left').run(), () => editor?.isActive({ textAlign: 'left' })],
        ['center', '居中', AlignCenter, () => editor?.chain().focus().setTextAlign('center').run(), () => editor?.isActive({ textAlign: 'center' })],
        ['right', '右对齐', AlignRight, () => editor?.chain().focus().setTextAlign('right').run(), () => editor?.isActive({ textAlign: 'right' })],
        ['color', '文字色', Palette, toggleTextColor, () => editor?.isActive('textStyle', { color: '#0F766E' })],
        ['highlight', '高亮', Highlighter, () => editor?.chain().focus().toggleHighlight({ color: '#FEF3C7' }).run(), () => editor?.isActive('highlight', { color: '#FEF3C7' })],
        ['clear', '清格式', X, () => editor?.chain().focus().unsetAllMarks().clearNodes().run()]
      ]
    }
  ];
  const [activeToolbarGroup, setActiveToolbarGroup] = useState('basic');
  const activeTools = toolbarGroups.find((group) => group.id === activeToolbarGroup)?.tools ?? toolbarGroups[0].tools;

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-3 rounded-2xl border border-line/80 bg-white/90 p-2 shadow-[0_6px_18px_rgba(39,43,48,0.04)]" data-toolbar-revision={toolbarRevision}>
        <div className="grid grid-cols-4 gap-1.5">
          {toolbarGroups.map((group) => (
            <button
              className={`h-8 rounded-xl text-[12px] font-semibold ${activeToolbarGroup === group.id ? 'bg-teal-600 text-white shadow-sm' : 'bg-soft text-muted'}`}
              key={group.id}
              type="button"
              onClick={() => setActiveToolbarGroup(group.id)}
            >
              {group.label}
            </button>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {activeTools.map(([key, label, Icon, action, isActive]) => (
            <button
              aria-label={label}
              className={`flex h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border px-1 text-[10px] font-medium active:bg-teal-50 active:text-teal-700 ${isActive?.() ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-line bg-white text-muted'}`}
              key={key}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={action}
              title={label}
            >
              <Icon size={17} />
              <span className="max-w-full truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>
      <EditorContent editor={editor} onPaste={handlePaste} />
      <input ref={imageInputRef} className="hidden" type="file" accept="image/*" onChange={(event) => { Array.from(event.target.files || []).forEach((file) => insertImageFile(file)); event.target.value = ''; }} />
      <input ref={attachmentInputRef} className="hidden" type="file" onChange={(event) => { Array.from(event.target.files || []).forEach((file) => insertAttachmentFile(file)); event.target.value = ''; }} />
    </div>
  );
}

function NewRecordScreen({ members, categories, currentMemberId, onBack, onSave, mode = 'create', initialNote = null }) {
  const isEditing = mode === 'edit' && initialNote;
  const [title, setTitle] = useState(initialNote?.title || '');
  const initialRichHtml = initialNote?.contentHtml || initialNote?.richContent?.html || '';
  const [bodyText, setBodyText] = useState(initialNote?.content || '');
  const [bodyHtml, setBodyHtml] = useState(initialRichHtml);
  const [bodyJson, setBodyJson] = useState(initialNote?.contentJson || null);
  const [inlineAttachments, setInlineAttachments] = useState([]);
  const [type, setType] = useState(initialNote ? recordTypeForNote(initialNote) : '家庭事务');
  const initialCategoryId = initialNote?.categoryId || findCategoryForType(initialNote ? recordTypeForNote(initialNote) : '家庭事务', categories)?.id || categories[0]?.id || 'family';
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const initialTags = initialNote ? initialNote.tags.map((tag) => tag.label).filter(Boolean) : ['待办', '重要'];
  const [tags, setTags] = useState(initialTags);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState(initialNote?.memberId || currentMemberId);
  const currentMember = members.find((member) => member.id === selectedMemberId) ?? members[0] ?? fallbackMembers[0];
  const tagOptions = ['待办', '重要', '维修', '购物', '账单'];
  const visibleTagOptions = [...new Set([...tagOptions, ...tags])];

  function toggleTag(label) {
    setTags((current) => (current.includes(label) ? current.filter((item) => item !== label) : [...current, label]));
  }

  function addTag() {
    const label = newTag.trim();
    if (!label) return;
    setTags((current) => (current.includes(label) ? current : [...current, label]));
    setNewTag('');
    setIsAddingTag(false);
  }

  async function save() {
    const attachments = inlineAttachments;
    onSave({ id: initialNote?.id, title, body: bodyText, bodyHtml, bodyJson, type, categoryId: selectedCategoryId, memberId: currentMember.id, tags, attachments });
  }

  return (
    <>
      <TopBar title={isEditing ? "编辑记录" : "新记录"} onBack={onBack} action="保存" onAction={save} />
      <section className="soft-card mt-5 flex h-12 items-center gap-3 px-4 text-[14px] text-muted">
        <span className="text-[20px]">T</span>
        <input
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="标题（可选）"
        />
      </section>
      <section className="soft-card mt-3 min-h-[168px] p-4">
        <div className="flex gap-3 text-[14px] text-muted">
          <FileText className="mt-1 shrink-0" size={18} />
          <SafeRichTextEditor
            initialHtml={initialRichHtml}
            initialJson={initialNote?.contentJson}
            plainTextFallback={initialNote?.content || ''}
            onChange={({ text, html, json }) => {
              setBodyText(text);
              setBodyHtml(html);
              setBodyJson(json);
            }}
            onAttachmentDraft={(attachment) => {
              setInlineAttachments((current) => [...current, attachment]);
            }}
          />
        </div>
        <div className="mt-2 text-right text-[11px] text-muted">{bodyText.length}/1000</div>
      </section>
      <section className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-line/70 bg-white/80 px-4 py-3 shadow-[0_6px_18px_rgba(39,43,48,0.045)]">
        <div className="flex min-w-0 items-center gap-3">
          <AvatarMark src={currentMember.avatarImage} label={currentMember.name} className={`h-9 w-9 shrink-0 border ${currentMember.colorClass}`} />
          <div className="min-w-0">
            <p className="truncate text-[12px] text-muted">当前成员</p>
            <p className="truncate text-[14px] font-semibold text-ink">{currentMember.name}</p>
          </div>
        </div>
        <div className="scroll-row flex max-w-[158px] gap-2 pb-1">
          {members.map((member) => (
            <button
              className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[12px] ${selectedMemberId === member.id ? member.colorClass : 'border-line bg-white text-muted'}`}
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
      <section className="grid grid-cols-4 gap-2">
        {recordTypes.map((recordType) => {
          const Icon = recordType.icon;
          return (
            <button
              className={`soft-card flex h-[66px] flex-col items-center justify-center gap-1.5 px-1 text-[10px] font-medium ${
                type === recordType.label ? 'border-teal-600 bg-teal-50 text-teal-700' : 'text-ink'
              }`}
              key={recordType.label}
              type="button"
              onClick={() => {
                setType(recordType.label);
                const matchedCategory = findCategoryForType(recordType.label, categories);
                if (matchedCategory?.id) setSelectedCategoryId(matchedCategory.id);
              }}
            >
              <Icon size={18} strokeWidth={2.1} />
              {recordType.label}
            </button>
          );
        })}
      </section>
      <SectionTitle>分类</SectionTitle>
      <section className="soft-card p-3">
        <div className="scroll-row flex gap-2 pb-1">
          {categories.map((category) => (
            <button
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-medium ${selectedCategoryId === category.id ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-line bg-white text-muted'}`}
              key={category.id}
              type="button"
              onClick={() => setSelectedCategoryId(category.id)}
            >
              <CategoryMark src={category.imageSrc} fallback={category.icon} label={category.name} className="h-5 w-5" iconSize={14} />
              {category.name}
            </button>
          ))}
        </div>
      </section>

      <SectionTitle>标签</SectionTitle>
      <section className="soft-card flex flex-wrap gap-2 p-3">
        {visibleTagOptions.map((label) => (
          <button
            className={`tag ${tags.includes(label) ? tagTones[findTagTone(label)] : 'border border-line bg-white text-muted'}`}
            key={label}
            type="button"
            onClick={() => toggleTag(label)}
          >
            {label} {tags.includes(label) && <X className="ml-1" size={13} />}
          </button>
        ))}
        {isAddingTag ? (
          <span className="inline-flex max-w-full items-center gap-2 rounded-xl border border-dashed border-teal-200 bg-white px-3 py-1.5">
            <input
              className="w-20 bg-transparent text-[12px] outline-none placeholder:text-muted"
              value={newTag}
              onChange={(event) => setNewTag(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addTag();
                if (event.key === 'Escape') {
                  setNewTag('');
                  setIsAddingTag(false);
                }
              }}
              placeholder="标签名"
              autoFocus
            />
            <button className="text-teal-600" type="button" onClick={addTag} aria-label="确认添加标签">
              <Check size={16} />
            </button>
            <button className="text-muted" type="button" onClick={() => { setNewTag(''); setIsAddingTag(false); }} aria-label="取消添加标签">
              <X size={16} />
            </button>
          </span>
        ) : (
          <button className="inline-flex items-center rounded-xl border border-dashed border-line px-3 py-1.5 text-[12px] text-muted" type="button" onClick={() => setIsAddingTag(true)}>
            <Plus size={17} /> 添加标签
          </button>
        )}
      </section>
      <div className="bottom-action-bar flex h-[72px] items-center px-4 py-3">
        <button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 text-[15px] font-semibold text-white shadow-float" type="button" onClick={save}>
          <Check size={24} /> {isEditing ? '保存修改' : '保存记录'}
        </button>
      </div>
    </>
  );
}

function SearchScreen({ notes, categories, members, onOpenDetail }) {
  const [query, setQuery] = useState('漏水');
  const [category, setCategory] = useState('all');
  const [tag, setTag] = useState('待办');
  const [member, setMember] = useState('all');
  const [range, setRange] = useState('全部时间');
  const [source, setSource] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const hasAdvancedSearch = member !== 'all' || source !== 'all';
  const results = filterNotes(notes, { query, category, tag, member, source }, categories);
  const categoryFilterOptions = ['all', ...categories.slice(0, 7).map((item) => item.id)];
  const categoryFilterLabels = Object.fromEntries(categories.map((item) => [item.id, item.name]));
  categoryFilterLabels.all = '全部';
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
          <h1 className="text-[17px] font-bold leading-none text-ink">搜索</h1>
          <p className="mt-1 text-[11px] text-muted">快速找到你需要的记录</p>
        </div>
        <button className="chip mt-3 px-3">
          <Clock3 size={19} /> 历史
        </button>
      </header>
      <section className="soft-card mt-4 flex h-12 items-center gap-3 px-4">
        <Search size={22} className="text-muted" />
        <input
          className="min-w-0 flex-1 bg-transparent text-[14px] font-medium outline-none placeholder:text-muted"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="输入关键词"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="清空搜索">
            <X size={18} className="text-muted" />
          </button>
        )}
        <span className="h-6 w-px bg-line" />
        <span className="text-[14px] font-medium text-teal-600">搜索</span>
      </section>
      <section className="soft-card mt-4 divide-y divide-line p-3">
        <FilterRow title="分类" options={categoryFilterOptions} labels={categoryFilterLabels} active={category} onChange={setCategory} />
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
      <section className="mt-3 space-y-2.5">
        {results.map((note) => (
          <RecordCard key={note.id} note={note} onClick={() => onOpenDetail(note.id)} />
        ))}
      </section>
      {results.length === 0 && <EmptyState title="没有找到匹配记录" desc="可以换个关键词，或少选一些分类、标签和成员条件。" image={illustrationAssets.emptySearch} />}
    </>
  );
}

function CategoriesScreen({ notes, categories, onSelectCategory, onCreateCategory, onUpdateCategory }) {
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: '', color: categoryColorOptions[0], icon: 'folder' });
  const visibleCategories = categories
    .map((category) => ({
      ...category,
      count: notes.filter((note) => note.categoryId === category.id).length,
      update: notes.some((note) => note.categoryId === category.id) ? '最近有更新' : category.update
    }))
    .filter((category) => category.name.includes(query.trim()));
  const isEditing = Boolean(editingId);

  function startCreate() {
    setEditingId('new');
    setDraft({ name: '', color: categoryColorOptions[0], icon: 'folder' });
  }

  function startEdit(category) {
    setEditingId(category.id);
    setDraft({ name: category.name, color: category.color || categoryColorOptions[0], icon: category.iconKey || 'folder' });
  }

  async function submitCategory(event) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    const ok = editingId === 'new' ? await onCreateCategory(draft) : await onUpdateCategory(editingId, draft);
    if (ok) {
      setEditingId(null);
      setDraft({ name: '', color: categoryColorOptions[0], icon: 'folder' });
    }
  }

  return (
    <>
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[20px] font-bold leading-none text-ink">分类</h1>
          <p className="mt-1 text-[11px] text-muted">按家里的事情慢慢整理</p>
        </div>
        <button className="chip px-3 text-teal-700" type="button" onClick={startCreate}>
          <Plus size={17} /> 新分类
        </button>
      </header>
      <section className="soft-card mt-4 flex h-11 w-full items-center gap-3 rounded-xl bg-[#F2F2F5] px-3 text-left text-[14px] text-[#8b8e94] shadow-card">
        <Search size={20} className="text-[#777b82]" />
        <input
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#8b8e94]"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索分类"
        />
      </section>
      {isEditing && (
        <form className="soft-card mt-4 space-y-3 p-3" onSubmit={submitCategory}>
          <div className="flex items-center gap-2">
            <input
              className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-[14px] outline-none focus:border-teal-500"
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              placeholder="分类名称"
              maxLength={24}
              autoFocus
            />
            <button className="h-10 rounded-xl bg-teal-600 px-4 text-[13px] font-semibold text-white" type="submit">保存</button>
            <button className="h-10 rounded-xl border border-line px-3 text-[13px] text-muted" type="button" onClick={() => setEditingId(null)}>取消</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryColorOptions.map((color) => (
              <button
                aria-label={color}
                className={`h-7 w-7 rounded-full border-2 ${draft.color === color ? 'border-ink' : 'border-white'}`}
                key={color}
                style={{ backgroundColor: color }}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, color }))}
              />
            ))}
          </div>
          <div className="scroll-row flex gap-2 pb-1">
            {categoryIconOptions.map(([iconKey, label, Icon]) => (
              <button
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] ${draft.icon === iconKey ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-line bg-white text-muted'}`}
                key={iconKey}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, icon: iconKey }))}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </form>
      )}
      <section className="mt-4 grid grid-cols-2 gap-3 pb-24" data-category-grid>
        {visibleCategories.map((category) => {
          const Icon = category.icon;
          const displayName = category.name;
          const displayUpdate = category.update.replace(' 更新', '');
          const countTone = category.tone.match(/text-[^\s]+/)?.[0] ?? 'text-teal-600';
          return (
            <article className="soft-card relative flex h-[78px] w-full items-center gap-2 overflow-hidden rounded-2xl px-2.5 py-2.5 text-left shadow-card" data-category-card key={category.id}>
              <button className="flex min-w-0 flex-1 items-center gap-2 text-left" type="button" onClick={() => onSelectCategory(category.id)}>
                <div className={`circle-icon h-[34px] w-[34px] shrink-0 ${category.tone}`} data-category-icon>
                  <CategoryMark src={category.imageSrc} fallback={Icon} label={displayName} className="h-[27px] w-[27px]" iconSize={17} />
                </div>
                <div className="min-w-0 flex-1 pr-4">
                  <h2 className="whitespace-nowrap text-[13px] font-semibold leading-4 text-ink" data-category-title>{displayName}</h2>
                  <p className={`mt-0.5 whitespace-nowrap text-[11px] font-medium leading-[14px] ${countTone}`} data-category-count>{category.count} 条记录</p>
                  <p className="mt-0.5 whitespace-nowrap text-[10px] leading-[13px] text-muted" data-category-update>{displayUpdate}</p>
                </div>
              </button>
              <button className="absolute right-1 top-1 rounded-full p-1 text-muted" type="button" aria-label={`编辑${displayName}`} onClick={() => startEdit(category)}>
                <MoreHorizontal size={14} />
              </button>
              <ChevronRight className="absolute bottom-2 right-1.5 text-muted" size={13} />
            </article>
          );
        })}
        {visibleCategories.length === 0 && <EmptyState title="暂时没有这个分类" desc="可以添加一个新的家庭分类，或换个关键词再试。" image={illustrationAssets.emptyHome} />}
      </section>
    </>
  );
}
function ImportScreen({ currentMemberId, onBack, onImported }) {
  const nsxInputRef = useRef(null);
  const [stage, setStage] = useState(1);
  const [preview, setPreview] = useState(null);
  const [selectedNsxFile, setSelectedNsxFile] = useState(null);
  const [error, setError] = useState('');
  const steps = [
    ['1', '选择文件'],
    ['2', '预览记录'],
    ['3', '确认导入'],
    ['4', '导入完成']
  ];
  const canPreview = stage >= 2;
  const canCommitPreview = Boolean(preview?.importId);
  const displayFileName = canPreview ? preview?.fileName || 'Note Station 导入摘要' : selectedNsxFile?.name || '等待选择 .nsx 文件';
  const displayFileMeta = selectedNsxFile ? formatBytes(selectedNsxFile.size) + ' · 网页端预检' : '先预览导入记录，再决定是否写入';

  function handleNsxFileChange(event) {
    const file = event.target.files?.[0];
    setError('');
    setPreview(null);
    setStage(1);
    setSelectedNsxFile(file || null);
  }

  function resetSelectedFile() {
    setStage(1);
    setPreview(null);
    setSelectedNsxFile(null);
    setError('');
    if (nsxInputRef.current) nsxInputRef.current.value = '';
  }

  async function createPreview() {
    setError('');
    try {
      if (!selectedNsxFile) {
        nsxInputRef.current?.click();
        return;
      }
      const response = await fetchApi('/api/imports/notestation/dry-run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-File-Name': encodeURIComponent(selectedNsxFile.name),
          'X-Member-Id': currentMemberId
        },
        body: selectedNsxFile
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
      const response = await fetchApi(`/api/imports/notestation/${preview.importId}/commit`, {
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
      if (!canCommitPreview) return;
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
      <section className="mt-5 flex items-start justify-between gap-1">
        {steps.map(([num, label], index) => (
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center" key={num}>
            <div className={`grid h-9 w-9 place-items-center rounded-full border text-[15px] font-medium ${stage === index + 1 ? 'border-teal-600 bg-teal-600 text-white' : stage > index + 1 ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-line bg-white text-muted'}`}>
              {stage > index + 1 ? <Check size={17} /> : num}
            </div>
            <p className={stage >= index + 1 ? 'text-[12px] leading-tight text-teal-600' : 'text-[12px] leading-tight text-muted'}>{label}</p>
          </div>
        ))}
      </section>
      <input ref={nsxInputRef} className="hidden" type="file" accept=".nsx" onChange={handleNsxFileChange} />
      <section className="soft-card mt-4 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-[60px] w-12 shrink-0 place-items-center rounded-xl bg-teal-600 text-[18px] font-bold text-white">
            ZIP
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-bold leading-snug text-ink" style={{ overflowWrap: 'anywhere' }}>{displayFileName}</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">{canPreview ? '已完成 dry-run 预检' : displayFileMeta}</p>
          </div>
        </div>
        <button className="mt-4 inline-flex items-center gap-2 text-[14px] font-medium text-teal-600" type="button" onClick={() => nsxInputRef.current?.click()}>
          {canPreview ? <><CheckCircle2 size={18} /> 已预检</> : selectedNsxFile ? <><Upload size={18} /> 重新选择 .nsx 文件</> : <><Upload size={18} /> 选择 .nsx 文件</>}
        </button>
      </section>
      {error && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[15px] text-amber-600">
          {error}
        </div>
      )}
      {canPreview && preview && (
        <>
          <section className="soft-card mt-4 p-5">
            <div className="grid grid-cols-4 gap-2">
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
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">{record.content || record.summary}</p>
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
            <p className="mt-4 text-[12px] text-muted">无法准确映射的记录会先放入未分类 / 待整理，并保留原始路径方便之后整理。</p>
          </section>
        </>
      )}
      <div className="bottom-action-bar grid h-[80px] grid-cols-2 gap-3 px-4 py-3">
        <button className="rounded-2xl border border-teal-600 text-[14px] font-medium text-teal-600" type="button" onClick={canPreview || selectedNsxFile ? resetSelectedFile : onBack}>
          {canPreview || selectedNsxFile ? '重新选择文件' : '取消'}
        </button>
        <button className="rounded-2xl bg-teal-600 text-[15px] font-semibold text-white shadow-float disabled:bg-slate-300 disabled:shadow-none" type="button" onClick={handlePrimaryAction} disabled={canPreview && !canCommitPreview}>
          {stage === 1 ? (selectedNsxFile ? '预览导入记录' : '选择 .nsx 文件') : stage === 2 ? (canCommitPreview ? '继续确认' : '等待网页解析接入') : stage === 3 ? '开始导入' : '已完成'}
        </button>
      </div>
    </>
  );
}

function hasSafeRichContent(note) {
  return Boolean(note?.richContent?.format === 'html' && note.richContent?.html);
}

function RichTextContent({ html }) {
  return <div className="rich-text-content mt-4" dangerouslySetInnerHTML={{ __html: html }} />;
}
function DetailScreen({ note, onBack, onEdit, onArchive, onDelete }) {
  const [showActions, setShowActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const hasRichContent = hasSafeRichContent(note);
  const [contentMode, setContentMode] = useState(hasRichContent ? 'rich' : 'plain');
  const showRichContent = hasRichContent && contentMode === 'rich';
  const visibleAttachments = (note.attachments || []).filter((attachment) => {
    if (typeof attachment === 'string') return true;
    const richHtml = note.richContent?.html || '';
    const isReferencedInRichText = attachment.id && richHtml.includes(`data-attachment-id="${attachment.id}"`);
    const isImageAttachment = String(attachment.mimeType || '').startsWith('image/') || attachment.kind === 'image' || /\.(png|jpe?g|gif|webp)$/i.test(attachment.originalName || attachment.fileName || '');
    if (note.sourceType === 'notestation_import' && isImageAttachment && hasRichContent) return false;
    return !attachment.isInline && !isReferencedInRichText;
  });

  useEffect(() => {
    setContentMode(hasRichContent ? 'rich' : 'plain');
  }, [note.id, hasRichContent]);

  const Icon = note.icon;
  const CategoryIcon = note.categoryIcon;
  return (
    <>
      <TopBar title="记录详情" onBack={onBack} action="编辑" onAction={onEdit} />
      <section className="soft-card mt-5 p-4">
        <div className="flex gap-3">
          <div className={`circle-icon h-[72px] w-[72px] bg-white ${note.iconTone}`}>
            <CategoryMark src={note.categoryImageSrc || categoryImageAssets[note.categoryId]} fallback={Icon} label={note.category} className="h-14 w-14" iconSize={38} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between gap-2">
              <h2 className="min-w-0 text-[16px] font-bold leading-tight" style={{ overflowWrap: 'anywhere' }}>{note.title}</h2>
              <span className="text-[25px] text-muted">☆</span>
            </div>
            <div className={`mt-3 flex items-center gap-2 text-[14px] font-medium ${note.categoryColor}`}>
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[12px] font-medium text-teal-700"><UserRound size={16} /> {note.member}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-soft px-2.5 py-1 text-[12px] font-medium text-muted"><Cloud size={16} /> {note.status}</span>
          </div>
        </div>
        {note.sourceType === 'notestation_import' && (
          <div className="mt-5 rounded-2xl bg-teal-50/70 p-4 text-[12px] leading-relaxed text-muted">
            <p className="font-semibold text-teal-700">Note Station 来源信息</p>
            <div className="mt-3 space-y-2">
              <p className="break-words"><span className="text-[#24312f]">原始分类：</span>{note.originalCategory || '未分类 / 待整理'}</p>
              <p className="break-words"><span className="text-[#24312f]">原始路径：</span>{note.originalPath || '已标记为 Note Station 导入，原始路径待整理'}</p>
            </div>
          </div>
        )}
      </section>
      <section className="soft-card mt-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-3 text-[20px] font-bold text-teal-600"><ListChecks size={22} /> 内容</h2>
          {hasRichContent && (
            <div className="inline-flex shrink-0 rounded-full border border-line bg-white p-1 text-[13px] font-medium text-muted">
              <button className={`rounded-full px-3 py-1 ${showRichContent ? 'bg-teal-50 text-teal-700' : ''}`} type="button" onClick={() => setContentMode('rich')}>格式</button>
              <button className={`rounded-full px-3 py-1 ${!showRichContent ? 'bg-teal-50 text-teal-700' : ''}`} type="button" onClick={() => setContentMode('plain')}>纯文本</button>
            </div>
          )}
        </div>
        {showRichContent ? <RichTextContent html={note.richContent.html} /> : <p className="mt-4 whitespace-pre-line text-[18px] leading-[1.8]">{note.content}</p>}
      </section>
      {visibleAttachments.length > 0 && (
        <section className="soft-card mt-4 p-5">
          <h2 className="flex items-center gap-3 text-[20px] font-bold text-teal-600"><Paperclip size={23} /> 附件（{visibleAttachments.length}）</h2>
          <div className="mt-4 space-y-3">
            {visibleAttachments.map((attachment, index) => {
            const item = typeof attachment === 'string' ? { originalName: attachment, fileName: attachment } : attachment;
            const name = item.originalName || item.fileName || '附件';
            const isImage = String(item.mimeType || '').startsWith('image/') || item.kind === 'image';
            const row = (
              <div className="flex items-center justify-between rounded-2xl border border-line p-3" key={item.id || name || index}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-600">{isImage ? <Upload size={29} /> : <FileText size={29} />}</div>
                  <div className="min-w-0">
                    <p className="break-words text-[16px] font-medium">{name}</p>
                    <p className="mt-1 text-[14px] text-muted">{item.isInline ? '正文内引用' : '保存在 NAS 附件目录'}</p>
                  </div>
                </div>
                <Download className="shrink-0 text-teal-600" size={24} />
              </div>
            );
            return item.downloadUrl ? <a href={item.downloadUrl} key={item.id || name || index} target="_blank" rel="noreferrer">{row}</a> : row;
            })}
          </div>
        </section>
      )}
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
        <button className="inline-flex h-[52px] items-center gap-3 rounded-2xl bg-teal-600 px-7 py-3 text-[15px] font-semibold text-white shadow-float" type="button"><Share2 size={18} /> 分享记录</button>
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

function MemberManagementScreen({ members, currentMemberId, onBack, onSwitchMember, onUpdateMember }) {
  const [editingMemberId, setEditingMemberId] = useState('');
  const [draftName, setDraftName] = useState('');
  const [draftAvatar, setDraftAvatar] = useState('');
  const [draftColor, setDraftColor] = useState('teal');

  function startEdit(member) {
    setEditingMemberId(member.id);
    setDraftName(member.name);
    setDraftAvatar(member.avatar || member.name.slice(0, 1));
    setDraftColor(member.color || 'teal');
  }

  async function saveEdit() {
    await onUpdateMember(editingMemberId, { name: draftName, avatar: draftAvatar, color: draftColor });
    setEditingMemberId('');
  }

  return (
    <>
      <TopBar title="成员管理" onBack={onBack} />
      <section className="soft-card mt-4 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-600"><UserRound size={24} /></div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[18px] font-semibold leading-6 text-ink">家庭成员身份</h1>
            <p className="mt-1 text-[12px] leading-5 text-muted">当前只保留“我”和“爱人”，可切换、改名、调整头像字和颜色。</p>
          </div>
        </div>
      </section>
      <SectionTitle>当前成员</SectionTitle>
      <section className="soft-card p-4">
        {members.filter((member) => member.id === currentMemberId).map((member) => (
          <div className="flex items-center gap-3" key={member.id}>
            <AvatarMark src={member.avatarImage} label={member.name} className={`h-12 w-12 shrink-0 border ${member.colorClass}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[18px] font-semibold text-ink">{member.name}</p>
              <p className="mt-1 text-[12px] leading-5 text-muted">新建记录默认归到这个成员名下</p>
            </div>
            <CheckCircle2 className="shrink-0 text-teal-600" size={22} />
          </div>
        ))}
      </section>
      <SectionTitle>家庭成员列表</SectionTitle>
      <section className="space-y-3">
        {members.map((member) => {
          const isCurrent = member.id === currentMemberId;
          const isEditing = editingMemberId === member.id;
          return (
            <article className="soft-card p-4" key={member.id}>
              <div className="flex items-center gap-3">
                <AvatarMark src={member.avatarImage} label={member.name} className={`h-12 w-12 shrink-0 border ${member.colorClass}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <h2 className="truncate text-[17px] font-semibold text-ink">{member.name}</h2>
                    {isCurrent && <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-600">当前</span>}
                  </div>
                  <p className="mt-1 text-[12px] leading-5 text-muted">改名、头像字和颜色会同步到记录显示。</p>
                </div>
                <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-teal-600" type="button" onClick={() => onSwitchMember(member.id)} aria-label={`切换到${member.name}`}>
                  {isCurrent ? <CheckCircle2 size={20} /> : <ChevronRight size={22} />}
                </button>
              </div>
              {isEditing ? (
                <div className="mt-4 space-y-3">
                  <input className="h-10 w-full rounded-2xl border border-line bg-white px-3 text-[14px] outline-none focus:border-teal-500" value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder="成员名称" />
                  <input className="h-10 w-full rounded-2xl border border-line bg-white px-3 text-[14px] outline-none focus:border-teal-500" value={draftAvatar} onChange={(event) => setDraftAvatar(event.target.value.slice(0, 2))} placeholder="头像字" />
                  <div className="scroll-row flex gap-2 pb-1">
                    {memberColorOptions.map(([color, label]) => (
                      <button className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[12px] ${draftColor === color ? memberColorClasses[color] : 'border-line bg-white text-muted'}`} key={color} type="button" onClick={() => setDraftColor(color)}>{label}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="rounded-2xl border border-line bg-white px-3 py-2 text-[14px] text-muted" type="button" onClick={() => setEditingMemberId('')}>取消</button>
                    <button className="rounded-2xl bg-teal-600 px-3 py-2 text-[14px] font-semibold text-white" type="button" onClick={saveEdit}>保存</button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button className="h-9 rounded-2xl border border-line bg-white px-3 text-[13px] font-medium text-muted" type="button" onClick={() => startEdit(member)}>改名</button>
                  <button className="h-9 rounded-2xl border border-line bg-white px-3 text-[13px] font-medium text-muted" type="button" onClick={() => startEdit(member)}>头像</button>
                  <button className="h-9 rounded-2xl border border-line bg-white px-3 text-[13px] font-medium text-muted" type="button" onClick={() => startEdit(member)}>颜色</button>
                </div>
              )}
            </article>
          );
        })}
      </section>
      <section className="mt-4 rounded-2xl border border-line bg-white/80 p-3 text-[12px] leading-5 text-muted">
        当前只固定使用“我”和“爱人”；新增成员以后再做。
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
  const [storageProbe, setStorageProbe] = useState(null);

  useEffect(() => {
    async function loadStorageStatus() {
      try {
        const response = await fetchApi('/api/storage/status');
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
        await fetchApi('/api/storage/backup', {
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
      const response = await fetchApi('/api/storage/backup', {
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

  async function probeStorage() {
    try {
      const response = await fetchApi('/api/storage/probe', { method: 'POST' });
      const data = await response.json();
      setStorageProbe(data);
      setStorageMessage(data.ok ? '存储目录读写正常，NAS 挂载可以使用。' : '存储目录检查失败，请确认 NAS 挂载目录权限。');
    } catch {
      setStorageProbe({ ok: false });
      setStorageMessage('没有完成存储目录检查，请确认服务端正在运行。');
    }
  }

  async function exportJson() {
    try {
      const response = await fetchApi('/api/storage/export-json', { method: 'POST' });
      if (!response.ok) throw new Error('export failed');
      const data = await response.json();
      setStorageMessage('导出完成，JSON 文件已保存到 data/exports/。');
    } catch {
      setStorageMessage('JSON 没有导出成功，请确认服务端正在运行后再试。');
    }
  }

  async function exportMarkdown() {
    try {
      const response = await fetchApi('/api/storage/export-markdown', { method: 'POST' });
      if (!response.ok) throw new Error('markdown export failed');
      await response.json();
      setStorageMessage('导出完成，Markdown 文件已保存到 data/exports/。');
    } catch {
      setStorageMessage('Markdown 没有导出成功，请确认服务端正在运行后再试。');
    }
  }

  return (
    <>
      <header className="flex min-h-[92px] items-start justify-between gap-4">
        <div className="min-w-0 pt-1">
          <h1 className="text-[20px] font-bold leading-none text-[#093f3e]">设置</h1>
          <p className="mt-2 text-[12px] leading-relaxed text-muted">数据在自己手里更安心 <span className="text-[#ff8a4d]">♥</span></p>
        </div>
        <div className="relative h-[72px] w-[108px] shrink-0 overflow-hidden rounded-2xl bg-white/50">
          <div className="absolute bottom-3 left-7 h-9 w-10 rounded-[50%] bg-[#e9dfcf]" />
          <div className="absolute bottom-8 left-12 h-10 w-1 rounded-full bg-[#9aaa76]" />
          <div className="absolute bottom-12 left-9 h-3 w-7 rotate-[-25deg] rounded-full bg-[#9aaa76]" />
          <div className="absolute bottom-14 left-14 h-3 w-7 rotate-[22deg] rounded-full bg-[#9aaa76]" />
          <div className="absolute right-2 top-5 h-10 w-9 rounded-sm border-[4px] border-[#d6a979] bg-[#f7f0e2]" />
        </div>
      </header>

      <SectionTitle>数据备份</SectionTitle>
      <section className="soft-card p-4">
        <div className="grid grid-cols-[42px_minmax(0,1fr)_84px] items-center gap-3">
          <div className={`grid h-[42px] w-[42px] place-items-center rounded-2xl ${nasOnline ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-500'}`}>
            <Cloud size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-snug text-ink">上次备份：{lastBackup}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[12px] leading-snug text-muted">
              <span>{nasOnline ? '数据已安全' : '暂时连不上 NAS'}</span>
              {nasOnline ? <CheckCircle2 size={13} className="shrink-0 text-teal-600" /> : <AlertCircle size={13} className="shrink-0 text-amber-500" />}
            </p>
          </div>
          <button
            className={`h-10 rounded-xl text-[13px] font-semibold shadow-card ${nasOnline ? 'bg-teal-600 text-white' : 'bg-amber-50 text-amber-600'}`}
            type="button"
            onClick={runBackup}
          >
            {backupState === 'running' ? '备份中' : '立即备份'}
          </button>
        </div>

        <div className="mt-4 space-y-2 text-[12px] text-muted">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-soft px-3 py-2.5">
            <span className="min-w-0 truncate">备份状态测试</span>
            <div className="flex shrink-0 gap-2">
              <button className={`rounded-full border px-3 py-1 font-medium ${nasOnline ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-line bg-white text-muted'}`} type="button" onClick={() => setNasOnline(true)}>
                正常
              </button>
              <button className={`rounded-full border px-3 py-1 font-medium ${!nasOnline ? 'border-amber-400 bg-amber-50 text-amber-600' : 'border-line bg-white text-muted'}`} type="button" onClick={() => setNasOnline(false)}>
                离线
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-soft px-3 py-2.5">
            <span className="min-w-0 truncate">{storageProbe?.ok ? '存储目录读写正常' : '检查当前数据目录'}</span>
            <button className="shrink-0 rounded-full border border-teal-600 bg-teal-50 px-3 py-1 font-medium text-teal-700" type="button" onClick={probeStorage}>
              检查
            </button>
          </div>
        </div>

        {backupState === 'done' && (
          <div className="mt-3 rounded-2xl bg-teal-50 px-3 py-3 text-center">
            <IllustrationImage src={illustrationAssets.backupSuccess} alt="备份成功" className="mx-auto h-20 w-full max-w-[160px]" />
            <p className="mt-2 text-[13px] font-medium text-teal-600">已完成一次备份。</p>
          </div>
        )}
        {backupState === 'failed' && (
          <div className="mt-3 rounded-2xl bg-amber-50 px-3 py-3 text-center">
            <IllustrationImage src={illustrationAssets.backupUnavailable} alt="备份不可用" className="mx-auto h-20 w-full max-w-[160px]" />
            <p className="mt-2 text-[13px] font-medium text-amber-600">当前没有连上家庭 NAS，请恢复局域网连接后再试。</p>
          </div>
        )}
        {storageMessage && <p className="mt-3 break-words text-[12px] leading-relaxed text-muted">{storageMessage}</p>}
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-teal-50 px-3 py-3 text-[12px] leading-relaxed text-teal-700">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" />
          <span>定期备份可以防止意外丢失，建议每天或每周备份一次。</span>
        </div>
      </section>

      <SectionTitle>导出</SectionTitle>
      <section className="soft-card divide-y divide-line">
        <SettingsRow title="导出 JSON" desc="导出所有记录为 JSON 文件" icon={FileText} action="导出" onClick={exportJson} />
        <SettingsRow title="导出 Markdown" desc="导出所有记录为 Markdown 文件" icon={FileText} action="导出" onClick={exportMarkdown} />
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
      <section className="soft-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-ink">当前记录人</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">新建记录默认归到当前成员名下</p>
          </div>
          <UserRound className="shrink-0 text-teal-600" size={24} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {members.map((member) => (
            <button
              className={`rounded-2xl border px-3 py-2 text-left ${currentMemberId === member.id ? member.colorClass : 'border-line bg-white text-muted'}`}
              key={member.id}
              type="button"
              onClick={() => onSwitchMember(member.id)}
            >
              <span className="inline-flex min-w-0 items-center gap-2 text-[13px] font-medium">
                <AvatarMark src={member.avatarImage} label={member.name} className="h-6 w-6" />
                <span className="truncate">{member.name}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-muted">当前默认成员固定为“我”和“爱人”；改名、头像和颜色编辑以后再做。</p>
        <button className="mt-3 flex h-10 w-full items-center justify-between rounded-2xl border border-line bg-white px-3 text-left text-[13px] font-medium text-teal-700" type="button" onClick={onOpenMembers}>
          成员管理
          <ChevronRight size={17} />
        </button>
      </section>

      <div className="mt-5 rounded-2xl border border-orange-200 bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-[#a35b00]">
        所有数据仅保存在家庭 NAS 或局域网服务器中，家事记不会上传任何内容。
      </div>
    </>
  );
}
function SearchPill({ placeholder, onClick }) {
  return (
    <button className="mt-6 flex h-[58px] w-full items-center gap-4 rounded-[20px] bg-[#f4f3ef] px-5 text-left text-[20px] text-[#8b8e94] shadow-card" type="button" onClick={onClick}>
      <Search size={20} className="text-[#777b82]" />
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

function CategoryFilters({ categories, active, onChange }) {
  const options = [{ id: 'all', name: '全部分类' }, ...categories.slice(0, 8)];

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

function TodayCard({ onCreateNote }) {
  return (
    <button className="soft-card mt-4 flex w-full items-center justify-between bg-teal-50/60 p-4 text-left transition active:scale-[0.99]" type="button" aria-label="快速记录" onClick={onCreateNote}>
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <CalendarDays className="text-teal-600" size={30} />
        <div className="min-w-0">
          <h2 className="text-[21px] font-bold text-teal-600">今天要记</h2>
          <p className="mt-1 truncate text-[12px] text-muted">随手记一条，闪念不丢失</p>
        </div>
      </div>
      <div className="h-12 w-px shrink-0 bg-line" />
      <div className="flex shrink-0 items-center gap-2 text-[16px] font-semibold text-teal-600"><FileText size={22} /> 快速记录</div>
    </button>
  );
}

function RecordCard({ note, onClick }) {
  const Icon = note.icon;
  const CategoryIcon = note.categoryIcon;
  return (
    <article className="soft-card p-4" onClick={onClick}>
      <div className="flex gap-3">
        <div className={`circle-icon bg-white ${note.iconTone}`}><CategoryMark src={note.categoryImageSrc || categoryImageAssets[note.categoryId]} fallback={Icon} label={note.category} className="h-[34px] w-[34px]" iconSize={18} /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 text-[14px] font-semibold leading-[20px] text-ink" style={{ overflowWrap: 'anywhere' }}>{note.title}</h3>
            <MoreHorizontal size={18} className="shrink-0 text-ink" />
          </div>
          <p className="record-summary mt-1 text-[12px] leading-5 text-muted">{note.summary}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {note.tags.map((tag) => <span className={`tag ${tag.tone}`} key={tag.label}>{tag.label}</span>)}
          </div>
          <div className="mt-2 border-t border-line pt-2 text-[11px] text-muted">
            <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
              <span className="inline-flex items-center gap-1.5"><Clock3 size={13} /> {note.time}</span>
              <span className={`inline-flex min-w-0 items-center gap-1.5 font-medium ${note.categoryColor}`}><CategoryMark src={note.categoryImageSrc || categoryImageAssets[note.categoryId]} fallback={CategoryIcon} label={note.category} className="h-[14px] w-[14px]" iconSize={13} /> <span className="truncate">{note.category}</span></span>
              <span className="inline-flex items-center gap-1.5"><Paperclip size={13} /> {note.attachmentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function TopBar({ title, onBack, action, onAction }) {
  return (
    <header className="grid h-12 grid-cols-[40px_minmax(0,1fr)_56px] items-center border-b border-line bg-white -mx-4 px-4">
      <button className="text-ink" onClick={onBack} type="button" aria-label="返回"><ArrowLeft size={22} /></button>
      <h1 className="truncate text-center text-[15px] font-semibold">{title}</h1>
      <button className="text-right text-[14px] font-medium text-teal-600" type="button" onClick={onAction}>{action}</button>
    </header>
  );
}

function FilterRow({ title, options, active, onChange, labels = {} }) {
  return (
    <div className="grid grid-cols-[56px_1fr] gap-2 py-2.5 first:pt-0 last:pb-0">
      <span className="pt-1.5 text-[12px] text-muted">{title}</span>
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
    <section className="mt-4 rounded-2xl border border-dashed border-line bg-white/70 p-5 text-center">
      {image ? <IllustrationImage src={image} alt={title} /> : <Search className="mx-auto text-muted" size={42} />}
      <p className="mt-3 text-[14px] font-medium">{title}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-muted">{desc}</p>
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
    <section className="mt-5 flex items-center justify-between">
      <h2 className="text-[14px] font-semibold">{title}</h2>
      <span className="inline-flex items-center gap-1 text-[12px] text-muted">{trailing}</span>
    </section>
  );
}

function SectionTitle({ children }) {
  return <h2 className="mb-3 mt-5 text-[17px] font-bold">{children}</h2>;
}

function SettingsRow({ title, desc, icon: Icon, action, disabled = false, onClick }) {
  return (
    <button
      className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left ${disabled ? 'opacity-55' : ''}`}
      onClick={onClick}
      type="button"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Icon size={19} /></div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold leading-snug text-ink">{title}</p>
          <p className="mt-0.5 break-words text-[12px] leading-relaxed text-muted">{desc}</p>
        </div>
      </div>
      {action === '>' ? <ChevronRight className="shrink-0 text-muted" size={17} /> : <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-[12px] font-medium text-teal-700">{action}</span>}
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
            <Icon size={22} strokeWidth={isActive ? 2.7 : 2.2} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

createRoot(document.getElementById('root')).render(<App />);
