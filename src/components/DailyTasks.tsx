
import { format } from 'date-fns';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/TaskCard';
import { useTasks, TaskPriority } from '@/contexts/TaskContext';
import { Link } from 'react-router-dom';

// Helper function to get tasks by priority
const getTasksByPriority = (tasks: any[], priority: TaskPriority) => {
  return tasks.filter(task => task.priority === priority && !task.completed);
};

export function DailyTasks() {
  const [today] = useState(new Date());
  const { getTasksByDate } = useTasks();
  
  const tasks = getTasksByDate(today);
  const highPriorityTasks = getTasksByPriority(tasks, 'High');
  const mediumPriorityTasks = getTasksByPriority(tasks, 'Medium');
  const lowPriorityTasks = getTasksByPriority(tasks, 'Low');
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Today's Tasks</h2>
          <p className="text-muted-foreground">{format(today, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Link to="/add">
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            <span>Add Reminder</span>
          </Button>
        </Link>
      </div>

      {/* High Priority Tasks */}
      {highPriorityTasks.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 font-semibold text-priority-high">High Priority ({highPriorityTasks.length})</h3>
          <div className="grid grid-cols-1 gap-3">
            {highPriorityTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Medium Priority Tasks */}
      {mediumPriorityTasks.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 font-semibold text-priority-medium">Medium Priority ({mediumPriorityTasks.length})</h3>
          <div className="grid grid-cols-1 gap-3">
            {mediumPriorityTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Low Priority Tasks */}
      {lowPriorityTasks.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 font-semibold text-priority-low">Low Priority ({lowPriorityTasks.length})</h3>
          <div className="grid grid-cols-1 gap-3">
            {lowPriorityTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* No Tasks Message */}
      {highPriorityTasks.length === 0 && mediumPriorityTasks.length === 0 && lowPriorityTasks.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center mb-6">
          <p className="text-muted-foreground">You're all caught up!</p>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 font-semibold">Completed ({completedTasks.length})</h3>
          <div className="grid grid-cols-1 gap-3">
            {completedTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
