import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertCircle,
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
  FileArchive,
  FileText,
  Folder,
  Grid2X2,
  HeartPulse,
  Home,
  Inbox,
  KeyRound,
  Lightbulb,
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
  Upload,
  UserRound,
  Wrench,
  X
} from 'lucide-react';
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
  { id: 'family', name: '家庭事务', count: 128, update: '今天 10:42 更新', icon: Home, tone: 'bg-teal-50 text-teal-700' },
  { id: 'house', name: '房屋 / 设备', count: 86, update: '昨天 18:35 更新', icon: Home, tone: 'bg-blue-50 text-blue-700' },
  { id: 'repair', name: '维修 / 售后', count: 64, update: '昨天 09:21 更新', icon: Wrench, tone: 'bg-amber-50 text-amber-500' },
  { id: 'shopping', name: '购物 / 消费', count: 102, update: '今天 08:20 更新', icon: ShoppingBag, tone: 'bg-green-50 text-green-700' },
  { id: 'account', name: '证件 / 账号', count: 57, update: '5月18日 16:30 更新', icon: KeyRound, tone: 'bg-purple-50 text-purple-700' },
  { id: 'kids', name: '孩子 / 教育', count: 41, update: '5月17日 21:10 更新', icon: Star, tone: 'bg-amber-50 text-amber-600' },
  { id: 'health', name: '老人 / 健康', count: 33, update: '5月16日 19:05 更新', icon: HeartPulse, tone: 'bg-rose-50 text-rose-500' },
  { id: 'pet', name: '宠物', count: 28, update: '5月15日 17:20 更新', icon: PawPrint, tone: 'bg-green-50 text-green-700' },
  { id: 'work', name: '工作 / 杂事', count: 25, update: '5月14日 14:12 更新', icon: Briefcase, tone: 'bg-blue-50 text-blue-700' },
  { id: 'temporary', name: '临时记录', count: 19, update: '今天 09:15 更新', icon: FileText, tone: 'bg-purple-50 text-purple-600' },
  { id: 'uncategorized', name: '未分类', count: 14, update: '5月12日 11:02 更新', icon: Inbox, tone: 'bg-neutral-100 text-neutral-600' }
];

