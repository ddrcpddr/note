package com.homeoldnote.app;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Context;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final String DATABASE_NAME = "home_note_native.db";
    private static final String PREFS_NAME = "home_note_native_prefs";
    private static final String PREF_SERVER_URL = "server_url";
    private static final int DATABASE_VERSION = 6;
    private static final int GREEN = Color.rgb(61, 170, 108);
    private static final int DARK = Color.rgb(13, 24, 37);
    private static final int MUTED = Color.rgb(113, 123, 138);
    private static final int BG = Color.rgb(244, 245, 247);
    private static final int CARD = Color.WHITE;

    private NotesDb db;
    private SharedPreferences prefs;
    private String currentSearchQuery = "";
    private String currentCategoryFilter = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        db = new NotesDb(this);
        prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        showHome();
    }

    @Override
    protected void onDestroy() {
        if (db != null) db.close();
        super.onDestroy();
    }

    private void showHome() {
        LinearLayout page = pageRoot();
        LinearLayout header = horizontal();
        header.setGravity(Gravity.CENTER_VERTICAL);

        LinearLayout titleBox = new LinearLayout(this);
        titleBox.setOrientation(LinearLayout.VERTICAL);
        TextView title = text("家事记", 28, GREEN, true);
        TextView subtitle = text("离线记录家里的大小事", 14, MUTED, false);
        titleBox.addView(title);
        titleBox.addView(subtitle);
        header.addView(titleBox, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));

        Button categoriesButton = smallButton("分类");
        categoriesButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showCategories();
            }
        });
        header.addView(categoriesButton, new LinearLayout.LayoutParams(dp(72), dp(44)));

        Button newButton = smallButton("新建");
        newButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showEditor(null);
            }
        });
        header.addView(newButton, new LinearLayout.LayoutParams(dp(72), dp(44)));
        page.addView(header);

        TextView offlineNotice = text("当前是原生离线版：不连接 Docker/NAS 也可以新建、编辑和保存。待同步：" + db.pendingSyncCount() + " 条", 13, GREEN, false);
        offlineNotice.setPadding(dp(12), dp(10), dp(12), dp(10));
        offlineNotice.setBackgroundColor(Color.rgb(232, 245, 238));
        LinearLayout.LayoutParams noticeParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        noticeParams.setMargins(0, dp(16), 0, dp(16));
        page.addView(offlineNotice, noticeParams);

        addHomeFilters(page);

        List<Note> notes = db.listNotes(currentSearchQuery, currentCategoryFilter);
        String listLabel = currentSearchQuery.length() == 0 && currentCategoryFilter.length() == 0 ? "最新记录" : "筛选结果";
        TextView listTitle = text(listLabel + "（" + notes.size() + "）", 18, DARK, true);
        page.addView(listTitle);

        if (notes.isEmpty()) {
            LinearLayout empty = card();
            empty.setGravity(Gravity.CENTER);
            empty.setPadding(dp(18), dp(32), dp(18), dp(32));
            TextView emptyTitle = text("这里暂时没有记录", 20, DARK, true);
            emptyTitle.setGravity(Gravity.CENTER);
            TextView emptyText = text("先新建一条，数据会保存在这台手机本地。", 14, MUTED, false);
            emptyText.setGravity(Gravity.CENTER);
            empty.addView(emptyTitle);
            empty.addView(emptyText);
            page.addView(empty, cardParams());
        } else {
            for (final Note note : notes) {
                LinearLayout item = card();
                item.setPadding(dp(16), dp(14), dp(16), dp(14));
                TextView itemTitle = text(note.title.length() == 0 ? "未命名记录" : note.title, 18, DARK, true);
                TextView summary = text(note.content.length() == 0 ? "没有正文" : note.content, 14, MUTED, false);
                summary.setMaxLines(3);
                TextView meta = text(note.category + "  ·  " + note.updatedAt, 12, GREEN, false);
                item.addView(itemTitle);
                item.addView(summary);
                item.addView(meta);
                item.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        showDetail(note.id);
                    }
                });
                page.addView(item, cardParams());
            }
        }

        setScrollable(page);
    }

    private void addHomeFilters(LinearLayout page) {
        LinearLayout searchCard = card();
        searchCard.setPadding(dp(12), dp(10), dp(12), dp(10));
        LinearLayout searchRow = horizontal();
        searchRow.setGravity(Gravity.CENTER_VERTICAL);
        final EditText searchInput = input("搜索记录、标签或内容", false);
        searchInput.setText(currentSearchQuery);
        searchRow.addView(searchInput, new LinearLayout.LayoutParams(0, dp(48), 1));
        Button searchButton = smallButton("搜索");
        searchButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                currentSearchQuery = searchInput.getText().toString().trim();
                hideKeyboard(searchInput);
                showHome();
            }
        });
        searchRow.addView(searchButton, new LinearLayout.LayoutParams(dp(76), dp(48)));
        searchCard.addView(searchRow);

        if (currentSearchQuery.length() > 0 || currentCategoryFilter.length() > 0) {
            Button clear = smallButton("清除筛选");
            clear.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    currentSearchQuery = "";
                    currentCategoryFilter = "";
                    showHome();
                }
            });
            searchCard.addView(clear, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(44)));
        }
        page.addView(searchCard, cardParams());

        HorizontalScrollView categoryScroll = new HorizontalScrollView(this);
        categoryScroll.setHorizontalScrollBarEnabled(false);
        LinearLayout categoryRow = horizontal();
        categoryRow.setPadding(0, dp(8), 0, dp(4));
        categoryRow.addView(filterButton("全部分类", ""));
        for (String category : db.listCategories()) {
            categoryRow.addView(filterButton(category, category));
        }
        categoryScroll.addView(categoryRow);
        page.addView(categoryScroll, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
    }

    private Button filterButton(String label, final String categoryValue) {
        Button button = smallButton(label);
        boolean selected = currentCategoryFilter.equals(categoryValue);
        button.setTextColor(selected ? Color.WHITE : GREEN);
        button.setBackgroundColor(selected ? GREEN : CARD);
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                currentCategoryFilter = categoryValue;
                showHome();
            }
        });
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, dp(42));
        params.setMargins(0, 0, dp(8), 0);
        button.setLayoutParams(params);
        return button;
    }
    private void showCategories() {
        LinearLayout page = pageRoot();
        LinearLayout top = horizontal();
        top.setGravity(Gravity.CENTER_VERTICAL);
        Button back = smallButton("返回");
        back.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showHome();
            }
        });
        top.addView(back, new LinearLayout.LayoutParams(dp(76), dp(44)));
        TextView title = text("分类管理", 20, DARK, true);
        title.setGravity(Gravity.CENTER);
        top.addView(title, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        page.addView(top);

        LinearLayout addCard = card();
        addCard.setPadding(dp(16), dp(14), dp(16), dp(14));
        addCard.addView(text("添加分类", 18, GREEN, true));
        final EditText nameInput = input("新分类名称", false);
        addCard.addView(nameInput, inputParams(false));
        Button addButton = smallButton("保存分类");
        addButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String name = nameInput.getText().toString().trim();
                if (name.length() == 0) {
                    Toast.makeText(MainActivity.this, "先写分类名称", Toast.LENGTH_SHORT).show();
                    return;
                }
                db.createCategory(name);
                hideKeyboard(nameInput);
                Toast.makeText(MainActivity.this, "分类已保存到手机本地", Toast.LENGTH_SHORT).show();
                showCategories();
            }
        });
        addCard.addView(addButton, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(44)));
        page.addView(addCard, cardParams());

        TextView listTitle = text("本机分类", 18, DARK, true);
        listTitle.setPadding(0, dp(18), 0, 0);
        page.addView(listTitle);
        for (final String category : db.listCategories()) {
            LinearLayout item = card();
            item.setPadding(dp(16), dp(12), dp(16), dp(12));
            LinearLayout row = horizontal();
            row.setGravity(Gravity.CENTER_VERTICAL);
            TextView name = text(category, 17, DARK, true);
            row.addView(name, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
            Button use = smallButton("筛选");
            use.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    currentCategoryFilter = category;
                    showHome();
                }
            });
            row.addView(use, new LinearLayout.LayoutParams(dp(76), dp(42)));
            item.addView(row);
            item.addView(text("用于本机离线记录", 12, MUTED, false));
            page.addView(item, cardParams());
        }

        setScrollable(page);
    }

    private void showSyncSettings() {
        LinearLayout page = pageRoot();
        LinearLayout top = horizontal();
        top.setGravity(Gravity.CENTER_VERTICAL);
        Button back = smallButton("返回");
        back.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showHome();
            }
        });
        top.addView(back, new LinearLayout.LayoutParams(dp(76), dp(44)));
        TextView title = text("离线同步", 20, DARK, true);
        title.setGravity(Gravity.CENTER);
        top.addView(title, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        page.addView(top);

        LinearLayout card = card();
        card.setPadding(dp(16), dp(14), dp(16), dp(14));
        card.addView(text("服务器地址", 18, GREEN, true));
        card.addView(text("填写家里 Docker/NAS 服务地址。离线记录会先保存在手机本地。", 13, MUTED, false));
        final EditText serverInput = input("例如 http://192.168.2.213:3300", false);
        serverInput.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        serverInput.setText(prefs.getString(PREF_SERVER_URL, ""));
        card.addView(serverInput, inputParams(false));

        TextView pending = text("待同步：" + db.pendingSyncCount() + " 条", 16, DARK, true);
        pending.setPadding(0, dp(8), 0, dp(8));
        card.addView(pending);

        List<SyncMutation> failedItems = db.listFailedSyncItems();
        if (!failedItems.isEmpty()) {
            TextView failedTitle = text("最近同步失败", 16, DARK, true);
            failedTitle.setPadding(0, dp(8), 0, dp(4));
            card.addView(failedTitle);
            for (SyncMutation failed : failedItems) {
                LinearLayout failedBox = card();
                failedBox.setPadding(dp(10), dp(8), dp(10), dp(8));
                failedBox.setBackgroundColor(Color.rgb(255, 246, 232));
                failedBox.addView(text((failed.title == null || failed.title.length() == 0 ? "未命名记录" : failed.title) + " · " + failed.mutationType, 14, DARK, true));
                failedBox.addView(text("失败原因：" + (failed.errorMessage == null ? "未知错误" : failed.errorMessage), 12, MUTED, false));
                failedBox.addView(text("最后尝试：" + (failed.lastAttemptAt == null ? "暂无" : failed.lastAttemptAt), 12, MUTED, false));
                card.addView(failedBox, cardParams());
            }
        }

        Button save = smallButton("保存服务器地址");
        save.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                prefs.edit().putString(PREF_SERVER_URL, serverInput.getText().toString().trim()).apply();
                hideKeyboard(serverInput);
                Toast.makeText(MainActivity.this, "服务器地址已保存", Toast.LENGTH_SHORT).show();
            }
        });
        card.addView(save, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(44)));

        Button manualSync = smallButton("手动同步");
        manualSync.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                runManualSync();
            }
        });
        card.addView(manualSync, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(44)));
        page.addView(card, cardParams());

        setScrollable(page);
    }
    private void runManualSync() {
        final String serverUrl = prefs.getString(PREF_SERVER_URL, "").trim();
        if (serverUrl.length() == 0) {
            Toast.makeText(this, "先填写服务器地址", Toast.LENGTH_SHORT).show();
            return;
        }
        Toast.makeText(this, "开始同步本机记录", Toast.LENGTH_SHORT).show();
        new Thread(new Runnable() {
            @Override
            public void run() {
                final SyncResult result = syncPendingCreates(serverUrl);
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(MainActivity.this, result.message, result.ok ? Toast.LENGTH_SHORT : Toast.LENGTH_LONG).show();
                        showSyncSettings();
                    }
                });
            }
        }).start();
    }

    private SyncResult syncPendingCreates(String serverUrl) {
        List<SyncMutation> mutations = db.listPendingSyncMutations();
        int synced = 0;
        for (SyncMutation mutation : mutations) {
            try {
                if ("create".equals(mutation.mutationType)) {
                    RemoteSyncState remoteState = postCreateMutation(serverUrl, mutation);
                    db.saveRemoteSyncState(mutation.noteId, remoteState.remoteId, remoteState.remoteUpdatedAt);
                } else if ("update".equals(mutation.mutationType)) {
                    if (mutation.remoteId == null || mutation.remoteId.trim().length() == 0) {
                        throw new Exception("没有远端记录 ID，先同步新建记录");
                    }
                    RemoteSyncState remoteState = postUpdateMutation(serverUrl, mutation);
                    db.saveRemoteSyncState(mutation.noteId, remoteState.remoteId, remoteState.remoteUpdatedAt);
                } else {
                    throw new Exception("暂不支持的同步类型：" + mutation.mutationType);
                }
                db.markSyncDone(mutation.queueId);
                synced++;
            } catch (Exception error) {
                db.markSyncFailed(mutation.queueId, error.getMessage());
                return new SyncResult(false, "同步失败：" + error.getMessage());
            }
        }
        if (synced == 0) return new SyncResult(true, "没有待同步记录");
        return new SyncResult(true, "同步完成：" + synced + " 条");
    }

    private RemoteSyncState postCreateMutation(String serverUrl, SyncMutation mutation) throws Exception {
        URL url = new URL(normalizeServerUrl(serverUrl) + "/api/notes");
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setConnectTimeout(8000);
        connection.setReadTimeout(8000);
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        connection.setRequestProperty("Content-Type", "application/json; charset=utf-8");
        connection.setRequestProperty("Accept", "application/json");

        byte[] body = buildCreatePayload(mutation).toString().getBytes("UTF-8");
        connection.setFixedLengthStreamingMode(body.length);
        OutputStream output = connection.getOutputStream();
        try {
            output.write(body);
        } finally {
            output.close();
        }

        int code = connection.getResponseCode();
        String response = readResponse(connection);
        if (code < 200 || code >= 300) {
            if (code == 409 || response.contains("note_conflict")) {
                throw new Exception("记录已经在其他设备更新，请先确认后再同步");
            }
            throw new Exception("HTTP " + code + " " + response);
        }
        connection.disconnect();
        return parseRemoteSyncState(response);
    }

    private RemoteSyncState postUpdateMutation(String serverUrl, SyncMutation mutation) throws Exception {
        URL url = new URL(normalizeServerUrl(serverUrl) + "/api/notes/" + mutation.remoteId);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setConnectTimeout(8000);
        connection.setReadTimeout(8000);
        connection.setRequestMethod("PATCH");
        connection.setDoOutput(true);
        connection.setRequestProperty("Content-Type", "application/json; charset=utf-8");
        connection.setRequestProperty("Accept", "application/json");

        byte[] body = buildUpdatePayload(mutation).toString().getBytes("UTF-8");
        connection.setFixedLengthStreamingMode(body.length);
        OutputStream output = connection.getOutputStream();
        try {
            output.write(body);
        } finally {
            output.close();
        }

        int code = connection.getResponseCode();
        String response = readResponse(connection);
        if (code < 200 || code >= 300) {
            throw new Exception("HTTP " + code + " " + response);
        }
        connection.disconnect();
        return parseRemoteSyncState(response);
    }

    private RemoteSyncState parseCreatedRemoteId(String response) throws Exception {
        return parseRemoteSyncState(response);
    }

    private RemoteSyncState parseRemoteSyncState(String response) throws Exception {
        JSONObject root = new JSONObject(response == null ? "{}" : response);
        JSONObject note = root.optJSONObject("note");
        String remoteId = note == null ? "" : note.optString("id", "");
        if (remoteId.trim().length() == 0) throw new Exception("服务端未返回记录 ID");
        String remoteUpdatedAt = note.optString("updatedAt", "");
        return new RemoteSyncState(remoteId.trim(), remoteUpdatedAt == null ? "" : remoteUpdatedAt.trim());
    }

    private JSONObject buildCreatePayload(SyncMutation mutation) throws Exception {
        JSONObject payload = new JSONObject();
        payload.put("title", mutation.title == null ? "" : mutation.title);
        payload.put("content", mutation.content == null ? "" : mutation.content);
        payload.put("contentText", mutation.content == null ? "" : mutation.content);
        payload.put("categoryId", categoryIdFor(mutation.category));
        payload.put("memberId", "self");
        payload.put("noteType", "normal");
        payload.put("sourceType", "manual");
        JSONArray tags = new JSONArray();
        for (String tag : splitTags(mutation.tags)) tags.put(tag);
        payload.put("tags", tags);
        return payload;
    }

    private JSONObject buildUpdatePayload(SyncMutation mutation) throws Exception {
        JSONObject payload = buildCreatePayload(mutation);
        if (mutation.remoteUpdatedAt != null && mutation.remoteUpdatedAt.trim().length() > 0) {
            payload.put("baseUpdatedAt", mutation.remoteUpdatedAt);
        }
        return payload;
    }

    private String readResponse(HttpURLConnection connection) {
        try {
            InputStream stream = connection.getErrorStream();
            if (stream == null) stream = connection.getInputStream();
            if (stream == null) return "";
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream, "UTF-8"));
            StringBuilder builder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) builder.append(line);
            reader.close();
            return builder.toString();
        } catch (Exception ignored) {
            return "";
        }
    }

    private String normalizeServerUrl(String serverUrl) {
        String value = serverUrl == null ? "" : serverUrl.trim();
        while (value.endsWith("/")) value = value.substring(0, value.length() - 1);
        return value;
    }

    private String categoryIdFor(String category) {
        String value = category == null ? "" : category.trim();
        if ("家庭事务".equals(value)) return "family";
        if ("房屋 / 设备".equals(value)) return "house";
        if ("维修 / 售后".equals(value)) return "repair";
        if ("购物 / 消费".equals(value)) return "shopping";
        if ("证件 / 账号".equals(value)) return "account";
        if ("孩子 / 教育".equals(value)) return "kids";
        if ("老人 / 健康".equals(value)) return "health";
        if ("宠物".equals(value)) return "pet";
        if ("工作 / 杂事".equals(value)) return "work";
        if ("临时记录".equals(value)) return "temporary";
        return "uncategorized";
    }

    private List<String> splitTags(String tags) {
        List<String> result = new ArrayList<String>();
        if (tags == null) return result;
        String[] parts = tags.split("[\\s,，、]+");
        for (String part : parts) {
            String value = part.trim();
            if (value.length() > 0) result.add(value);
        }
        return result;
    }
    private Button selectCategoryButton(String label, final EditText categoryInput) {
        Button button = smallButton(label);
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                categoryInput.setText(((Button) view).getText().toString());
            }
        });
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, dp(42));
        params.setMargins(0, 0, dp(8), 0);
        button.setLayoutParams(params);
        return button;
    }
    private void showDetail(long id) {
        final Note note = db.getNote(id);
        if (note == null) {
            Toast.makeText(this, "记录不存在", Toast.LENGTH_SHORT).show();
            showHome();
            return;
        }

        LinearLayout page = pageRoot();
        LinearLayout top = horizontal();
        top.setGravity(Gravity.CENTER_VERTICAL);
        Button back = smallButton("返回");
        back.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showHome();
            }
        });
        top.addView(back, new LinearLayout.LayoutParams(dp(76), dp(44)));
        TextView title = text("记录详情", 20, DARK, true);
        title.setGravity(Gravity.CENTER);
        top.addView(title, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        Button edit = smallButton("编辑");
        edit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showEditor(note);
            }
        });
        top.addView(edit, new LinearLayout.LayoutParams(dp(76), dp(44)));
        page.addView(top);

        LinearLayout card = card();
        card.setPadding(dp(18), dp(18), dp(18), dp(18));
        card.addView(text(note.title.length() == 0 ? "未命名记录" : note.title, 22, DARK, true));
        card.addView(text(note.category + "  ·  " + note.tags, 13, GREEN, false));
        card.addView(text("创建：" + note.createdAt, 12, MUTED, false));
        card.addView(text("更新：" + note.updatedAt, 12, MUTED, false));
        page.addView(card, cardParams());

        LinearLayout contentCard = card();
        contentCard.setPadding(dp(18), dp(18), dp(18), dp(18));
        contentCard.addView(text("内容", 18, GREEN, true));
        TextView content = text(note.content.length() == 0 ? "没有正文" : note.content, 17, DARK, false);
        content.setLineSpacing(dp(4), 1.0f);
        contentCard.addView(content);
        page.addView(contentCard, cardParams());

        setScrollable(page);
    }

    private void showEditor(final Note existing) {
        LinearLayout page = pageRoot();
        LinearLayout top = horizontal();
        top.setGravity(Gravity.CENTER_VERTICAL);
        Button cancel = smallButton("取消");
        cancel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (existing == null) showHome();
                else showDetail(existing.id);
            }
        });
        top.addView(cancel, new LinearLayout.LayoutParams(dp(76), dp(44)));
        TextView title = text(existing == null ? "新建记录" : "编辑记录", 20, DARK, true);
        title.setGravity(Gravity.CENTER);
        top.addView(title, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        Button save = smallButton("保存");
        top.addView(save, new LinearLayout.LayoutParams(dp(76), dp(44)));
        page.addView(top);

        final EditText titleInput = input("标题（可选）", false);
        final EditText contentInput = input("写下家里的小事、账单、维修、临时备忘……", true);
        final EditText categoryInput = input("分类，例如 家庭事务", false);
        final EditText tagsInput = input("标签，例如 待办 重要", false);

        if (existing != null) {
            titleInput.setText(existing.title);
            contentInput.setText(existing.content);
            categoryInput.setText(existing.category);
            tagsInput.setText(existing.tags);
        } else {
            categoryInput.setText("未分类 / 待整理");
        }

        page.addView(label("标题"));
        page.addView(titleInput, inputParams(false));
        page.addView(label("内容"));
        page.addView(contentInput, inputParams(true));
        page.addView(label("分类"));
        page.addView(categoryInput, inputParams(false));
        HorizontalScrollView editorCategoryScroll = new HorizontalScrollView(this);
        editorCategoryScroll.setHorizontalScrollBarEnabled(false);
        LinearLayout editorCategoryRow = horizontal();
        editorCategoryRow.setPadding(0, dp(8), 0, 0);
        for (String category : db.listCategories()) {
            editorCategoryRow.addView(selectCategoryButton(category, categoryInput));
        }
        editorCategoryScroll.addView(editorCategoryRow);
        page.addView(editorCategoryScroll, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        page.addView(label("标签"));
        page.addView(tagsInput, inputParams(false));

        save.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String title = titleInput.getText().toString().trim();
                String content = contentInput.getText().toString().trim();
                String category = categoryInput.getText().toString().trim();
                String tags = tagsInput.getText().toString().trim();
                if (title.length() == 0 && content.length() == 0) {
                    Toast.makeText(MainActivity.this, "先写一点内容再保存", Toast.LENGTH_SHORT).show();
                    return;
                }
                if (category.length() == 0) category = "未分类 / 待整理";
                long savedId;
                if (existing == null) savedId = db.createNote(title, content, category, tags);
                else {
                    db.updateNote(existing.id, title, content, category, tags);
                    savedId = existing.id;
                }
                hideKeyboard(contentInput);
                Toast.makeText(MainActivity.this, "已保存到手机本地", Toast.LENGTH_SHORT).show();
                showDetail(savedId);
            }
        });

        setScrollable(page);
    }

    @Override
    public void onBackPressed() {
        showHome();
    }

    private LinearLayout pageRoot() {
        LinearLayout page = new LinearLayout(this);
        page.setOrientation(LinearLayout.VERTICAL);
        page.setPadding(dp(18), dp(24), dp(18), dp(28));
        page.setBackgroundColor(BG);
        return page;
    }

    private void setScrollable(LinearLayout page) {
        ScrollView scrollView = new ScrollView(this);
        scrollView.setFillViewport(true);
        scrollView.setBackgroundColor(BG);
        scrollView.addView(page, new ScrollView.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        setContentView(scrollView);
    }

    private LinearLayout horizontal() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.HORIZONTAL);
        return layout;
    }

    private LinearLayout card() {
        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setBackgroundColor(CARD);
        return card;
    }

    private LinearLayout.LayoutParams cardParams() {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        params.setMargins(0, dp(12), 0, 0);
        return params;
    }

    private TextView label(String value) {
        TextView label = text(value, 15, DARK, true);
        label.setPadding(0, dp(18), 0, dp(8));
        return label;
    }

    private TextView text(String value, int size, int color, boolean bold) {
        TextView textView = new TextView(this);
        textView.setText(value == null ? "" : value);
        textView.setTextSize(size);
        textView.setTextColor(color);
        textView.setLineSpacing(dp(2), 1.0f);
        if (bold) textView.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        return textView;
    }

    private EditText input(String hint, boolean multiline) {
        EditText input = new EditText(this);
        input.setHint(hint);
        input.setTextSize(16);
        input.setTextColor(DARK);
        input.setHintTextColor(MUTED);
        input.setSingleLine(!multiline);
        input.setGravity(multiline ? Gravity.TOP | Gravity.START : Gravity.CENTER_VERTICAL | Gravity.START);
        input.setInputType(multiline ? InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_MULTI_LINE | InputType.TYPE_TEXT_FLAG_CAP_SENTENCES : InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
        input.setPadding(dp(12), dp(10), dp(12), dp(10));
        input.setBackgroundColor(CARD);
        return input;
    }

    private LinearLayout.LayoutParams inputParams(boolean multiline) {
        return new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, multiline ? dp(220) : dp(54));
    }

    private Button smallButton(String label) {
        Button button = new Button(this);
        button.setText(label);
        button.setAllCaps(false);
        button.setTextSize(14);
        button.setTextColor(GREEN);
        return button;
    }

    private void hideKeyboard(View view) {
        InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        if (imm != null) imm.hideSoftInputFromWindow(view.getWindowToken(), 0);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private static String nowText() {
        return new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.CHINA).format(new Date());
    }


    private static class SyncResult {
        boolean ok;
        String message;

        SyncResult(boolean ok, String message) {
            this.ok = ok;
            this.message = message;
        }
    }

    private static class RemoteSyncState {
        String remoteId;
        String remoteUpdatedAt;

        RemoteSyncState(String remoteId, String remoteUpdatedAt) {
            this.remoteId = remoteId;
            this.remoteUpdatedAt = remoteUpdatedAt;
        }
    }

    private static class SyncMutation {
        long queueId;
        long noteId;
        String remoteId;
        String remoteUpdatedAt;
        String mutationType;
        String title;
        String content;
        String category;
        String tags;
        String errorMessage;
        String lastAttemptAt;
    }
    private static class Note {
        long id;
        String title;
        String content;
        String category;
        String tags;
        String createdAt;
        String updatedAt;
    }

    private static class NotesDb extends SQLiteOpenHelper {
        NotesDb(Context context) {
            super(context, DATABASE_NAME, null, DATABASE_VERSION);
        }

        @Override
        public void onCreate(SQLiteDatabase db) {
            createNotesTable(db);
            createCategoriesTable(db);
            createSyncQueueTable(db);
            seedDefaultCategories(db);
        }

        @Override
        public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
            if (oldVersion < 2) {
                createCategoriesTable(db);
                seedDefaultCategories(db);
                db.execSQL("INSERT OR IGNORE INTO categories(name, created_at) SELECT DISTINCT category, datetime('now') FROM notes WHERE category IS NOT NULL AND category != ''");
            }
            if (oldVersion < 3) {
                createSyncQueueTable(db);
            }
            if (oldVersion < 4) {
                ensureRemoteIdColumn(db);
            }
            if (oldVersion < 5) {
                ensureSyncQueueDetailColumns(db);
            }
            if (oldVersion < 6) {
                ensureRemoteUpdatedAtColumn(db);
            }
        }

        private void createNotesTable(SQLiteDatabase db) {
            db.execSQL("CREATE TABLE IF NOT EXISTS notes (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "title TEXT NOT NULL DEFAULT ''," +
                "content TEXT NOT NULL DEFAULT ''," +
                "remote_id TEXT," +
                "remote_updated_at TEXT," +
                "category TEXT NOT NULL DEFAULT '未分类 / 待整理'," +
                "tags TEXT NOT NULL DEFAULT ''," +
                "created_at TEXT NOT NULL," +
                "updated_at TEXT NOT NULL" +
                ")");
        }

        private void ensureRemoteIdColumn(SQLiteDatabase db) {
            Cursor cursor = db.rawQuery("PRAGMA table_info(notes)", null);
            try {
                while (cursor.moveToNext()) {
                    if ("remote_id".equals(cursor.getString(cursor.getColumnIndexOrThrow("name")))) return;
                }
            } finally {
                cursor.close();
            }
            db.execSQL("ALTER TABLE notes ADD COLUMN remote_id TEXT");
        }

        private void ensureRemoteUpdatedAtColumn(SQLiteDatabase db) {
            Cursor cursor = db.rawQuery("PRAGMA table_info(notes)", null);
            try {
                while (cursor.moveToNext()) {
                    if ("remote_updated_at".equals(cursor.getString(cursor.getColumnIndexOrThrow("name")))) return;
                }
            } finally {
                cursor.close();
            }
            db.execSQL("ALTER TABLE notes ADD COLUMN remote_updated_at TEXT");
        }

        private void createCategoriesTable(SQLiteDatabase db) {
            db.execSQL("CREATE TABLE IF NOT EXISTS categories (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "name TEXT NOT NULL UNIQUE," +
                "created_at TEXT NOT NULL" +
                ")");
        }

        private void createSyncQueueTable(SQLiteDatabase db) {
            db.execSQL("CREATE TABLE IF NOT EXISTS sync_queue (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "note_id INTEGER NOT NULL," +
                "mutation_type TEXT NOT NULL," +
                "status TEXT NOT NULL DEFAULT 'pending'," +
                "error_message TEXT," +
                "last_attempt_at TEXT," +
                "created_at TEXT NOT NULL" +
                ")");
        }

        private void ensureSyncQueueDetailColumns(SQLiteDatabase db) {
            boolean hasErrorMessage = false;
            boolean hasLastAttemptAt = false;
            Cursor cursor = db.rawQuery("PRAGMA table_info(sync_queue)", null);
            try {
                while (cursor.moveToNext()) {
                    String name = cursor.getString(cursor.getColumnIndexOrThrow("name"));
                    if ("error_message".equals(name)) hasErrorMessage = true;
                    if ("last_attempt_at".equals(name)) hasLastAttemptAt = true;
                }
            } finally {
                cursor.close();
            }
            if (!hasErrorMessage) db.execSQL("ALTER TABLE sync_queue ADD COLUMN error_message TEXT");
            if (!hasLastAttemptAt) db.execSQL("ALTER TABLE sync_queue ADD COLUMN last_attempt_at TEXT");
        }
        private void seedDefaultCategories(SQLiteDatabase db) {
            String[] defaults = new String[]{"家庭事务", "房屋 / 设备", "维修 / 售后", "购物 / 消费", "证件 / 账号", "孩子 / 教育", "老人 / 健康", "宠物", "工作 / 杂事", "临时记录", "未分类 / 待整理"};
            for (String name : defaults) insertCategory(db, name);
        }

        private void insertCategory(SQLiteDatabase db, String name) {
            if (name == null || name.trim().length() == 0) return;
            ContentValues values = new ContentValues();
            values.put("name", name.trim());
            values.put("created_at", nowText());
            db.insertWithOnConflict("categories", null, values, SQLiteDatabase.CONFLICT_IGNORE);
        }

        long createNote(String title, String content, String category, String tags) {
            ensureCategory(category);
            String now = nowText();
            ContentValues values = new ContentValues();
            values.put("title", title);
            values.put("content", content);
            values.put("category", category);
            values.put("tags", tags);
            values.put("created_at", now);
            values.put("updated_at", now);
            long id = getWritableDatabase().insert("notes", null, values);
            queueSyncMutation(id, "create");
            return id;
        }

        void updateNote(long id, String title, String content, String category, String tags) {
            ensureCategory(category);
            ContentValues values = new ContentValues();
            values.put("title", title);
            values.put("content", content);
            values.put("category", category);
            values.put("tags", tags);
            values.put("updated_at", nowText());
            getWritableDatabase().update("notes", values, "id=?", new String[]{String.valueOf(id)});
            queueSyncMutation(id, "update");
        }

        void queueSyncMutation(long noteId, String mutationType) {
            if (noteId <= 0) return;
            String type = mutationType == null ? "update" : mutationType;
            if ("update".equals(type) && hasPendingCreate(noteId)) return;
            if (hasPendingMutation(noteId, type)) return;
            ContentValues values = new ContentValues();
            values.put("note_id", noteId);
            values.put("mutation_type", type);
            values.put("status", "pending");
            values.put("created_at", nowText());
            getWritableDatabase().insert("sync_queue", null, values);
        }

        boolean hasPendingCreate(long noteId) {
            return hasPendingMutation(noteId, "create");
        }

        boolean hasPendingMutation(long noteId, String mutationType) {
            Cursor cursor = getReadableDatabase().rawQuery(
                "SELECT COUNT(*) FROM sync_queue WHERE note_id = ? AND mutation_type = ? AND status IN ('pending', 'failed')",
                new String[]{String.valueOf(noteId), mutationType}
            );
            try {
                if (!cursor.moveToFirst()) return false;
                return cursor.getInt(0) > 0;
            } finally {
                cursor.close();
            }
        }

        int pendingSyncCount() {
            Cursor cursor = getReadableDatabase().rawQuery("SELECT COUNT(*) FROM sync_queue WHERE status IN ('pending', 'failed')", null);
            try {
                if (!cursor.moveToFirst()) return 0;
                return cursor.getInt(0);
            } finally {
                cursor.close();
            }
        }

        List<SyncMutation> listPendingSyncMutations() {
            List<SyncMutation> mutations = new ArrayList<SyncMutation>();
            Cursor cursor = getReadableDatabase().rawQuery(
                "SELECT q.id, q.note_id, n.remote_id, n.remote_updated_at, q.mutation_type, n.title, n.content, n.category, n.tags " +
                "FROM sync_queue q JOIN notes n ON n.id = q.note_id " +
                "WHERE q.status IN ('pending', 'failed') ORDER BY q.id ASC",
                null
            );
            try {
                while (cursor.moveToNext()) {
                    SyncMutation mutation = new SyncMutation();
                    mutation.queueId = cursor.getLong(0);
                    mutation.noteId = cursor.getLong(1);
                    mutation.remoteId = cursor.getString(2);
                    mutation.remoteUpdatedAt = cursor.getString(3);
                    mutation.mutationType = cursor.getString(4);
                    mutation.title = cursor.getString(5);
                    mutation.content = cursor.getString(6);
                    mutation.category = cursor.getString(7);
                    mutation.tags = cursor.getString(8);
                    mutations.add(mutation);
                }
            } finally {
                cursor.close();
            }
            return mutations;
        }

        void markSyncDone(long queueId) {
            ContentValues values = new ContentValues();
            values.put("status", "done");
            values.put("error_message", "");
            values.put("last_attempt_at", nowText());
            getWritableDatabase().update("sync_queue", values, "id=?", new String[]{String.valueOf(queueId)});
        }

        void markSyncFailed(long queueId, String message) {
            ContentValues values = new ContentValues();
            values.put("status", "failed");
            values.put("error_message", message == null ? "未知错误" : message);
            values.put("last_attempt_at", nowText());
            getWritableDatabase().update("sync_queue", values, "id=?", new String[]{String.valueOf(queueId)});
        }

        void saveRemoteId(long noteId, String remoteId) {
            saveRemoteSyncState(noteId, remoteId, "");
        }

        void saveRemoteSyncState(long noteId, String remoteId, String remoteUpdatedAt) {
            if (noteId <= 0 || remoteId == null || remoteId.trim().length() == 0) return;
            ContentValues values = new ContentValues();
            values.put("remote_id", remoteId.trim());
            values.put("remote_updated_at", remoteUpdatedAt == null ? "" : remoteUpdatedAt.trim());
            getWritableDatabase().update("notes", values, "id=?", new String[]{String.valueOf(noteId)});
        }

        List<SyncMutation> listFailedSyncItems() {
            List<SyncMutation> mutations = new ArrayList<SyncMutation>();
            Cursor cursor = getReadableDatabase().rawQuery(
                "SELECT q.id, q.note_id, n.remote_id, q.mutation_type, n.title, q.error_message, q.last_attempt_at " +
                "FROM sync_queue q JOIN notes n ON n.id = q.note_id " +
                "WHERE q.status = 'failed' ORDER BY q.id DESC LIMIT 5",
                null
            );
            try {
                while (cursor.moveToNext()) {
                    SyncMutation mutation = new SyncMutation();
                    mutation.queueId = cursor.getLong(0);
                    mutation.noteId = cursor.getLong(1);
                    mutation.remoteId = cursor.getString(2);
                    mutation.mutationType = cursor.getString(3);
                    mutation.title = cursor.getString(4);
                    mutation.errorMessage = cursor.getString(5);
                    mutation.lastAttemptAt = cursor.getString(6);
                    mutations.add(mutation);
                }
            } finally {
                cursor.close();
            }
            return mutations;
        }
        List<Note> listNotes(String searchQuery, String categoryFilter) {
            List<Note> notes = new ArrayList<Note>();
            StringBuilder where = new StringBuilder();
            List<String> args = new ArrayList<String>();
            if (searchQuery != null && searchQuery.trim().length() > 0) {
                where.append("(title LIKE ? OR content LIKE ? OR tags LIKE ?)");
                String like = "%" + searchQuery.trim() + "%";
                args.add(like);
                args.add(like);
                args.add(like);
            }
            if (categoryFilter != null && categoryFilter.trim().length() > 0) {
                if (where.length() > 0) where.append(" AND ");
                where.append("category = ?");
                args.add(categoryFilter.trim());
            }
            Cursor cursor = getReadableDatabase().query(
                "notes",
                null,
                where.length() == 0 ? null : where.toString(),
                args.size() == 0 ? null : args.toArray(new String[args.size()]),
                null,
                null,
                "updated_at DESC, id DESC"
            );
            try {
                while (cursor.moveToNext()) notes.add(readNote(cursor));
            } finally {
                cursor.close();
            }
            return notes;
        }

        void createCategory(String name) {
            insertCategory(getWritableDatabase(), name);
        }

        void ensureCategory(String category) {
            createCategory(category);
        }

        List<String> listCategories() {
            List<String> categories = new ArrayList<String>();
            Cursor cursor = getReadableDatabase().rawQuery(
                "SELECT name FROM categories ORDER BY id ASC",
                null
            );
            try {
                while (cursor.moveToNext()) categories.add(cursor.getString(0));
            } finally {
                cursor.close();
            }
            Cursor noteCursor = getReadableDatabase().rawQuery(
                "SELECT DISTINCT category FROM notes WHERE category IS NOT NULL AND category != '' ORDER BY category COLLATE LOCALIZED",
                null
            );
            try {
                while (noteCursor.moveToNext()) {
                    String category = noteCursor.getString(0);
                    if (!categories.contains(category)) categories.add(category);
                }
            } finally {
                noteCursor.close();
            }
            return categories;
        }

        Note getNote(long id) {
            Cursor cursor = getReadableDatabase().query("notes", null, "id=?", new String[]{String.valueOf(id)}, null, null, null);
            try {
                if (!cursor.moveToFirst()) return null;
                return readNote(cursor);
            } finally {
                cursor.close();
            }
        }

        private Note readNote(Cursor cursor) {
            Note note = new Note();
            note.id = cursor.getLong(cursor.getColumnIndexOrThrow("id"));
            note.title = cursor.getString(cursor.getColumnIndexOrThrow("title"));
            note.content = cursor.getString(cursor.getColumnIndexOrThrow("content"));
            note.category = cursor.getString(cursor.getColumnIndexOrThrow("category"));
            note.tags = cursor.getString(cursor.getColumnIndexOrThrow("tags"));
            note.createdAt = cursor.getString(cursor.getColumnIndexOrThrow("created_at"));
            note.updatedAt = cursor.getString(cursor.getColumnIndexOrThrow("updated_at"));
            return note;
        }
    }
}
