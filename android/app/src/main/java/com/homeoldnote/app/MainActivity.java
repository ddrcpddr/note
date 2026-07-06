package com.homeoldnote.app;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Context;
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
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final String DATABASE_NAME = "home_note_native.db";
    private static final int DATABASE_VERSION = 1;
    private static final int GREEN = Color.rgb(61, 170, 108);
    private static final int DARK = Color.rgb(13, 24, 37);
    private static final int MUTED = Color.rgb(113, 123, 138);
    private static final int BG = Color.rgb(244, 245, 247);
    private static final int CARD = Color.WHITE;

    private NotesDb db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        db = new NotesDb(this);
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

        Button newButton = smallButton("新建");
        newButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showEditor(null);
            }
        });
        header.addView(newButton, new LinearLayout.LayoutParams(dp(88), dp(44)));
        page.addView(header);

        TextView offlineNotice = text("当前是原生离线版：不连接 Docker/NAS 也可以新建、编辑和保存。", 13, GREEN, false);
        offlineNotice.setPadding(dp(12), dp(10), dp(12), dp(10));
        offlineNotice.setBackgroundColor(Color.rgb(232, 245, 238));
        LinearLayout.LayoutParams noticeParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        noticeParams.setMargins(0, dp(16), 0, dp(16));
        page.addView(offlineNotice, noticeParams);

        List<Note> notes = db.listNotes();
        TextView listTitle = text("最新记录（" + notes.size() + "）", 18, DARK, true);
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
            db.execSQL("CREATE TABLE notes (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "title TEXT NOT NULL DEFAULT ''," +
                "content TEXT NOT NULL DEFAULT ''," +
                "category TEXT NOT NULL DEFAULT '未分类 / 待整理'," +
                "tags TEXT NOT NULL DEFAULT ''," +
                "created_at TEXT NOT NULL," +
                "updated_at TEXT NOT NULL" +
                ")");
        }

        @Override
        public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
            db.execSQL("DROP TABLE IF EXISTS notes");
            onCreate(db);
        }

        long createNote(String title, String content, String category, String tags) {
            String now = nowText();
            ContentValues values = new ContentValues();
            values.put("title", title);
            values.put("content", content);
            values.put("category", category);
            values.put("tags", tags);
            values.put("created_at", now);
            values.put("updated_at", now);
            return getWritableDatabase().insert("notes", null, values);
        }

        void updateNote(long id, String title, String content, String category, String tags) {
            ContentValues values = new ContentValues();
            values.put("title", title);
            values.put("content", content);
            values.put("category", category);
            values.put("tags", tags);
            values.put("updated_at", nowText());
            getWritableDatabase().update("notes", values, "id=?", new String[]{String.valueOf(id)});
        }

        List<Note> listNotes() {
            List<Note> notes = new ArrayList<Note>();
            Cursor cursor = getReadableDatabase().query("notes", null, null, null, null, null, "updated_at DESC, id DESC");
            try {
                while (cursor.moveToNext()) notes.add(readNote(cursor));
            } finally {
                cursor.close();
            }
            return notes;
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
