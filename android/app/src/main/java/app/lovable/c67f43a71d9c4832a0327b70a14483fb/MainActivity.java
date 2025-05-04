package app.lovable.c67f43a71d9c4832a0327b70a14483fb;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "RemindItt";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Log that the app is starting
        Log.d(TAG, "MainActivity created - initializing app");
        
        // Create notification channel immediately
        NotificationHelper.createNotificationChannel(this);
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
