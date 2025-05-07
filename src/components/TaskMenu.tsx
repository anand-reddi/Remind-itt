import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Task, useTasks } from '@/contexts/TaskContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import TaskForm from './TaskForm';
import { parseISO } from 'date-fns';

interface TaskMenuProps {
  task: Task;
}

export function TaskMenu({ task }: TaskMenuProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const { deleteTask } = useTasks();
  const navigate = useNavigate();

  // Clean up all modals when component unmounts
  useEffect(() => {
    return () => {
      document.body.classList.remove('modal-open');
      // Force all focus-trap elements to be removed
      const focusTraps = document.querySelectorAll('[data-focus-trap]');
      focusTraps.forEach(trap => trap.remove());
    };
  }, []);

  const handleDelete = () => {
    deleteTask(task.id);

    // Ensure cleanup after state changes
    setTimeout(() => {
      setAlertOpen(false);
      toast.success('Task deleted successfully');
      
      // Force cleanup any stray overlays
      const overlays = document.querySelectorAll('[role="alertdialog"], [role="dialog"]');
      overlays.forEach(overlay => {
        if (overlay instanceof HTMLElement) {
          overlay.style.display = 'none';
        }
      });
      document.body.classList.remove('modal-open');
    }, 10);
  };

  const handleEdit = () => {
    setDialogOpen(true);
  };

  const handleEditClose = () => {
    // First close the dialog
    setDialogOpen(false);
    
    // Then apply comprehensive cleanup
    setTimeout(() => {
      // Force cleanup any stray overlays
      const overlays = document.querySelectorAll('[role="alertdialog"], [role="dialog"]');
      overlays.forEach(overlay => {
        if (overlay instanceof HTMLElement) {
          overlay.style.display = 'none';
        }
      });
      
      // Clean up modal related attributes
      document.body.classList.remove('modal-open');
      document.body.style.pointerEvents = 'auto';
      document.body.removeAttribute('aria-hidden');
      
      // Ensure all Radix portal elements are properly cleaned up
      const portals = document.querySelectorAll('[data-radix-portal]');
      portals.forEach(portal => {
        if (portal.childElementCount === 0 && portal instanceof HTMLElement) {
          portal.remove();
        }
      });
    }, 100);
  };

  const handleAlertOpenChange = (open: boolean) => {
    setAlertOpen(open);
    
    // Clean up focus handling when closing
    if (!open) {
      setTimeout(() => {
        document.body.classList.remove('modal-open');
      }, 100);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    
    // Clean up focus handling when closing
    if (!open) {
      setTimeout(() => {
        document.body.classList.remove('modal-open');
      }, 100);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setAlertOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={alertOpen} onOpenChange={handleAlertOpenChange}>
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

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSubmit={handleEditClose}
            editTask={{
              id: task.id,
              title: task.title,
              description: task.description,
              date: parseISO(task.date),
              startTime: task.startTime,
              endTime: task.endTime,
              category: task.category,
              recurrence: task.recurrence,
              priority: task.priority || 'Medium',
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
