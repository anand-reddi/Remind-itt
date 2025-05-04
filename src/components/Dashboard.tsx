import React, { useState, useEffect } from 'react';
import { DailyTasks } from './DailyTasks';
import { useTasks } from '@/contexts/TaskContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { getTodaysTasks } = useTasks();
  const { showNotification } = useNotifications();
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there are too many tasks today (in a real app, this would be more sophisticated)
    const todaysTasks = getTodaysTasks();
    const incompleteTasks = todaysTasks.filter(t => !t.completed);
    
    if (incompleteTasks.length > 5) {
      setShowAiSuggestion(true);
    }
  }, [getTodaysTasks]);

  const handleRescheduleSuggestion = () => {
    // In a real implementation, this would open a dialog to help reschedule tasks
    // For now, just redirect to weekly view
    navigate('/calendar');
    setShowAiSuggestion(false);
  };

  return (
    <div className="space-y-8">
      {showAiSuggestion && (
        <Alert className="bg-primary/10 text-primary border-primary/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>You have a lot of tasks scheduled for today. Would you like help rescheduling some?</span>
              <button 
                onClick={handleRescheduleSuggestion}
                className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
              >
                View Suggestions
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <DailyTasks />
    </div>
  );
}
