
import { format } from 'date-fns';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/TaskCard';
import { useTasks } from '@/contexts/TaskContext';
import { Link } from 'react-router-dom';

export function DailyTasks() {
  const [today] = useState(new Date());
  const { getTasksByDate } = useTasks();
  
  const tasks = getTasksByDate(today);
  const pendingTasks = tasks.filter(task => !task.completed);
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

      <div>
        <h3 className="mb-3 font-semibold">{pendingTasks.length > 0 ? `Pending (${pendingTasks.length})` : 'No pending tasks'}</h3>
        {pendingTasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {pendingTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">You're all caught up!</p>
          </div>
        )}
      </div>

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
