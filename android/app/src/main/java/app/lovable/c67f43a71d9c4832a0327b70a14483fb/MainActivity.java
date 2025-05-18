package app.lovable.c67f43a71d9c4832a0327b70a14483fb;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.provider.Settings;
import android.util.Log;
import java.lang.reflect.Field;

public class MainActivity extends BridgeActivity {
    private static final String CHANNEL_ID = "remind-itt-notifications-v3";
    private static final String TAG = "MainActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Create the notification channel with the system default sound
        createNotificationChannelWithDefaultSound();
        
        // Log success message
        Log.d(TAG, "App initialized with custom notification channel");
    }
    
    private void createNotificationChannelWithDefaultSound() {
        // Only needed for Android Oreo and above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                NotificationManager notificationManager = 
                    (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                    
                // Check if channel already exists and delete it
                if (notificationManager.getNotificationChannel(CHANNEL_ID) != null) {
                    notificationManager.deleteNotificationChannel(CHANNEL_ID);
                    Log.d(TAG, "Deleted existing notification channel");
                }
                
                // Create channel with specific settings
                NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Task Reminders", 
                    NotificationManager.IMPORTANCE_HIGH
                );
                
                // Use the system default notification sound
                Uri defaultSoundUri = Settings.System.DEFAULT_NOTIFICATION_URI;
                Log.d(TAG, "Using system default sound URI: " + defaultSoundUri.toString());
                
                AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .build();
                    
                // Configure channel with system default sound
                channel.setSound(defaultSoundUri, audioAttributes);
                
                // Force the channel to use the system default sound
                try {
                    // Use reflection to access private fields if needed
                    Field soundField = NotificationChannel.class.getDeclaredField("mSound");
                    soundField.setAccessible(true);
                    soundField.set(channel, Settings.System.DEFAULT_NOTIFICATION_URI);
                    Log.d(TAG, "Successfully forced system default sound using reflection");
                } catch (Exception e) {
                    Log.e(TAG, "Failed to set sound via reflection: " + e.getMessage());
                    // Continue anyway as the normal method might work
                }
                
                // Set other channel properties
                channel.setDescription("Notifications with system default sound");
                channel.enableLights(true);
                channel.setLightColor(0x4f46e5);
                channel.enableVibration(true);
                channel.setShowBadge(true);
                
                // Create the channel with these settings
                notificationManager.createNotificationChannel(channel);
                Log.d(TAG, "Successfully created notification channel with default sound");
                
                // Verify the channel was created with correct settings
                NotificationChannel createdChannel = notificationManager.getNotificationChannel(CHANNEL_ID);
                if (createdChannel != null) {
                    Log.d(TAG, "Channel verification: Name=" + createdChannel.getName() 
                         + ", Sound=" + (createdChannel.getSound() != null ? createdChannel.getSound().toString() : "null")
                         + ", Importance=" + createdChannel.getImportance());
                }
            } catch (Exception e) {
                Log.e(TAG, "Error creating notification channel: " + e.getMessage());
            }
        }
    }
}
