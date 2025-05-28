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
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { requestStoragePermission, checkStoragePermission } from '@/lib/permissions';
import { FilePicker } from '@capawesome/capacitor-file-picker';

// Define the type for recurrence values that can be either number or empty string
type RecurrenceValue = number | '';

interface RecurrenceValues {
  daily: RecurrenceValue;
  weekly: RecurrenceValue;
  monthly: RecurrenceValue;
  yearly: RecurrenceValue;
}

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { notificationsEnabled, toggleNotifications, sendTestNotification } = useNotifications();
  const { recurrenceDefaults, updateRecurrenceDefaults } = useSettings();
  const { exportTasks, importTasks, deleteAllTasks } = useTasks();
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for recurrence defaults with proper typing
  const [recurrenceValues, setRecurrenceValues] = useState<RecurrenceValues>({
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

  const handleRecurrenceChange = (type: keyof RecurrenceValues, value: string) => {
    // Allow empty string to clear the input
    if (value === '') {
      setRecurrenceValues(prev => ({
        ...prev,
        [type]: ''
      }));
      return;
    }
    
    const numValue = parseInt(value, 10);
    
    // Allow any number including zero
    if (!isNaN(numValue) && numValue >= 0) {
      setRecurrenceValues(prev => ({
        ...prev,
        [type]: numValue
      }));
    }
  };

  const saveRecurrenceDefaults = () => {
    // Convert empty strings to default values or use a minimum value of 1
    const valuesToSave = {
      daily: recurrenceValues.daily === '' || recurrenceValues.daily === 0 ? 1 : recurrenceValues.daily,
      weekly: recurrenceValues.weekly === '' || recurrenceValues.weekly === 0 ? 1 : recurrenceValues.weekly,
      monthly: recurrenceValues.monthly === '' || recurrenceValues.monthly === 0 ? 1 : recurrenceValues.monthly,
      yearly: recurrenceValues.yearly === '' || recurrenceValues.yearly === 0 ? 1 : recurrenceValues.yearly
    };
    
    updateRecurrenceDefaults(valuesToSave);
    
    // Update local state with the saved values
    setRecurrenceValues(valuesToSave);
    
    toast.success('Recurrence settings saved');
  };

  const handleExportData = async () => {
    if (isExporting) return;
    
    try {
      setIsExporting(true);
      
      if (Capacitor.isNativePlatform()) {
        // First check if we have permission
        const hasPermission = await checkStoragePermission();
        
        if (!hasPermission) {
          // Request permission if we don't have it
          const granted = await requestStoragePermission();
          if (!granted) {
            setIsExporting(false);
            return;
          }
        }
      }
      
      toast.info('Preparing data for export...');
      
      const data = exportTasks();
      const fileName = `remind-itt-export-${new Date().toISOString().split('T')[0]}.json`;
      
      if (Capacitor.isNativePlatform()) {
        try {
          await Filesystem.writeFile({
            path: fileName,
            data: data,
            directory: Directory.Documents,
            encoding: Encoding.UTF8
          });
          
          toast.success('Data exported successfully to Documents folder');
        } catch (error) {
          console.error('Error exporting data to filesystem:', error);
          downloadBrowserFile(data, fileName);
        }
      } else {
        downloadBrowserFile(data, fileName);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Helper function for browser downloads
  const downloadBrowserFile = (data: string, fileName: string) => {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleImportClick = async () => {
    if (isImporting) return;
    
    if (Capacitor.isNativePlatform()) {
      // First check if we have permission
      const hasPermission = await checkStoragePermission();
      
      if (!hasPermission) {
        // Request permission if we don't have it
        const granted = await requestStoragePermission();
        if (!granted) {
          return;
        }
      }
      importNativeFile();
    } else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const importNativeFile = async () => {
    try {
      setIsImporting(true);
      toast.info('Selecting file to import...');
      
      try {
        // Use FilePicker plugin to pick files
        const result = await FilePicker.pickFiles({
          readData: true,
          types: ['application/json']
        });
        
        if (result.files && result.files.length > 0) {
          const file = result.files[0];
          let jsonData;
          
          if (file.data) {
            // Data is available directly from the plugin
            jsonData = atob(file.data);
          } else if (file.path) {
            // Native platforms - read file from path
            const fileContent = await Filesystem.readFile({
              path: file.path,
              encoding: Encoding.UTF8
            });
            jsonData = fileContent.data;
          }
          
          const success = importTasks(jsonData);
          if (success) {
            toast.success('Data imported successfully');
          } else {
            toast.error('Invalid data format');
          }
        } else {
          toast.error('No file selected');
        }
      } catch (error) {
        console.error('Error reading file:', error);
        toast.error('Failed to import file. Please make sure you select a valid JSON file.');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
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
      } finally {
        setIsImporting(false);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
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
              
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Important for Reliable Notifications</h4>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>
                    Please disable battery optimization or background restrictions for this app in your device settings to ensure you receive task reminders on time, even when the app is not in use.
                  </p>
                  <p className="font-medium">How to do this:</p>
                  <p>
                    Go to your device's Settings &gt; Apps &gt; [Remind itt] &gt; Battery/Background settings.
                    Select "Allow background activity" or "Don't optimize".
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recurrence Defaults</CardTitle>
            <CardDescription>Configure how far ahead recurring tasks are generated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="daily-recurrence">Daily Tasks (days)</Label>
                <Input
                  id="daily-recurrence"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={recurrenceValues.daily}
                  onChange={(e) => handleRecurrenceChange('daily', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekly-recurrence">Weekly Tasks (weeks)</Label>
                <Input
                  id="weekly-recurrence"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={recurrenceValues.weekly}
                  onChange={(e) => handleRecurrenceChange('weekly', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-recurrence">Monthly Tasks (months)</Label>
                <Input
                  id="monthly-recurrence"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={recurrenceValues.monthly}
                  onChange={(e) => handleRecurrenceChange('monthly', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearly-recurrence">Yearly Tasks (years)</Label>
                <Input
                  id="yearly-recurrence"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={recurrenceValues.yearly}
                  onChange={(e) => handleRecurrenceChange('yearly', e.target.value)}
                  className="w-full"
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
                disabled={isExporting}
              >
                <Download size={16} />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
              
              <Button 
                onClick={handleImportClick}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isImporting}
              >
                <Upload size={16} />
                {isImporting ? 'Importing...' : 'Import Data'}
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
              'Export your data to save a backup, or import previously exported data.'
              <br />Deleting all data will permanently remove all your tasks.
            </p>
          </CardContent>
        </Card>
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