const notes = [
  {
    id: 'leak',
    title: '下午联系师傅看漏水',
    summary: '主卧卫生间天花板有渗水，联系王师傅下午 3 点上门查看。',
    content:
      '主卧卫生间天花板有渗水，联系王师傅下午 3 点上门查看。需要拍照留存，顺便问一下厨房水龙头是否也能一起检查。物业说如果确认是楼上管线问题，需要再联系楼上邻居一起处理。',
    category: '家庭事务',
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
    member: '爸爸',
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
    category: '购物',
    categoryIcon: ShoppingBag,
    categoryColor: 'text-teal-600',
    icon: ShoppingBag,
    iconTone: 'bg-green-50 text-green-600',
    tags: [
      { label: '购物', tone: tagTones.shopping },
      { label: '重要', tone: tagTones.important }
    ],
    time: '昨天 18:35',
    member: '妈妈',
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
    category: '导入',
    categoryIcon: Folder,
    categoryColor: 'text-teal-600',
    icon: Download,
    iconTone: 'bg-purple-50 text-purple-600',
    tags: [{ label: '待办', tone: tagTones.todo }],
    time: '昨天 09:21',
    member: '历史导入',
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
  const [screen, setScreen] = useState('home');
  const [selectedId, setSelectedId] = useState('leak');
  const selectedNote = useMemo(() => notes.find((note) => note.id === selectedId) ?? notes[0], [selectedId]);

  function openDetail(id) {
    setSelectedId(id);
    setScreen('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigate(nextScreen) {
    setScreen(nextScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className="mobile-shell">
      {screen === 'home' && <HomeScreen onOpenDetail={openDetail} />}
      {screen === 'new' && <NewRecordScreen onBack={() => navigate('home')} />}
      {screen === 'detail' && <DetailScreen note={selectedNote} onBack={() => navigate('home')} />}
      {screen === 'search' && <SearchScreen onOpenDetail={openDetail} />}
      {screen === 'categories' && <CategoriesScreen />}
      {screen === 'import' && <ImportScreen onBack={() => navigate('settings')} />}
      {screen === 'settings' && <SettingsScreen onOpenImport={() => navigate('import')} />}

      {(screen === 'home' || screen === 'categories') && (
        <button
          className="fixed bottom-[102px] right-[max(24px,calc((100vw-430px)/2+24px))] z-40 grid h-[74px] w-[74px] place-items-center rounded-full bg-teal-600 text-white shadow-float"
          type="button"
          aria-label="新建记录"
          onClick={() => navigate('new')}
        >
          <Plus size={36} strokeWidth={2.6} />
        </button>
      )}

      {!['detail', 'new', 'import'].includes(screen) && <BottomNav active={screen} onChange={navigate} />}
    </main>
  );
}

function HomeScreen({ onOpenDetail }) {
  return (
    <>
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[42px] font-bold leading-none tracking-wide text-teal-600">家事记</h1>
            <Home className="mt-1 text-teal-600" size={34} strokeWidth={2.2} />
          </div>
          <p className="mt-2 text-[17px] text-muted">记录家里的大小事</p>
        </div>
        <div className="flex gap-3 pt-2 text-teal-700">
          <Clock3 size={28} />
          <MoreHorizontal size={28} className="text-ink" />
        </div>
      </header>
      <SearchPill placeholder="搜索记录、标签或内容" />
      <QuickFilters />
      <MemberFilters />
      <TodayCard />
      <SectionHeader title="最新记录" trailing={<><RotateCw size={18} /> 刚刚更新</>} />
      <section className="mt-3 space-y-4">
        {notes.map((note) => (
          <RecordCard key={note.id} note={note} onClick={() => onOpenDetail(note.id)} />
        ))}
      </section>
    </>
  );
}

function NewRecordScreen({ onBack }) {
  return (
    <>
      <TopBar title="新记录" onBack={onBack} action="保存" />
      <section className="soft-card mt-6 flex h-[58px] items-center gap-4 px-5 text-[20px] text-muted">
        <span className="text-[30px]">T</span>
        标题（可选）
      </section>
      <section className="soft-card mt-4 min-h-[220px] p-5">
        <div className="flex gap-4 text-[18px] text-muted">
          <FileText className="mt-1 shrink-0" size={25} />
          <p>写下家里的小事、账单、维修、临时备忘...</p>
        </div>
        <div className="mt-32 text-right text-[16px] text-muted">0/1000</div>
      </section>
      <SectionTitle>记录类型</SectionTitle>
      <section className="grid grid-cols-2 gap-3">
        {recordTypes.map((type, index) => {
          const Icon = type.icon;
          return (
            <button
              className={`soft-card flex h-[92px] flex-col items-center justify-center gap-2 text-[17px] ${
                index === 0 ? 'border-teal-600 bg-teal-50 text-teal-700' : 'text-ink'
              }`}
              key={type.label}
              type="button"
            >
              <Icon size={29} strokeWidth={2.1} />
              {type.label}
            </button>
          );
        })}
      </section>
      <SectionTitle>标签</SectionTitle>
      <section className="soft-card flex flex-wrap gap-3 p-4">
        {[
          ['待办', tagTones.todo],
          ['重要', tagTones.important],
          ['维修', tagTones.repair]
        ].map(([label, tone]) => (
          <span className={`tag ${tone}`} key={label}>
            {label} <X className="ml-1" size={14} />
          </span>
        ))}
        <span className="inline-flex items-center rounded-xl border border-dashed border-line px-3 py-1.5 text-[16px] text-muted">
          <Plus size={17} /> 添加标签
        </span>
      </section>
      <SectionTitle>附件</SectionTitle>
      <section className="soft-card flex h-[72px] items-center justify-between px-5">
        <span className="inline-flex items-center gap-4 text-[18px] text-muted">
          <Paperclip className="text-teal-600" size={28} /> 添加照片 / 文件
        </span>
        <ChevronRight className="text-muted" />
      </section>
      <div className="fixed bottom-0 left-1/2 z-30 flex h-[104px] w-full max-w-[430px] -translate-x-1/2 items-center gap-4 border-t border-line bg-white/95 px-5 pb-5 pt-4">
        <button className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl text-[18px] font-medium text-teal-600" type="button">
          <FileText size={22} /> 存为模板
        </button>
        <button className="flex h-14 flex-[1.6] items-center justify-center gap-2 rounded-2xl bg-teal-600 text-[19px] font-semibold text-white shadow-float" type="button">
          <Check size={24} /> 保存记录
        </button>
      </div>
    </>
  );
}

function SearchScreen({ onOpenDetail }) {
  return (
    <>
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[42px] font-bold leading-none tracking-wide text-[#093f3e]">搜索</h1>
          <p className="mt-3 text-[18px] text-muted">快速找到你需要的记录</p>
        </div>
        <button className="chip mt-3">
          <Clock3 size={19} /> 搜索历史
        </button>
      </header>
      <section className="soft-card mt-6 flex h-[68px] items-center gap-4 px-5">
        <Search size={31} className="text-muted" />
        <span className="flex-1 text-[22px] font-medium">漏水</span>
        <X size={23} className="text-muted" />
        <span className="h-8 w-px bg-line" />
        <span className="text-[18px] font-medium text-teal-600">搜索</span>
      </section>
      <section className="soft-card mt-5 divide-y divide-line p-4">
        <FilterRow title="分类" options={['全部', '家庭事务', '维修', '账单']} active="全部" />
        <FilterRow title="标签" options={['全部', '待办', '重要', '有附件']} active="待办" />
        <FilterRow title="成员" options={['全部成员', '爸爸', '妈妈']} active="全部成员" />
        <FilterRow title="时间范围" options={['全部时间', '本月', '今年']} active="全部时间" />
      </section>
      <SectionHeader title="找到 3 条相关记录" trailing="清除筛选" />
      <section className="mt-3 space-y-4">
        {notes.map((note) => (
          <RecordCard key={note.id} note={note} onClick={() => onOpenDetail(note.id)} />
        ))}
      </section>
      <section className="mt-5 rounded-[22px] border border-dashed border-line bg-white/70 p-5 text-center">
        <Search className="mx-auto text-muted" size={42} />
        <p className="mt-3 text-[17px] font-medium">没有找到时，可以换个关键词试试</p>
        <p className="mt-1 text-[15px] text-muted">例如：渗水、防水、卫生间、阳台、楼上等</p>
      </section>
    </>
  );
}

function CategoriesScreen() {
  return (
    <>
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[42px] font-bold leading-none tracking-wide text-[#093f3e]">分类</h1>
          <p className="mt-3 text-[18px] text-muted">按家里的事情慢慢整理</p>
        </div>
        <button className="grid h-14 w-14 place-items-center rounded-full bg-white text-teal-600 shadow-card">
          <Grid2X2 size={28} />
        </button>
      </header>
      <SearchPill placeholder="搜索分类" />
      <section className="mt-6 space-y-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <article className="soft-card flex min-h-[104px] items-center gap-4 p-4" key={category.id}>
              <div className={`circle-icon h-16 w-16 ${category.tone}`}>
                <Icon size={34} strokeWidth={2.1} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[20px] font-bold leading-tight">{category.name}</h2>
                <p className="mt-2 text-[15px] font-medium text-teal-600">{category.count} 条记录</p>
                <p className="mt-1 text-[13px] text-muted">{category.update}</p>
              </div>
              <ChevronRight className="shrink-0 text-muted" size={18} />
            </article>
          );
        })}
      </section>
    </>
  );
}

function ImportScreen({ onBack }) {
  return (
    <>
      <TopBar title="导入 Note Station" onBack={onBack} />
      <section className="mt-7 flex items-start justify-between gap-1">
        {[
          ['1', '上传导出文件'],
          ['2', '解析预览'],
          ['3', '确认导入'],
          ['4', '导入完成']
        ].map(([num, label], index) => (
          <div className="flex min-w-0 flex-1 flex-col items-center gap-3 text-center" key={num}>
            <div className={`grid h-12 w-12 place-items-center rounded-full border text-[20px] ${index === 1 ? 'border-teal-600 bg-teal-600 text-white' : 'border-line bg-white text-muted'}`}>
              {num}
            </div>
            <p className={index <= 1 ? 'text-[13px] leading-tight text-teal-600' : 'text-[13px] leading-tight text-muted'}>{label}</p>
          </div>
        ))}
      </section>
      <section className="soft-card mt-7 p-5">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-16 shrink-0 place-items-center rounded-xl bg-teal-600 text-[22px] font-bold text-white">
            ZIP
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[22px] font-bold">notestation_export.zip</h2>
            <p className="mt-1 text-[16px] text-muted">2.4 MB · 2025-05-18 20:11</p>
          </div>
        </div>
        <span className="mt-4 inline-flex items-center gap-2 text-[17px] font-medium text-teal-600">
          <CheckCircle2 size={22} /> 已解析
        </span>
      </section>
      <section className="soft-card mt-4 p-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            ['记录', '1,284 条', FileText, 'text-teal-600'],
            ['分类', '12 个', Folder, 'text-blue-600'],
            ['附件', '386 个', Paperclip, 'text-teal-600'],
            ['失败项', '3 个', AlertCircle, 'text-amber-500']
          ].map(([label, value, Icon, tone]) => (
            <div className="rounded-2xl bg-soft p-3 text-center" key={label}>
              <Icon className={`mx-auto ${tone}`} size={28} />
              <p className="mt-2 text-[15px] text-muted">{label}</p>
              <p className="mt-1 text-[18px] font-bold">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-teal-50 px-4 py-3 text-[16px] text-teal-700">
          <ShieldCheck className="mt-0.5 shrink-0" size={21} /> <span>导入前不会修改现有记录，可先预览再确认</span>
        </div>
      </section>
      <section className="soft-card mt-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold">预览记录（最新 3 条）</h2>
          <span className="text-[16px] text-teal-600">查看全部</span>
        </div>
        {[
          ['宽带续费记录', '中国移动宽带，300M 套餐，费用 120 元/月，下次续费时间 2025-06-15。', '账单'],
          ['洗衣机维修', '海尔洗衣机服务，已更换排水泵，保修期 3 个月。', '维修'],
          ['孩子疫苗提醒', '下次接种时间 2025-06-01，已完成第 2 针。', '孩子教育']
        ].map(([title, desc, tag]) => (
          <div className="mt-4 flex gap-3 border-t border-line pt-4" key={title}>
            <div className="circle-icon bg-teal-50 text-teal-600">
              <FileText size={28} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[18px] font-bold">{title}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-muted">{desc}</p>
            </div>
            <span className="tag h-fit shrink-0 bg-teal-50 text-teal-600">{tag}</span>
          </div>
        ))}
      </section>
      <section className="soft-card mt-4 p-5">
        <h2 className="text-[20px] font-bold">检测到的分类</h2>
        <div className="scroll-row mt-4 flex gap-2">
          {['账单 256', '维修 142', '孩子教育 98', '证件 76'].map((label) => (
            <span className="chip" key={label}>{label}</span>
          ))}
        </div>
        <p className="mt-4 text-[15px] text-muted">分类将自动合并到现有同名分类中，不会创建重复分类。</p>
      </section>
      <div className="fixed bottom-0 left-1/2 z-30 grid h-[96px] w-full max-w-[430px] -translate-x-1/2 grid-cols-2 gap-4 border-t border-line bg-white/95 px-5 pb-5 pt-4">
        <button className="rounded-2xl border border-teal-600 text-[18px] font-medium text-teal-600" type="button">
          重新选择文件
        </button>
        <button className="rounded-2xl bg-teal-600 text-[18px] font-semibold text-white shadow-float" type="button">
          确认导入
        </button>
      </div>
    </>
  );
}

function DetailScreen({ note, onBack }) {
  const Icon = note.icon;
  const CategoryIcon = note.categoryIcon;
  return (
    <>
      <TopBar title="记录详情" onBack={onBack} action="编辑" />
      <section className="soft-card mt-7 p-5">
        <div className="flex gap-4">
          <div className={`circle-icon h-20 w-20 ${note.iconTone}`}>
            <Icon size={44} strokeWidth={2.1} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between gap-2">
              <h2 className="text-[28px] font-bold leading-tight">{note.title}</h2>
              <span className="text-[28px] text-muted">☆</span>
            </div>
            <div className={`mt-3 flex items-center gap-2 text-[18px] font-medium ${note.categoryColor}`}>
              <CategoryIcon size={23} /> {note.category} <ChevronRight size={18} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span className={`tag ${tag.tone}`} key={tag.label}>{tag.label}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-4 border-t border-line pt-5 text-[17px] text-muted">
          <MetaRow icon={CalendarDays} label="创建" value={note.createdAt} />
          <MetaRow icon={Clock3} label="更新" value={note.updatedAt} />
          <MetaRow icon={UserRound} label="创建人" value={note.member} />
          <MetaRow icon={FileText} label="来源" value={note.source} />
          <MetaRow icon={Cloud} label="状态" value={note.status} emphasize />
        </div>
      </section>
      <section className="soft-card mt-4 p-5">
        <h2 className="flex items-center gap-3 text-[22px] font-bold text-teal-600"><Tags size={24} /> 内容</h2>
        <p className="mt-5 text-[20px] leading-[1.85]">{note.content}</p>
      </section>
      <section className="soft-card mt-4 p-5">
        <h2 className="flex items-center gap-3 text-[22px] font-bold text-teal-600"><Paperclip size={25} /> 附件（{note.attachments.length}）</h2>
        <div className="mt-4 space-y-3">
          {note.attachments.map((name) => (
            <div className="flex items-center justify-between rounded-2xl border border-line p-3" key={name}>
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-teal-50 text-teal-600"><FileText size={29} /></div>
                <div>
                  <p className="text-[17px] font-medium">{name}</p>
                  <p className="mt-1 text-[14px] text-muted">保存在 NAS 附件目录</p>
                </div>
              </div>
              <Download className="text-teal-600" size={24} />
            </div>
          ))}
        </div>
      </section>
      <section className="soft-card mt-4 p-5">
        <h2 className="text-[22px] font-bold text-teal-600">关联记录</h2>
        <RelatedRow title="去年卫生间防水维修" meta="维修 · 已完成" />
        <RelatedRow title="物业维修电话" meta="家庭事务 · 联系方式" />
      </section>
      <div className="fixed bottom-0 left-1/2 z-30 flex h-[86px] w-full max-w-[430px] -translate-x-1/2 items-center justify-between border-t border-line bg-white/95 px-9 pb-4 pt-3">
        <button className="flex flex-col items-center gap-1 text-muted" type="button"><MoreHorizontal size={28} /><span className="text-[13px]">更多</span></button>
        <button className="inline-flex h-14 items-center gap-3 rounded-2xl bg-teal-600 px-8 text-[20px] font-semibold text-white shadow-float"><Share2 size={25} /> 分享记录</button>
      </div>
    </>
  );
}

function SettingsScreen({ onOpenImport }) {
  return (
    <>
      <header className="relative min-h-[160px]">
        <div>
          <h1 className="text-[42px] font-bold leading-none tracking-wide text-[#093f3e]">设置</h1>
          <p className="mt-3 text-[18px] text-muted">数据在自己手里更安心 <span className="text-[#ff8a4d]">♥</span></p>
        </div>
        <div className="absolute right-0 top-0 h-28 w-36">
          <div className="absolute bottom-0 left-4 h-14 w-16 rounded-[50%] bg-[#e9dfcf]" />
          <div className="absolute bottom-9 left-12 h-16 w-1 rounded-full bg-[#9aaa76]" />
          <div className="absolute bottom-16 left-9 h-4 w-8 rotate-[-28deg] rounded-full bg-[#9aaa76]" />
          <div className="absolute bottom-20 left-14 h-4 w-8 rotate-[22deg] rounded-full bg-[#9aaa76]" />
          <div className="absolute right-0 top-8 h-16 w-14 rounded-sm border-[6px] border-[#d6a979] bg-[#f7f0e2]" />
        </div>
      </header>
      <SectionTitle>NAS 存储与备份</SectionTitle>
      <section className="soft-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="circle-icon bg-teal-50 text-teal-600"><Cloud size={35} /></div>
            <div>
              <p className="text-[22px] font-semibold">上次备份：今天 09:30</p>
              <p className="mt-1 flex items-center gap-2 text-[16px] text-muted">NAS 在线，数据安全 <CheckCircle2 size={18} className="text-teal-600" /></p>
            </div>
          </div>
          <button className="rounded-2xl bg-teal-600 px-5 py-3 text-[18px] font-semibold text-white shadow-card">立即备份</button>
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-teal-50 px-4 py-3 text-[15px] text-teal-700">
          <ShieldCheck size={20} className="shrink-0" />
          <span>所有记录集中保存在家庭 NAS，建议每天或每周备份一次。</span>
        </div>
      </section>
      <SectionTitle>导出</SectionTitle>
      <section className="soft-card divide-y divide-line">
        <SettingsRow title="导出 JSON" desc="导出所有记录为 JSON 文件" icon={FileText} action=">" />
        <SettingsRow title="导出 Markdown" desc="导出所有记录为 Markdown 文件" icon={FileText} action="后续功能" disabled />
      </section>
      <SectionTitle>附件目录</SectionTitle>
      <section className="soft-card">
        <SettingsRow title="附件目录" desc="/data/attachments/" icon={Folder} action=">" />
      </section>
      <SectionTitle>数据库位置</SectionTitle>
      <section className="soft-card divide-y divide-line">
        <SettingsRow title="数据库位置" desc="/data/database/app.db" icon={Database} action=">" />
        <SettingsRow title="导入 Note Station" desc="导入旧记录并保留来源信息" icon={FileText} action=">" onClick={onOpenImport} />
      </section>
      <div className="mt-6 rounded-2xl border border-orange-200 bg-amber-50 px-4 py-3 text-[15px] leading-relaxed text-[#a35b00]">
        所有数据仅保存在家庭 NAS 或局域网服务器中，家事记不会上传任何内容。
      </div>
    </>
  );
}

function SearchPill({ placeholder }) {
  return (
    <button className="mt-7 flex h-[64px] w-full items-center gap-4 rounded-[22px] bg-[#f1f2f0] px-5 text-left text-[22px] text-[#8b8e94] shadow-card">
      <Search size={30} className="text-[#777b82]" />
      <span className="min-w-0 flex-1 truncate">{placeholder}</span>
    </button>
  );
}

function QuickFilters() {
  return (
    <section className="scroll-row mt-6 flex gap-3 pb-1">
      <span className="chip chip-active"><Tags size={19} /> 全部</span>
      <span className="chip"><Clock3 size={19} className="text-amber-500" /> 待办</span>
      <span className="chip"><span className="text-amber-500">☆</span> 重要</span>
      <span className="chip"><Paperclip size={19} className="text-teal-600" /> 有附件</span>
    </section>
  );
}

function MemberFilters() {
  return (
    <section className="scroll-row mt-4 flex gap-2 pb-1">
      {['全部成员', '爸爸', '妈妈', '历史导入'].map((member, index) => (
        <span
          key={member}
          className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-[14px] ${
            index === 0 ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-line bg-white text-muted'
          }`}
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-100 text-[12px] text-teal-700">{member.slice(0, 1)}</span>
          {member}
        </span>
      ))}
    </section>
  );
}

function TodayCard() {
  return (
    <section className="soft-card mt-5 flex items-center justify-between bg-teal-50/60 p-5">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <CalendarDays className="text-teal-600" size={34} />
        <div className="min-w-0">
          <h2 className="text-[23px] font-bold text-teal-600">今天要记</h2>
          <p className="mt-1 truncate text-[16px] text-muted">随手记一条，闪念不丢失</p>
        </div>
      </div>
      <div className="h-12 w-px shrink-0 bg-line" />
      <div className="flex shrink-0 items-center gap-2 text-[17px] font-semibold text-teal-600"><FileText size={24} /> 快速记录</div>
    </section>
  );
}

function RecordCard({ note, onClick }) {
  const Icon = note.icon;
  const CategoryIcon = note.categoryIcon;
  return (
    <article className="soft-card p-4" onClick={onClick}>
      <div className="flex gap-4">
        <div className={`circle-icon ${note.iconTone}`}><Icon size={32} strokeWidth={2.2} /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[23px] font-bold leading-snug">{note.title}</h3>
            <MoreHorizontal size={22} className="shrink-0 text-ink" />
          </div>
          <p className="mt-2 text-[17px] leading-relaxed text-muted">{note.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {note.tags.map((tag) => <span className={`tag ${tag.tone}`} key={tag.label}>{tag.label}</span>)}
          </div>
          <div className="mt-4 border-t border-line pt-3 text-[15px] text-muted">
            <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
              <span className="inline-flex items-center gap-1.5"><Clock3 size={17} /> {note.time}</span>
              <span className={`inline-flex min-w-0 items-center gap-1.5 font-medium ${note.categoryColor}`}><CategoryIcon className="shrink-0" size={18} /> <span className="truncate">{note.category}</span></span>
              <span className="inline-flex items-center gap-1.5"><Paperclip size={17} /> {note.attachmentCount}</span>
            </div>
            <div className="mt-2 grid grid-cols-[auto_1fr] items-center gap-3">
              <span className="inline-flex items-center gap-1.5"><UserRound size={16} /> {note.member}</span>
              <span className="inline-flex min-w-0 items-center justify-end gap-1.5 text-teal-600"><CheckCircle2 className="shrink-0" size={16} /> <span className="truncate">{note.status}</span></span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function TopBar({ title, onBack, action }) {
  return (
    <header className="grid grid-cols-[44px_minmax(0,1fr)_64px] items-center">
      <button className="text-ink" onClick={onBack} type="button" aria-label="返回"><ArrowLeft size={34} /></button>
      <h1 className="truncate text-center text-[23px] font-semibold">{title}</h1>
      <button className="text-right text-[18px] font-medium text-teal-600" type="button">{action}</button>
    </header>
  );
}

function FilterRow({ title, options, active }) {
  return (
    <div className="grid grid-cols-[76px_1fr] gap-3 py-3 first:pt-0 last:pb-0">
      <span className="pt-2 text-[17px] font-medium">{title}</span>
      <div className="scroll-row flex gap-2">
        {options.map((option) => (
          <span className={`chip ${option === active ? 'border-teal-600 bg-teal-50 text-teal-700' : ''}`} key={option}>{option}</span>
        ))}
      </div>
    </div>
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
        <p className="text-[18px] font-medium">{title}</p>
        <p className="mt-1 text-[14px] text-muted">{meta}</p>
      </div>
      <ChevronRight className="text-muted" />
    </div>
  );
}

function SectionHeader({ title, trailing }) {
  return (
    <section className="mt-8 flex items-center justify-between">
      <h2 className="text-[19px] font-medium">{title}</h2>
      <span className="inline-flex items-center gap-1 text-[15px] text-muted">{trailing}</span>
    </section>
  );
}

function SectionTitle({ children }) {
  return <h2 className="mb-3 mt-7 text-[22px] font-semibold">{children}</h2>;
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
        <div>
          <p className="text-[20px] font-semibold">{title}</p>
          <p className="mt-1 text-[15px] text-muted">{desc}</p>
        </div>
      </div>
      <span className="text-[15px] text-muted">{action}</span>
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
