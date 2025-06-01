import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { In, Repository } from 'typeorm';
import { MemberHome } from 'src/member_home/entities/member_home.entity';
import { DeleteTaskDto } from './dto/delete-task.dto';

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
      relations: ['house', 'assignedTo', 'assignedTo.user', 'createdBy', 'createdBy.user'],
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
        role: member.role,
        createdAt: member.createdAt,
      })),
      createdBy: {
        id: createdTask.createdBy.id,
        name: createdTask.createdBy.user.name,
        role: createdTask.createdBy.role,
        createdAt: createdTask.createdBy.createdAt,
      },
    };

    return { task: formattedTask };
  }

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

    // 2. Obtener tareas con relaciones completas
    const tasks = await this.taskRepo.find({
      where: [
        {
          house: { id: houseId },
          createdBy: { id: memberHome.id },
        },
        {
          house: { id: houseId },
          assignedTo: { id: memberHome.id },
        },
      ],
      relations: ['house', 'assignedTo', 'assignedTo.user', 'createdBy', 'createdBy.user'],
    });

    // 3. Formatear la respuesta para incluir los nombres
    const formattedTasks = tasks.map((task) => ({
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
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.taskRepo.delete(task.id);
    return { task };
  }

  async completeTask(taskId: number, userId: number) {
    const task = await this.taskRepo.findOne({
      where: {
        id: taskId,
        assignedTo: {
          user: { id: userId },
        },
      },
      relations: [
        'assignedTo',
        'assignedTo.user',
        'house',
        'completedBy',
        'createdBy.user',
        'completedBy',
      ],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const memberHome = await this.memberHomeRepo.findOne({
      where: {
        user: { id: userId },
        home: { id: task.house.id },
      },
      relations: ['user'],
    });

    if (!memberHome) {
      throw new ForbiddenException('User is not a member of this house');
    }

    task.assignedTo = task.assignedTo.filter((member) => member.id !== memberHome.id);

    if (task.assignedTo.length === 0) {
      task.status = 'completed';
      task.completedBy = memberHome;
    }

    await this.taskRepo.save(task);

    const taskToReturn = {
      task: {
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
        completedBy: {
          id: task.completedBy?.id,
          name: task.completedBy?.user.name,
          role: task.completedBy?.role,
          createdAt: task.completedBy?.createdAt,
        },
      },
    };

    return {
      task: taskToReturn,
    };
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
