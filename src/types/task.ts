
import { TaskCategory, RecurrencePattern, TaskPriority } from '@/contexts/TaskContext';

export interface EditTaskData {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  category: TaskCategory;
  recurrence: RecurrencePattern;
  selectedDays?: string[];
  priority: TaskPriority;
}

export interface TaskFormProps {
  onSubmit?: () => void;
  editTask?: EditTaskData;
}
