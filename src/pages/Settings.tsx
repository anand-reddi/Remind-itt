
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { notificationsEnabled, toggleNotifications, sendTestNotification, clearAllNotifications } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the app looks and feels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme-toggle">Dark Mode</Label>
                <Switch
                  id="theme-toggle"
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <Switch 
                  id="push-notifications" 
                  checked={notificationsEnabled}
                  onCheckedChange={toggleNotifications}
                />
              </div>
              
              {notificationsEnabled && (
                <div className="pt-4 space-y-4">
                  <Button 
                    onClick={() => sendTestNotification()} 
                    variant="secondary" 
                    className="w-full"
                  >
                    Send Test Notification
                  </Button>
                  <Button 
                    onClick={() => clearAllNotifications()} 
                    variant="outline" 
                    className="w-full"
                  >
                    Clear All Notifications
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use these buttons to test if notifications are working properly 
                    and to clear all active notifications
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Snooze Options</CardTitle>
            <CardDescription>Configure reminder snooze durations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="w-full">5 minutes</Button>
              <Button variant="outline" className="w-full">10 minutes</Button>
              <Button variant="outline" className="w-full">30 minutes</Button>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              These are the default snooze durations for your reminders.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
