package app.lovable.c67f43a71d9c4832a0327b70a14483fb;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.view.Window;
import android.view.WindowManager;
import android.graphics.Color;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.FrameLayout;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "RemindItt";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Make sure window has no ActionBar
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        
        // Skip splash screen completely
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        splashScreen.setKeepOnScreenCondition(() -> false);
        
        // Make status bar transparent while ensuring it's visible
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.TRANSPARENT);
        
        // Use light status bar icons for light theme
        WindowInsetsControllerCompat windowInsetsController =
                WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        windowInsetsController.setAppearanceLightStatusBars(true);
        
        // Make content display under the status bar
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        
        super.onCreate(savedInstanceState);
        
        // Log that the app is starting
        Log.d(TAG, "MainActivity created - initializing app");
        
        // Create notification channel immediately
        NotificationHelper.createNotificationChannel(this);
        
        // Customize WebView immediately
        new Handler().post(() -> {
            try {
                // Find all WebView-like elements
                View contentView = findViewById(android.R.id.content);
                if (contentView instanceof ViewGroup) {
                    findAndCustomizeWebViews((ViewGroup) contentView);
                }
                
                // Get direct WebView if available
                WebView webView = getBridge().getWebView();
                if (webView != null) {
                    // Customize the WebView settings
                    WebSettings settings = webView.getSettings();
                    
                    // Customize as needed
                    settings.setJavaScriptEnabled(true);
                    
                    // Remove any default browser chrome/headers
                    webView.setVerticalScrollBarEnabled(false);
                    webView.setHorizontalScrollBarEnabled(false);
                    
                    // Set transparent background
                    webView.setBackgroundColor(Color.TRANSPARENT);
                    
                    // Add padding to the top of the WebView to account for status bar
                    int statusBarHeight = getStatusBarHeight();
                    Log.d(TAG, "Status bar height: " + statusBarHeight);
                    
                    // This ensures content doesn't go under the status bar
                    webView.setPadding(0, 0, 0, 0);
                    
                    Log.d(TAG, "WebView customized successfully");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error customizing WebView: " + e.getMessage());
            }
        });
    }
    
    // Get the status bar height
    private int getStatusBarHeight() {
        int result = 0;
        int resourceId = getResources().getIdentifier("status_bar_height", "dimen", "android");
        if (resourceId > 0) {
            result = getResources().getDimensionPixelSize(resourceId);
        }
        return result;
    }
    
    // Helper method to find and customize all WebViews
    private void findAndCustomizeWebViews(ViewGroup viewGroup) {
        for (int i = 0; i < viewGroup.getChildCount(); i++) {
            View child = viewGroup.getChildAt(i);
            
            if (child instanceof WebView) {
                WebView webView = (WebView) child;
                webView.setBackgroundColor(Color.TRANSPARENT);
                WebSettings settings = webView.getSettings();
                settings.setJavaScriptEnabled(true);
                webView.setVerticalScrollBarEnabled(false);
                webView.setHorizontalScrollBarEnabled(false);
                Log.d(TAG, "Found and customized WebView");
            } else if (child instanceof ViewGroup) {
                findAndCustomizeWebViews((ViewGroup) child);
            }
        }
    }
    
    @Override
    public void onResume() {
        super.onResume();
        Log.d(TAG, "App resumed - ensuring notification permissions are set");
        
        // Recreate notification channel on resume to ensure it's set up correctly
        NotificationHelper.createNotificationChannel(this);
    }
    
    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        Log.d(TAG, "New intent received: " + intent.getAction());
        
        // Handle notification-triggered launches
        if (intent.getExtras() != null) {
            for (String key : intent.getExtras().keySet()) {
                Log.d(TAG, "Intent extra: " + key + " = " + intent.getExtras().get(key));
            }
        }
    }
}
