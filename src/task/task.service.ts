import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { In, Repository } from 'typeorm';
import { MemberHome } from 'src/member_home/entities/member_home.entity';

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
      relations: ['home'],
    });

    if (!memberHome) {
      throw new ForbiddenException('User is not a member of this house');
    }

    // 2. Verificar miembros asignados
    const assignedTo = await this.memberHomeRepo.find({
      where: {
        home: { id: Number(createTaskDto.houseId) },
        id: In(createTaskDto.assignedTo),
      },
    });

    if (assignedTo.length !== createTaskDto.assignedTo.length) {
      throw new ForbiddenException(
        'Users assigned is not a member of this house',
      );
    }

    // 3. Crear tarea
    const task = this.taskRepo.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      date: createTaskDto.date,
      time: createTaskDto.time,
      duration: createTaskDto.duration,
      priority: createTaskDto.priority,
      // house: { id: createTaskDto.houseId },
      house: memberHome.home,
      assignedTo: assignedTo,
      // createdBy: { id: userId },
      createdBy: memberHome,
    });

    await this.taskRepo.save(task);

    return { task };
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
      relations: [
        'house',
        'assignedTo',
        'assignedTo.user',
        'createdBy',
        'createdBy.user',
      ],
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
