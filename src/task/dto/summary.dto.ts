import { Task } from '../entities/task.entity';

export interface SummaryDto {
  tasksPending: number;
  tasksUrgy: number;
  tasksCompleted: number;
  upcomingTasks: Task[];
}
