export const defaultCategories = [
  { id: 'family', name: '家庭事务', color: '#0f8f80', icon: 'home', sortOrder: 10 },
  { id: 'house', name: '房屋 / 设备', color: '#557c93', icon: 'home', sortOrder: 20 },
  { id: 'repair', name: '维修 / 售后', color: '#d98a13', icon: 'wrench', sortOrder: 30 },
  { id: 'shopping', name: '购物 / 消费', color: '#2fa66a', icon: 'shopping', sortOrder: 40 },
  { id: 'account', name: '证件 / 账号', color: '#7768ae', icon: 'key', sortOrder: 50 },
  { id: 'kids', name: '孩子 / 教育', color: '#c17b9a', icon: 'star', sortOrder: 60 },
  { id: 'health', name: '老人 / 健康', color: '#e14d64', icon: 'heart', sortOrder: 70 },
  { id: 'pet', name: '宠物', color: '#2fa66a', icon: 'paw', sortOrder: 80 },
  { id: 'work', name: '工作 / 杂事', color: '#687083', icon: 'briefcase', sortOrder: 90 },
  { id: 'temporary', name: '临时记录', color: '#9a5fd1', icon: 'file', sortOrder: 100 },
  { id: 'uncategorized', name: '未分类', color: '#747474', icon: 'inbox', sortOrder: 999 }
];

export const noteTypes = [
  { id: 'normal', name: '普通记录' },
  { id: 'family_task', name: '家庭事务' },
  { id: 'maintenance', name: '维修维护' },
  { id: 'shopping', name: '购物消费' },
  { id: 'account', name: '账号资料' },
  { id: 'important', name: '重要备忘' },
  { id: 'idea', name: '临时想法' }
];

export const defaultMembers = [
  { id: 'self', name: '我', avatar: '我', sortOrder: 10, isCurrent: true },
  { id: 'partner', name: '爱人', avatar: '爱', sortOrder: 20, isCurrent: false }
];

export const defaultTags = ['待办', '重要', '维修', '购物', '账单', '发票', '保修', 'NAS', '物业', '医院'];

export const seedNotes = [
  {
    id: 'seed-leak',
    title: '下午联系师傅看漏水',
    content: '主卧卫生间天花板有渗水，联系王师傅下午 3 点上门查看。需要拍照留存，顺便问一下厨房水龙头是否也能一起检查。',
    summary: '主卧卫生间天花板有渗水，联系王师傅下午 3 点上门查看。',
    categoryId: 'family',
    memberId: 'self',
    noteType: 'family_task',
    tags: ['待办', '重要', '维修'],
    attachments: ['卫生间天花板渗水.jpg', '维修记录模板.docx']
  },
  {
    id: 'seed-bp',
    title: '买了老人血压计',
    content: '欧姆龙 J710，上臂式，家里老人用更方便。包装和发票先放在电视柜下面。',
    summary: '欧姆龙 J710，上臂式，家里老人用更方便。',
    categoryId: 'shopping',
    memberId: 'partner',
    noteType: 'shopping',
    tags: ['购物', '重要'],
    attachments: ['电子发票.pdf']
  },
  {
    id: 'seed-imported',
    title: 'Note Station 导入记录待整理',
    content: '从 Note Station 导入的历史记录，需要统一分类和标签。先保留原始路径和来源，稍后慢慢整理。',
    summary: '从 Note Station 导入的历史记录，需要统一分类和标签。',
    categoryId: 'temporary',
    memberId: 'self',
    noteType: 'normal',
    sourceType: 'notestation_import',
    tags: ['待办', 'NAS'],
    attachments: ['notestation_export.zip']
  }
];
