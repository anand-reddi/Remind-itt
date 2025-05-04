
package app.lovable.c67f43a71d9c4832a0327b70a14483fb;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.capacitorjs.plugins.localnotifications.LocalNotificationsPlugin;
import com.capacitorjs.plugins.pushnotifications.PushNotificationsPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register plugins manually to ensure they're properly initialized
        registerPlugin(LocalNotificationsPlugin.class);
        registerPlugin(PushNotificationsPlugin.class);
    }
}
