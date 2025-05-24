import { format, parseISO } from 'date-fns';
import { CheckCircle2, Circle, Clock, Flag, Repeat, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task, useTasks } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';
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
import { toast } from 'sonner';

interface CalendarTaskCardProps {
  task: Task;
}

export function CalendarTaskCard({ task }: CalendarTaskCardProps) {
  const { toggleTaskComplete, deleteTask } = useTasks();
  const [alertOpen, setAlertOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  
  if (isDeleted) {
    return null;
  }
  
  const getTimeDisplay = () => {
    if (task.startTime && task.endTime) {
      return `${task.startTime} - ${task.endTime}`;
    }
    if (task.startTime) {
      return task.startTime;
    }
    return null;
  };

  const getCategoryClass = () => {
    switch (task.category) {
      case 'Work': return 'category-work';
      case 'Personal': return 'category-personal';
      case 'Shopping': return 'category-shopping';
      case 'Health': return 'category-health';
      default: return '';
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'High': return 'text-primary';
      case 'Medium': return 'text-muted-foreground';
      case 'Low': return 'text-muted-foreground/70';
      default: return 'text-muted-foreground';
    }
  };
  
  const getPriorityCardClass = () => {
    switch (task.priority) {
      case 'High': return 'bg-red-900/10 dark:bg-red-500/10 border-red-500/20';
      case 'Medium': return 'bg-amber-900/10 dark:bg-amber-500/10 border-amber-500/20';
      case 'Low': return 'bg-green-900/10 dark:bg-green-500/10 border-green-500/20';
      default: return '';
    }
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setAlertOpen(false);
    setIsDeleted(true);
    toast.success('Task deleted successfully');
  };

  const timeDisplay = getTimeDisplay();
  const recurrenceText = task.recurrence !== 'none' ? task.recurrence.charAt(0).toUpperCase() + task.recurrence.slice(1) : '';

  return (
    <>
      <div className={cn(
        "task-card", 
        getPriorityCardClass(),
        task.completed && "opacity-60"
      )}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className={`category-badge ${getCategoryClass()}`}>
                {task.category}
              </span>
              {task.priority && (
                <span className={`inline-flex items-center text-xs ${getPriorityColor()}`}>
                  <Flag className="h-3 w-3 mr-1" />
                  {task.priority}
                </span>
              )}
              {task.recurrence !== 'none' && (
                <span className="text-xs text-muted-foreground flex items-center">
                  <Repeat className="h-3 w-3 mr-1" />
                  {recurrenceText}
                </span>
              )}
            </div>
            <h3 className={cn("text-lg font-medium", task.completed && "line-through text-muted-foreground")}>
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
            )}
            <div className="mt-4 flex items-center gap-4">
              {timeDisplay && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  <span>{timeDisplay}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleTaskComplete(task.id)}
                    className="h-8 w-8"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {task.completed ? "Mark as incomplete" : "Mark as complete"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAlertOpen(true)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Delete task
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task: "{task.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 