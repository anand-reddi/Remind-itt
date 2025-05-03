
import TaskForm from '@/components/TaskForm';

const AddTask = () => {
  return (
    <div className="max-w-2xl mx-auto pb-16 md:pb-0 animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Add New Task</h1>
      <TaskForm />
    </div>
  );
};

export default AddTask;
