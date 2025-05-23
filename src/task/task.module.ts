import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { MemberHome } from 'src/member_home/entities/member_home.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, MemberHome])],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
