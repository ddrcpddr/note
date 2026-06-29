# Figma Flow Specs

## 1. Prototype Scope

The Figma prototype should show the key family workflows without inventing unimplemented business logic. It should be clickable enough for review, not a full backend simulation.

Do not use real Note Station note content.

## 2. Primary Flows

### 2.1 Browse Home to Detail

Steps:

1. Open Home.
2. View mixed manual and imported records.
3. Tap a record card.
4. Open Detail.
5. Return to Home.

Acceptance:

- Detail shows member, category, source, time, body, and attachments.
- Imported records show Note Station metadata as secondary information.

### 2.2 Create New Record

Steps:

1. Tap floating new button.
2. Enter title and body.
3. Confirm current member.
4. Choose category.
5. Save.
6. Return to Home with a success state.

Acceptance:

- Current member defaults to selected member.
- Member can be switched before saving.
- Save state is warm and reassuring.

### 2.3 Search Records

Steps:

1. Open Search tab.
2. Type safe keyword.
3. Apply member filter.
4. Apply category filter.
5. Open a result.

Acceptance:

- Search works visually for manual and imported records.
- No-result state is included.

### 2.4 Category Filtering

Steps:

1. Open Categories.
2. Tap `未分类 / 待整理`.
3. See imported records filtered.
4. Open detail.

Acceptance:

- Imported Note Station records feel easy to gradually organize.
- UI does not shame or overload the user for having many uncategorized notes.

### 2.5 Member Switching

Steps:

1. Open Settings.
2. Open Member Management.
3. Set a member as current.
4. Return to New Record.
5. New Record shows selected current member by default.

Acceptance:

- Member names are customizable.
- Avatar and color are visible.
- No fixed “爸爸/妈妈” product assumptions.

### 2.6 Edit Member Profile

Steps:

1. Open Member Management.
2. Select member row.
3. Rename member.
4. Change avatar.
5. Change color.
6. Save.

Acceptance:

- Edits affect member chips, record cards, search filters, and new record defaults in the prototype.
- Use desensitized example names only.

### 2.7 Note Station Import Review

Steps:

1. Open Settings.
2. Open Note Station Import.
3. View imported summary.
4. View failure list state.
5. View success state.

Current verified stats may be displayed:

- 93 imported records.
- 20 attachments.
- 0 failures.

Acceptance:

- The flow communicates safety: preview first, backup before formal import, no silent failures.
- No real note content appears.

### 2.8 Backup and JSON Export

Steps:

1. Open Settings.
2. Tap backup.
3. See success.
4. Tap JSON export.
5. See success.
6. View failure state for NAS unavailable.

Acceptance:

- Success copy feels calm.
- Failure copy is helpful and non-technical.
- No real file paths are shown; use placeholders like `data/backups/` and `data/exports/`.

## 3. Edge States to Include

- Home with many imported records.
- Home empty state.
- Search no result.
- Category empty.
- Imported record with attachments.
- Imported record without attachments.
- Backup failed / NAS unavailable.
- JSON export success.
- Member name too long.
- 390px width with long Chinese title.

## 4. Prototype Navigation Map

```text
Home -> Detail
Home -> New Record -> Home
Home -> Search -> Detail
Home -> Categories -> Filtered Home -> Detail
Settings -> Member Management -> New Record
Settings -> Note Station Import
Settings -> Backup / Export states
```

## 5. Out of Scope

Do not prototype:

- Complex permission matrix.
- Real login flow unless explicitly requested later.
- NAS network configuration wizard.
- Raw database admin views.
- Full Note Station parser internals.
