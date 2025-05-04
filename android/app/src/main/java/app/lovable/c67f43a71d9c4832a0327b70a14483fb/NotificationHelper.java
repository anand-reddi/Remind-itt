package app.lovable.c67f43a71d9c4832a0327b70a14483fb;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

public class NotificationHelper {
    private static final String TAG = "RemindItt";
    private static final String CHANNEL_ID = "remind-itt-notifications";
    private static final String CHANNEL_NAME = "Task Reminders";
    private static final String CHANNEL_DESCRIPTION = "Notifications for task reminders";
    
    public static void createNotificationChannel(Context context) {
        // Create notification channel for Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Log.d(TAG, "Creating notification channel");
            
            NotificationManager notificationManager = 
                    context.getSystemService(NotificationManager.class);
            
            // Check if channel already exists
            if (notificationManager.getNotificationChannel(CHANNEL_ID) != null) {
                Log.d(TAG, "Notification channel already exists");
                return;
            }
            
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID, 
                    CHANNEL_NAME, 
                    importance);
            
            channel.setDescription(CHANNEL_DESCRIPTION);
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{100, 200, 300, 400, 500});
            
            // Configure sound - use system default notification sound
            try {
                Uri defaultSoundUri = Settings.System.DEFAULT_NOTIFICATION_URI;
                Log.d(TAG, "Using default system notification sound: " + defaultSoundUri.toString());
                
                AudioAttributes audioAttributes = new AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                        .build();
                
                channel.setSound(defaultSoundUri, audioAttributes);
                Log.d(TAG, "Set default system notification sound successfully");
            } catch (Exception e) {
                Log.e(TAG, "Error setting notification sound", e);
                
                // Fall back to custom sound if system default fails
                try {
                    int soundResId = context.getResources().getIdentifier("beep", "raw", context.getPackageName());
                    
                    if (soundResId > 0) {
                        Uri alternativeSoundUri = Uri.parse("android.resource://" + context.getPackageName() + "/" + soundResId);
                        Log.d(TAG, "Alternative sound URI: " + alternativeSoundUri.toString());
                        
                        AudioAttributes audioAttributes = new AudioAttributes.Builder()
                                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                                .build();
                        
                        channel.setSound(alternativeSoundUri, audioAttributes);
                        Log.d(TAG, "Set alternative notification sound");
                    } else {
                        Log.e(TAG, "Custom sound resource not found");
                    }
                } catch (Exception e2) {
                    Log.e(TAG, "Error setting alternative notification sound", e2);
                }
            }
            
            notificationManager.createNotificationChannel(channel);
            Log.d(TAG, "Notification channel created successfully");
        }
    }
} 