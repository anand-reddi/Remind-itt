import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useTasks } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState, useRef } from 'react';
import { toast } from '@/components/ui/sonner';
import { Download, Upload, Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { notificationsEnabled, toggleNotifications, sendTestNotification } = useNotifications();
  const { recurrenceDefaults, updateRecurrenceDefaults } = useSettings();
  const { exportTasks, importTasks, deleteAllTasks } = useTasks();
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for recurrence defaults
  const [recurrenceValues, setRecurrenceValues] = useState({
    daily: recurrenceDefaults.daily,
    weekly: recurrenceDefaults.weekly,
    monthly: recurrenceDefaults.monthly,
    yearly: recurrenceDefaults.yearly
  });

  const handleTestNotification = async () => {
    // Prevent multiple clicks
    if (isTestingNotification) return;
    
    try {
      setIsTestingNotification(true);
      toast.info('Sending test notification...');
      
      // Add a small delay before sending to allow UI to update
      setTimeout(async () => {
        try {
          await sendTestNotification();
          // Success is handled by the sendTestNotification function
        } catch (error) {
          console.error('Error sending test notification:', error);
          toast.error('Failed to send notification');
        } finally {
          // Reset button after a short delay
          setTimeout(() => {
            setIsTestingNotification(false);
          }, 3000);
        }
      }, 500);
    } catch (error) {
      console.error('Error in test notification handler:', error);
      setIsTestingNotification(false);
    }
  };

  const handleRecurrenceChange = (type: 'daily' | 'weekly' | 'monthly' | 'yearly', value: string) => {
    const numValue = parseInt(value, 10);
    
    // Validate input
    if (isNaN(numValue) || numValue < 1) {
      return;
    }
    
    setRecurrenceValues(prev => ({
      ...prev,
      [type]: numValue
    }));
  };

  const saveRecurrenceDefaults = () => {
    updateRecurrenceDefaults(recurrenceValues);
    toast.success('Recurrence settings saved');
  };

  const handleExportData = () => {
    try {
      const data = exportTasks();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `task-spark-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = event.target?.result as string;
        const success = importTasks(jsonData);
        
        if (success) {
          toast.success('Data imported successfully');
        } else {
          toast.error('Invalid data format');
        }
      } catch (error) {
        console.error('Error importing data:', error);
        toast.error('Failed to import data');
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const handleDeleteAllData = () => {
    deleteAllTasks();
    setDeleteDialogOpen(false);
    toast.success('All data deleted successfully');
  };

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
                <div className="pt-4">
                  <Button 
                    onClick={handleTestNotification} 
                    variant="secondary" 
                    className="w-full"
                    disabled={isTestingNotification}
                  >
                    {isTestingNotification ? 'Sending...' : 'Send Test Notification'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use this button to test if notifications are working properly
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recurrence Defaults</CardTitle>
            <CardDescription>Configure how far ahead recurring tasks are generated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="daily-recurrence">Daily Tasks (days)</Label>
                <Input
                  id="daily-recurrence"
                  type="number"
                  min="1"
                  value={recurrenceValues.daily}
                  onChange={(e) => handleRecurrenceChange('daily', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekly-recurrence">Weekly Tasks (weeks)</Label>
                <Input
                  id="weekly-recurrence"
                  type="number"
                  min="1"
                  value={recurrenceValues.weekly}
                  onChange={(e) => handleRecurrenceChange('weekly', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-recurrence">Monthly Tasks (months)</Label>
                <Input
                  id="monthly-recurrence"
                  type="number"
                  min="1"
                  value={recurrenceValues.monthly}
                  onChange={(e) => handleRecurrenceChange('monthly', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearly-recurrence">Yearly Tasks (years)</Label>
                <Input
                  id="yearly-recurrence"
                  type="number"
                  min="1"
                  value={recurrenceValues.yearly}
                  onChange={(e) => handleRecurrenceChange('yearly', e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={saveRecurrenceDefaults} 
              className="w-full mt-4"
            >
              Save Recurrence Settings
            </Button>
            <p className="text-xs text-muted-foreground">
              These settings control how far into the future recurring tasks will be generated.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Import, export, or delete your task data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={handleExportData}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export Data
              </Button>
              
              <Button 
                onClick={handleImportClick}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Upload size={16} />
                Import Data
              </Button>
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
            
            <Button 
              onClick={() => setDeleteDialogOpen(true)}
              variant="destructive"
              className="w-full mt-2 flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Delete All Data
            </Button>
            <p className="text-xs text-muted-foreground">
              Export your data to save a backup, or import previously exported data.
              Deleting all data will permanently remove all your tasks.
            </p>
          </CardContent>
        </Card>
        
        {/* <Card>
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
        </Card> */}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your tasks and cannot be undone. 
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAllData}>
              Yes, Delete All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
