
import { format, parseISO } from 'date-fns';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task, useTasks } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { toggleTaskComplete } = useTasks();
  
  const getTimeDisplay = () => {
    if (task.startTime && task.endTime) {
      return `${task.startTime} - ${task.endTime}`;
    }
    if (task.startTime) {
      return `Start: ${task.startTime}`;
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

  const timeDisplay = getTimeDisplay();

  return (
    <div className={cn("task-card", task.completed && "opacity-60")}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className={`category-badge ${getCategoryClass()}`}>
              {task.category}
            </span>
            {task.recurrence !== 'none' && (
              <span className="text-xs text-muted-foreground">
                {task.recurrence.charAt(0).toUpperCase() + task.recurrence.slice(1)}
              </span>
            )}
          </div>
          <h3 className={cn("text-lg font-medium", task.completed && "line-through text-muted-foreground")}>
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
          )}
          <div className="mt-4 flex items-center gap-2">
            {timeDisplay && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                <span>{timeDisplay}</span>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              {format(parseISO(task.date), 'EEEE, MMMM d')}
            </div>
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleTaskComplete(task.id)}
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
      </div>
    </div>
  );
}
