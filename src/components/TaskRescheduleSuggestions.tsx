import React, { useState, useEffect } from 'react';
import { Task, useTasks } from '@/contexts/TaskContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { addDays, format, isSameDay, parseISO } from 'date-fns';
import { CheckCircle, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface TaskRescheduleSuggestionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TaskSuggestion {
  task: Task;
  suggestedDate: Date;
  reason: string;
}

export function TaskRescheduleSuggestions({ open, onOpenChange }: TaskRescheduleSuggestionsProps) {
  const { tasks, updateTask } = useTasks();
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isRescheduling, setIsRescheduling] = useState(false);
  
  // Generate suggestions when the dialog opens
  useEffect(() => {
    if (open) {
      generateSuggestions();
    }
  }, [open, tasks]);

  // Generate task rescheduling suggestions based on priority, duration, etc.
  const generateSuggestions = () => {
    const today = new Date();
    const todaysTasks = tasks.filter(task => {
      const taskDate = parseISO(task.date);
      return isSameDay(taskDate, today) && !task.completed;
    });
    
    // Don't suggest anything if there aren't enough tasks
    if (todaysTasks.length <= 5) {
      setSuggestions([]);
      return;
    }

    // Sort by priority (High -> Medium -> Low)
    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
    const sortedTasks = [...todaysTasks].sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // Keep high priority tasks for today, suggest moving others
    const highPriorityTasks = sortedTasks.filter(task => task.priority === 'High');
    const otherTasks = sortedTasks.filter(task => task.priority !== 'High');
    
    // Generate suggestions for lower priority tasks
    const newSuggestions: TaskSuggestion[] = [];
    
    // Distribute tasks over the next few days based on priority
    otherTasks.forEach((task, index) => {
      // Calculate how many days to move the task
      // Medium priority tasks move to tomorrow, low priority to later days
      const daysToMove = task.priority === 'Medium' ? 1 : 1 + (index % 3);
      const suggestedDate = addDays(today, daysToMove);
      
      // Create the suggestion
      newSuggestions.push({
        task,
        suggestedDate,
        reason: task.priority === 'Medium' 
          ? 'Medium priority task can be done tomorrow'
          : `Low priority task can wait ${daysToMove} day${daysToMove > 1 ? 's' : ''}`
      });
    });
    
    // If we still have too many high priority tasks, suggest moving some
    if (highPriorityTasks.length > 5) {
      const extraHighPriorityTasks = highPriorityTasks.slice(5);
      extraHighPriorityTasks.forEach(task => {
        newSuggestions.push({
          task,
          suggestedDate: addDays(today, 1),
          reason: 'Too many high priority tasks today'
        });
      });
    }
    
    setSuggestions(newSuggestions);
    // Initially select all suggestions
    setSelectedTasks(newSuggestions.map(s => s.task.id));
  };

  // Toggle task selection
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Apply the selected rescheduling suggestions
  const applyRescheduling = () => {
    setIsRescheduling(true);
    
    // Get selected suggestions
    const selectedSuggestions = suggestions.filter(s => 
      selectedTasks.includes(s.task.id)
    );
    
    // Apply each suggestion
    selectedSuggestions.forEach(suggestion => {
      updateTask(suggestion.task.id, {
        date: suggestion.suggestedDate.toISOString()
      });
    });
    
    // Show success message and close dialog
    toast.success(`Rescheduled ${selectedSuggestions.length} tasks`);
    setIsRescheduling(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Task Rescheduling Suggestions</DialogTitle>
          <DialogDescription>
            You have {suggestions.length + 5} tasks scheduled for today. Here are some suggestions to make your day more manageable.
          </DialogDescription>
        </DialogHeader>

        {suggestions.length > 0 ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.task.id}
                className={`p-3 border rounded-lg flex items-start gap-3 transition-colors ${
                  selectedTasks.includes(suggestion.task.id) 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-background'
                }`}
                onClick={() => toggleTaskSelection(suggestion.task.id)}
              >
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-5 h-5 rounded-full border ${
                    selectedTasks.includes(suggestion.task.id)
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-muted-foreground'
                  } flex items-center justify-center`}>
                    {selectedTasks.includes(suggestion.task.id) && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{suggestion.task.title}</h3>
                  <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <div className="flex items-center text-primary">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>Move to {format(suggestion.suggestedDate, 'EEEE, MMM d')}</span>
                    </div>
                    {suggestion.task.startTime && (
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>at {suggestion.task.startTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No rescheduling suggestions available
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="sm:w-auto w-full"
          >
            Cancel
          </Button>
          <Button 
            onClick={applyRescheduling}
            disabled={selectedTasks.length === 0 || isRescheduling}
            className="sm:w-auto w-full"
          >
            {isRescheduling ? 'Rescheduling...' : `Reschedule ${selectedTasks.length} Tasks`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 