import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { MemberHome } from 'src/member_home/entities/member_home.entity';
import { DeleteTaskDto } from './dto/delete-task.dto';
import { SummaryDto } from './dto/summary.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(MemberHome)
    private readonly memberHomeRepo: Repository<MemberHome>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: number) {
    // 1. Verificar que el usuario es miembro de la casa
    const memberHome = await this.memberHomeRepo.findOne({
      where: {
        user: { id: userId },
        home: { id: Number(createTaskDto.houseId) },
      },
      relations: ['home', 'user'],
    });

    if (!memberHome) {
      throw new ForbiddenException('User is not a member of this house');
    }

    // 2. Verificar miembros asignados (con relación a user)
    const assignedTo = await this.memberHomeRepo.find({
      where: {
        home: { id: Number(createTaskDto.houseId) },
        id: In(createTaskDto.assignedTo),
      },
      relations: ['user'],
    });

    if (assignedTo.length !== createTaskDto.assignedTo.length) {
      throw new ForbiddenException('Users assigned is not a member of this house');
    }

    // 3. Crear tarea
    const task = this.taskRepo.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      date: createTaskDto.date,
      time: createTaskDto.time,
      duration: createTaskDto.duration,
      priority: createTaskDto.priority,
      house: memberHome.home,
      assignedTo: assignedTo,
      createdBy: memberHome,
    });
    await this.taskRepo.save(task);

    // 4. Obtener la tarea recién creada con todas las relaciones
    const createdTask = await this.taskRepo.findOne({
      where: { id: task.id },
      relations: [
        'house',
        'assignedTo',
        'assignedTo.user',
        'createdBy',
        'createdBy.user',
        'completedBy',
        'completedBy.user',
        'createdBy.user',
      ],
    });

    if (!createdTask) {
      throw new NotFoundException('Task not found after creation');
    }

    // 5. Formatear la respuesta para agregar el nombre de los miembros
    const formattedTask = {
      ...createdTask,
      assignedTo: createdTask.assignedTo.map((member) => ({
        id: member.id,
        name: member.user.name,
        userId: member.user.id,
        role: member.role,
        createdAt: member.createdAt,
      })),
      createdBy: {
        id: createdTask.createdBy.id,
        name: createdTask.createdBy.user.name,
        userId: createdTask.createdBy.user.id,
        role: createdTask.createdBy.role,
        createdAt: createdTask.createdBy.createdAt,
      },
    };

    return { task: formattedTask };
  }

  // async findTasksByHouse(houseId: number, userId: number) {
  //   // 1. Verificar que el usuario es miembro de la casa
  //   const memberHome = await this.memberHomeRepo.findOne({
  //     where: {
  //       user: { id: userId },
  //       home: { id: houseId },
  //     },
  //     relations: ['home', 'user'],
  //   });

  //   if (!memberHome) {
  //     throw new ForbiddenException('User is not a member of this house');
  //   }

  //   // 2. Obtener tareas con relaciones completas
  //   const tasks = await this.taskRepo.find({
  //     where: [
  //       {
  //         house: { id: houseId },
  //         createdBy: { id: memberHome.id },
  //       },
  //       {
  //         house: { id: houseId },
  //         assignedTo: { id: memberHome.id },
  //       },
  //     ],
  //     relations: [
  //       'house',
  //       'assignedTo',
  //       'assignedTo.user',
  //       'createdBy',
  //       'createdBy.user',
  //       'completedBy',
  //       'completedBy.user',
  //       'createdBy.user',
  //     ],
  //   });

  //   // 3. Formatear la respuesta para incluir los nombres
  //   const formattedTasks = tasks.map((task) => ({
  //     ...task,
  //     assignedTo: task.assignedTo.map((member) => ({
  //       id: member.id,
  //       name: member.user.name,
  //       userId: member.user.id,
  //       role: member.role,
  //       createdAt: member.createdAt,
  //     })),
  //     createdBy: {
  //       id: task.createdBy.id,
  //       userId: task.createdBy.user.id,
  //       name: task.createdBy.user.name,
  //       role: task.createdBy.role,
  //       createdAt: task.createdBy.createdAt,
  //     },
  //     completedBy: task.completedBy?.map((member) => ({
  //       id: member?.id,
  //       name: member?.user?.name,
  //       userId: member?.user?.id,
  //       role: member?.role,
  //       createdAt: member?.createdAt,
  //     })),
  //   }));

  //   return { tasks: formattedTasks };
  // }

  async findTasksByHouse(houseId: number, userId: number) {
    // 1. Verificar que el usuario es miembro de la casa
    const memberHome = await this.memberHomeRepo.findOne({
      where: {
        user: { id: userId },
        home: { id: houseId },
      },
      relations: ['home', 'user'],
    });

    if (!memberHome) {
      throw new ForbiddenException('User is not a member of this house');
    }

    // 2. Primero obtener los IDs de las tareas donde el usuario participa
    const taskIds = await this.taskRepo
      .createQueryBuilder('task')
      .leftJoin('task.assignedTo', 'assigned')
      .where('task.house.id = :houseId', { houseId })
      .andWhere('(task.createdBy.id = :memberHomeId OR assigned.id = :memberHomeId)', {
        memberHomeId: memberHome.id,
      })
      .select('task.id')
      .getMany();

    // 3. Obtener las tareas completas con todas sus relaciones
    const tasks = await this.taskRepo.find({
      where: {
        id: In(taskIds.map((task) => task.id)),
      },
      relations: [
        'house',
        'assignedTo',
        'assignedTo.user',
        'createdBy',
        'createdBy.user',
        'completedBy',
        'completedBy.user',
      ],
    });

    // 4. Formatear la respuesta (tu código actual está bien)
    const formattedTasks = tasks.map((task) => ({
      ...task,
      assignedTo: task.assignedTo.map((member) => ({
        id: member.id,
        name: member.user.name,
        userId: member.user.id,
        role: member.role,
        createdAt: member.createdAt,
      })),
      createdBy: {
        id: task.createdBy.id,
        userId: task.createdBy.user.id,
        name: task.createdBy.user.name,
        role: task.createdBy.role,
        createdAt: task.createdBy.createdAt,
      },
      completedBy: task.completedBy?.map((member) => ({
        id: member?.id,
        name: member?.user?.name,
        userId: member?.user?.id,
        role: member?.role,
        createdAt: member?.createdAt,
      })),
    }));

    return { tasks: formattedTasks };
  }

  async removeTaskByHouse(deleteTaskDto: DeleteTaskDto, userId: number) {
    const { houseId, taskId } = deleteTaskDto;

    const task = await this.taskRepo.findOne({
      where: {
        id: taskId,
        house: { id: houseId },
        createdBy: {
          user: { id: userId },
        },
      },
      relations: [
        'house',
        'assignedTo',
        'assignedTo.user',
        'createdBy',
        'createdBy.user',
        'completedBy',
        'completedBy.user',
      ],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.taskRepo.delete(task.id);

    const taskToReturn = {
      ...task,
      assignedTo: task.assignedTo.map((member) => ({
        id: member.id,
        name: member.user.name,
        role: member.role,
        createdAt: member.createdAt,
      })),
      createdBy: {
        id: task.createdBy.id,
        name: task.createdBy.user.name,
        role: task.createdBy.role,
        createdAt: task.createdBy.createdAt,
      },
      completedBy: task.completedBy?.map((member) => ({
        id: member.id,
        name: member.user.name,
        role: member.role,
        createdAt: member.createdAt,
      })),
    };

    return { task: taskToReturn };
  }

  // async completeTask(taskId: number, userId: number) {
  //   const task = await this.taskRepo.findOne({
  //     where: {
  //       id: taskId,
  //       assignedTo: {
  //         user: { id: userId },
  //       },
  //     },
  //     relations: [
  //       'assignedTo',
  //       'assignedTo.user',
  //       'house',
  //       'completedBy',
  //       'createdBy.user',
  //       'completedBy.user',
  //     ],
  //   });

  //   if (!task) {
  //     throw new NotFoundException('Tarea no encontrada');
  //   }

  //   const memberHome = await this.memberHomeRepo.findOne({
  //     where: {
  //       user: { id: userId },
  //       home: { id: task.house.id },
  //     },
  //     relations: ['user'],
  //   });

  //   if (!memberHome) {
  //     throw new ForbiddenException('Usuario no es miembro de la casa');
  //   }

  //   task.assignedTo = task.assignedTo.filter((member) => member.id !== memberHome.id);

  //   task.completedBy?.push(memberHome);

  //   if (task.assignedTo.length === 0) {
  //     task.status = 'completed';
  //   }

  //   await this.taskRepo.save(task);

  //   const taskToReturn = {
  //     ...task,
  //     assignedTo: task.assignedTo.map((member) => ({
  //       id: member.id,
  //       name: member.user.name,
  //       userId: member.user.id,
  //       role: member.role,
  //       createdAt: member.createdAt,
  //     })),
  //     createdBy: {
  //       id: task.createdBy.id,
  //       name: task.createdBy.user.name,
  //       userId: task.createdBy?.user?.id,
  //       role: task.createdBy.role,
  //       createdAt: task.createdBy.createdAt,
  //     },
  //     completedBy: task.completedBy?.map((member) => ({
  //       id: member.id,
  //       name: member.user.name,
  //       userId: member?.user?.id,
  //       role: member.role,
  //       createdAt: member.createdAt,
  //     })),
  //   };

  //   return {
  //     task: taskToReturn,
  //   };
  // }

  async completeTask(taskId: number, userId: number) {
    // 1. Buscar la tarea y verificar que el usuario esté asignado

    const taskExists = await this.taskRepo.findOne({
      where: {
        id: taskId,
        assignedTo: {
          user: { id: userId },
        },
      },
      relations: ['assignedTo', 'assignedTo.user'],
    });

    if (!taskExists) {
      throw new NotFoundException('Tarea no encontrada o el usuario no está asignado a la tarea');
    }

    const task = await this.taskRepo.findOne({
      where: {
        id: taskId,
        // assignedTo: {
        //   user: { id: In([userId]) },
        // },
      },
      relations: [
        'assignedTo',
        'assignedTo.user',
        'house',
        'completedBy',
        'completedBy.user',
        'createdBy',
        'createdBy.user',
      ],
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada o el usuario no está asignado a la tarea');
    }

    // 2. Obtener el memberHome del usuario
    const memberHome = await this.memberHomeRepo.findOne({
      where: {
        user: { id: userId },
        home: { id: task.house.id },
      },
      relations: ['user'],
    });

    if (!memberHome) {
      throw new ForbiddenException('El usuario no es miembro de la casa');
    }

    // 3. Verificar que el usuario no haya completado ya la tarea
    const alreadyCompleted = task.completedBy?.some((member) => member.id === memberHome.id);
    if (alreadyCompleted) {
      throw new BadRequestException('El usuario ya ha completado esta tarea');
    }

    // 4. Remover el usuario de assignedTo
    task.assignedTo = task.assignedTo.filter((member) => member.id !== memberHome.id);

    // 5. Agregar el usuario a completedBy (inicializar si es null/undefined)
    if (!task.completedBy) {
      task.completedBy = [];
    }
    task.completedBy.push(memberHome);

    // 6. Si no quedan usuarios asignados, marcar como completada
    if (task.assignedTo.length === 0) {
      task.status = 'completed';
    }

    // 7. Guardar los cambios
    await this.taskRepo.save(task);

    // 8. Formatear la respuesta
    const taskToReturn = {
      ...task,
      assignedTo: task.assignedTo.map((member) => ({
        id: member.id,
        name: member.user.name,
        userId: member.user.id,
        role: member.role,
        createdAt: member.createdAt,
      })),
      createdBy: {
        id: task.createdBy.id,
        name: task.createdBy.user.name,
        userId: task.createdBy.user.id,
        role: task.createdBy.role,
        createdAt: task.createdBy.createdAt,
      },
      completedBy: task.completedBy?.map((member) => ({
        id: member.id,
        name: member.user.name,
        userId: member.user.id,
        role: member.role,
        createdAt: member.createdAt,
      })),
    };

    return {
      task: taskToReturn,
    };
  }

  async summary(houseId: number, userId: number): Promise<SummaryDto> {
    const tasks = await this.taskRepo.find({
      where: {
        house: { id: houseId },
        assignedTo: {
          user: { id: userId },
        },
      },
      relations: [
        // 'assignedTo',
        // 'assignedTo.user',
        // 'house',
        // 'completedBy',
        // 'createdBy.user',
        // 'completedBy.user',
      ],
    });

    const pendingTasks = tasks.filter((task) => task.status === 'pending');
    const numberOfTasksUrgent = pendingTasks.filter((task) => task.priority === 'high').length;

    const today = new Date(Date.now());
    today.setHours(0, 0, 0, 0);

    const upcomingTasks = pendingTasks.filter((tasks) => new Date(tasks.date) >= today).slice(0, 3);
    const tasksCompleted = tasks.length - pendingTasks.length;

    return {
      tasksPending: pendingTasks.length,
      tasksUrgy: numberOfTasksUrgent,
      tasksCompleted,
      upcomingTasks,
    };
  }

  async getUrgyTasks(houseId: number, userId: number) {
    const tasks = await this.taskRepo.find({
      where: {
        house: { id: houseId },
        assignedTo: {
          user: { id: userId },
        },
      },
      relations: [
        // 'assignedTo',
        // 'assignedTo.user',
        // 'house',
        // 'completedBy',
        // 'createdBy.user',
        // 'completedBy.user',
      ],
    });

    const urgyTasks = tasks.filter((task) => task.priority === 'high' && task.status === 'pending');

    return { urgyTasks };
  }

  findAll() {
    return `This action returns all task`;
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
