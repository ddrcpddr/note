export const notestationSampleRecords = [
  {
    originalId: 'ns-001',
    originalTitle: '宽带续费记录',
    originalPath: '/家庭/账单/宽带续费记录',
    originalCategory: '账单',
    originalCreatedAt: '2025-06-15 09:10:00',
    originalUpdatedAt: '2025-06-15 09:20:00',
    title: '宽带续费记录',
    content: '中国移动宽带，300M 套餐，费用 120 元/月，下次续费时间 2025-06-15。',
    categoryId: 'house',
    tags: ['账单', '物业']
  },
  {
    originalId: 'ns-002',
    originalTitle: '洗衣机维修',
    originalPath: '/家庭/维修/洗衣机维修',
    originalCategory: '维修',
    originalCreatedAt: '2025-05-21 14:30:00',
    originalUpdatedAt: '2025-05-21 16:00:00',
    title: '洗衣机维修',
    content: '海尔洗衣机服务，已更换排水泵，保修期 3 个月。',
    categoryId: 'repair',
    tags: ['维修', '保修']
  },
  {
    originalId: 'ns-003',
    originalTitle: '孩子疫苗提醒',
    originalPath: '/家庭/孩子/疫苗提醒',
    originalCategory: '孩子教育',
    originalCreatedAt: '2025-05-01 08:00:00',
    originalUpdatedAt: '2025-05-01 08:00:00',
    title: '孩子疫苗提醒',
    content: '下次接种时间 2025-06-01，已完成第 2 针。',
    categoryId: 'kids',
    tags: ['医院', '重要']
  }
];

export const notestationSampleFailures = [
  {
    originalTitle: '空白旧笔记',
    originalPath: '/未整理/空白旧笔记',
    errorMessage: '样例记录缺少正文，已写入失败列表等待人工处理。'
  }
];
