package com.homeoldnote.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String PREFS_NAME = "home_notes_android";
    private static final String SERVER_URL_KEY = "server_url";
    private static final String DEFAULT_PLACEHOLDER_URL = "http://192.168.1.100:3300";
    private static final int FILE_CHOOSER_REQUEST_CODE = 4300;

    private SharedPreferences preferences;
    private WebView webView;
    private ProgressBar progressBar;
    private ValueCallback<Uri[]> filePathCallback;
    private String currentServerUrl;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        preferences = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        currentServerUrl = preferences.getString(SERVER_URL_KEY, "");

        if (currentServerUrl == null || currentServerUrl.trim().isEmpty()) {
            showSettings("");
        } else {
            loadServer(currentServerUrl);
        }
    }

    private void showSettings(String message) {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER_HORIZONTAL);
        root.setPadding(dp(24), dp(40), dp(24), dp(24));
        root.setBackgroundColor(Color.rgb(244, 245, 247));

        TextView title = new TextView(this);
        title.setText("连接家事记服务");
        title.setTextColor(Color.rgb(13, 24, 37));
        title.setTextSize(26);
        title.setGravity(Gravity.CENTER);
        title.setTypeface(title.getTypeface(), android.graphics.Typeface.BOLD);
        root.addView(title, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        TextView description = new TextView(this);
        description.setText("请输入家庭 NAS / Docker 上的家事记地址。地址只保存在这台手机上。");
        description.setTextColor(Color.rgb(113, 123, 138));
        description.setTextSize(15);
        description.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams descParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        descParams.setMargins(0, dp(12), 0, dp(24));
        root.addView(description, descParams);

        if (message != null && !message.isEmpty()) {
            TextView error = new TextView(this);
            error.setText(message);
            error.setTextColor(Color.rgb(180, 84, 42));
            error.setTextSize(14);
            error.setGravity(Gravity.CENTER);
            LinearLayout.LayoutParams errorParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            errorParams.setMargins(0, 0, 0, dp(16));
            root.addView(error, errorParams);
        }

        EditText input = new EditText(this);
        input.setSingleLine(true);
        input.setText(currentServerUrl == null || currentServerUrl.isEmpty() ? "" : currentServerUrl);
        input.setHint(DEFAULT_PLACEHOLDER_URL);
        input.setTextSize(16);
        input.setSelectAllOnFocus(false);
        input.setInputType(android.text.InputType.TYPE_TEXT_VARIATION_URI);
        root.addView(input, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(54)));

        Button saveButton = new Button(this);
        saveButton.setText("保存并打开");
        saveButton.setTextSize(16);
        saveButton.setAllCaps(false);
        saveButton.setTextColor(Color.WHITE);
        saveButton.setBackgroundColor(Color.rgb(61, 170, 108));
        LinearLayout.LayoutParams buttonParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(52));
        buttonParams.setMargins(0, dp(18), 0, 0);
        root.addView(saveButton, buttonParams);

        TextView helper = new TextView(this);
        helper.setText("示例：" + DEFAULT_PLACEHOLDER_URL + "\n手机和 NAS 需要在同一个局域网内。");
        helper.setTextColor(Color.rgb(146, 154, 168));
        helper.setTextSize(13);
        helper.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams helperParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        helperParams.setMargins(0, dp(18), 0, 0);
        root.addView(helper, helperParams);

        saveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String normalized = normalizeServerUrl(input.getText().toString());
                if (normalized.isEmpty()) {
                    Toast.makeText(MainActivity.this, "请先输入服务器地址", Toast.LENGTH_SHORT).show();
                    return;
                }
                if (!isHttpUrl(normalized)) {
                    Toast.makeText(MainActivity.this, "地址需要以 http:// 或 https:// 开头", Toast.LENGTH_SHORT).show();
                    return;
                }
                preferences.edit().putString(SERVER_URL_KEY, normalized).apply();
                currentServerUrl = normalized;
                loadServer(normalized);
            }
        });

        setContentView(root);
    }

    private void loadServer(String serverUrl) {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(244, 245, 247));

        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setIndeterminate(true);
        root.addView(progressBar, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(3)));

        webView = new WebView(this);
        configureWebView(webView);
        root.addView(webView, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));

        setContentView(root);
        webView.loadUrl(serverUrl);
    }

    private void configureWebView(WebView view) {
        WebSettings settings = view.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        view.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> callback, FileChooserParams fileChooserParams) {
                if (filePathCallback != null) {
                    filePathCallback.onReceiveValue(null);
                }
                filePathCallback = callback;

                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType(resolveFileChooserType(fileChooserParams));
                String[] mimeTypes = resolveFileChooserMimeTypes(fileChooserParams);
                if (mimeTypes.length > 0) {
                    intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);
                }

                try {
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE);
                    return true;
                } catch (Exception error) {
                    filePathCallback = null;
                    callback.onReceiveValue(null);
                    Toast.makeText(MainActivity.this, "没有找到可用的文件选择器", Toast.LENGTH_SHORT).show();
                    return false;
                }
            }
        });

        view.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView webView, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (uri == null) return false;
                String scheme = uri.getScheme();
                return !(scheme == null || scheme.equals("http") || scheme.equals("https"));
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (progressBar != null) {
                    progressBar.setVisibility(View.GONE);
                }
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request != null && request.isForMainFrame()) {
                    showLoadError();
                }
            }
        });
    }

    private void showLoadError() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER_HORIZONTAL);
        root.setPadding(dp(24), dp(48), dp(24), dp(24));
        root.setBackgroundColor(Color.rgb(244, 245, 247));

        TextView title = new TextView(this);
        title.setText("暂时连不上家事记");
        title.setTextColor(Color.rgb(13, 24, 37));
        title.setTextSize(24);
        title.setGravity(Gravity.CENTER);
        title.setTypeface(title.getTypeface(), android.graphics.Typeface.BOLD);
        root.addView(title, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        TextView message = new TextView(this);
        message.setText("请确认 Docker/NAS 服务已启动，手机和服务器在同一个局域网，或者修改服务器地址。");
        message.setTextColor(Color.rgb(113, 123, 138));
        message.setTextSize(15);
        message.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams msgParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        msgParams.setMargins(0, dp(12), 0, dp(24));
        root.addView(message, msgParams);

        Button retry = new Button(this);
        retry.setText("重新连接");
        retry.setAllCaps(false);
        retry.setTextColor(Color.WHITE);
        retry.setBackgroundColor(Color.rgb(61, 170, 108));
        root.addView(retry, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(52)));
        retry.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                loadServer(currentServerUrl);
            }
        });

        Button settings = new Button(this);
        settings.setText("修改服务器地址");
        settings.setAllCaps(false);
        LinearLayout.LayoutParams settingsParams = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(52));
        settingsParams.setMargins(0, dp(12), 0, 0);
        root.addView(settings, settingsParams);
        settings.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showSettings("可以换成当前 Docker/NAS 的局域网地址。");
            }
        });

        setContentView(root);
    }

    private String resolveFileChooserType(WebChromeClient.FileChooserParams params) {
        if (params == null || params.getAcceptTypes() == null) return "*/*";
        for (String type : params.getAcceptTypes()) {
            if (type == null || type.trim().isEmpty()) continue;
            String value = type.trim();
            if (value.startsWith(".")) return "*/*";
            return value;
        }
        return "*/*";
    }

    private String[] resolveFileChooserMimeTypes(WebChromeClient.FileChooserParams params) {
        if (params == null || params.getAcceptTypes() == null) {
            return new String[] { "application/octet-stream", "application/zip", "image/*" };
        }

        java.util.ArrayList<String> mimeTypes = new java.util.ArrayList<>();
        for (String type : params.getAcceptTypes()) {
            if (type == null || type.trim().isEmpty()) continue;
            String value = type.trim();
            if (value.equals(".nsx")) {
                mimeTypes.add("application/octet-stream");
                mimeTypes.add("application/zip");
                continue;
            }
            if (!value.startsWith(".")) {
                mimeTypes.add(value);
            }
        }

        if (mimeTypes.isEmpty()) {
            mimeTypes.add("application/octet-stream");
            mimeTypes.add("application/zip");
            mimeTypes.add("image/*");
        }
        return mimeTypes.toArray(new String[0]);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (filePathCallback == null) return;
            Uri[] result = null;
            if (resultCode == Activity.RESULT_OK) {
                result = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
                if (result == null && data != null && data.getData() != null) {
                    result = new Uri[] { data.getData() };
                }
            }
            filePathCallback.onReceiveValue(result);
            filePathCallback = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    private String normalizeServerUrl(String raw) {
        String value = raw == null ? "" : raw.trim();
        if (value.isEmpty()) return "";
        while (value.endsWith("/")) {
            value = value.substring(0, value.length() - 1);
        }
        return value;
    }

    private boolean isHttpUrl(String value) {
        return value.startsWith("http://") || value.startsWith("https://");
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        super.onBackPressed();
    }
}
