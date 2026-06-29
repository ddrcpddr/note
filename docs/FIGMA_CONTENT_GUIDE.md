# Figma Content Guide

## 1. Voice

The app should sound like a calm family helper.

Tone:

- Warm.
- Clear.
- Practical.
- Non-technical unless needed.
- Reassuring around backup and import.

Avoid:

- Enterprise terms.
- Admin-console language.
- Alarmist warnings.
- Overly cute marketing copy.

## 2. Privacy Rules

All Figma copy must be desensitized.

Never use:

- Real imported Note Station titles.
- Real note body.
- Real NAS address.
- Real user account names.
- Passwords, tokens, API keys.
- Real family names, phone numbers, addresses, ID numbers, invoices, medical details.

## 3. Safe Example Members

Use the current-user perspective:

- 我
- 老婆
- 孩子
- 父母
- 老人/岳父母
- 宠物
- 其他

These are defaults for design, not hard-coded permanent identities. The UI must support custom names, avatars, and colors.

Do not use “爸爸/妈妈” as fixed member names in the design system.

## 4. Safe Example Notes

Allowed example titles:

- 周末整理阳台工具箱
- 路由器贴标签和重启记录
- 洗衣机滤网清理
- 宠物疫苗提醒
- 家电保修卡放置位置
- 旧笔记导入后待整理
- 给老人测量血压的提醒
- 孩子兴趣班缴费记录

Allowed example body text:

- “这条记录用于展示家庭事项，不包含真实隐私内容。”
- “导入的历史记录可以先放在未分类，之后慢慢整理。”
- “备份完成后，数据会多一份安心。”

## 5. Navigation Labels

Use:

- 首页
- 分类
- 搜索
- 设置

Settings sections:

- 家庭成员
- 数据保存
- 备份与导出
- Note Station 导入
- 关于本机数据

## 6. State Copy

### Empty Home

Title: “还没有记录”

Body: “先写下一件家里的小事，之后查找会轻松很多。”

Action: “新建记录”

### Search No Result

Title: “没有找到相关记录”

Body: “换个关键词，或者试试分类、成员筛选。”

### Import Success

Title: “历史记录已导入”

Body: “导入的记录先放在未分类，之后可以慢慢整理。”

### Import Failure

Title: “有些记录需要再看看”

Body: “失败项已经保留，不会静默丢失。”

### Backup Success

Title: “备份完成”

Body: “数据库已经复制到备份目录。”

### Backup Failure

Title: “暂时无法备份”

Body: “请确认家庭记录服务或 NAS 目录可访问。”

### JSON Export Success

Title: “导出完成”

Body: “JSON 文件已保存到导出目录。”

## 7. Metadata Labels

Use human labels:

- 创建人
- 当前成员
- 分类
- 标签
- 来源
- 附件
- 原始路径
- 原始分类
- 创建时间
- 更新时间

For imported records:

- Source label: “Note Station 导入”
- Category fallback: “未分类 / 待整理”

## 8. Path Placeholders

Allowed placeholders:

- `data/database/app.db`
- `data/attachments/`
- `data/backups/`
- `data/exports/`
- `data/imports/notestation/`

Do not use real full local paths or real NAS addresses.
