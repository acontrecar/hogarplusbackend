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

    return task;
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
