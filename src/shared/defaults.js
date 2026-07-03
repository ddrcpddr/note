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
  { id: 'self', name: '我', avatar: '我', color: 'teal', sortOrder: 10, isCurrent: true },
  { id: 'partner', name: '爱人', avatar: '爱', color: 'rose', sortOrder: 20, isCurrent: false }
];

export const defaultTags = ['待办', '重要', '维修', '购物', '账单', '发票', '保修', 'NAS', '物业', '医院'];

export const seedNotes = [];
