import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { buildResponse } from 'src/common/helper/build-response.helper';
import { DeleteTaskDto } from './dto/delete-task.dto';

@ApiTags('Tareas')
@ApiBearerAuth()
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiOperation({ summary: 'Crear una tarea' })
  @ApiBody({
    type: CreateTaskDto,
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @GetUser() user: User, @Req() req: Request) {
    const result = await this.taskService.create(createTaskDto, user.id);
    return buildResponse(result, req.url, 'Tarea creada correctamente', HttpStatus.CREATED);
  }

  @ApiOperation({ summary: 'Borrar una tarea' })
  @ApiBody({
    type: DeleteTaskDto,
  })
  @UseGuards(JwtAuthGuard)
  @Post('/house')
  async removeTaskByHouse(
    @Body() deleteTaskDto: DeleteTaskDto,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    const result = await this.taskService.removeTaskByHouse(deleteTaskDto, user.id);
    return buildResponse(result, req.url, 'Tarea eliminada correctamente');
  }

  @ApiOperation({ summary: 'Obtener todas las tareas de una casa' })
  @ApiParam({ name: 'houseId', description: 'Id de la casa', example: 2 })
  @UseGuards(JwtAuthGuard)
  @Get('/house/:houseId')
  async findTasksByHouse(
    @Param('houseId') houseId: string,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    const result = await this.taskService.findTasksByHouse(+houseId, user.id);
    return buildResponse(result, req.url, 'Tareas encontradas correctamente');
  }

  @ApiOperation({ summary: 'Marcar una tarea como completada' })
  @ApiParam({ name: 'taskId', description: 'Id de la tarea', example: 2 })
  @UseGuards(JwtAuthGuard)
  @Post('/complete/:taskId')
  async completeTask(@Param('taskId') taskId: string, @GetUser() user: User, @Req() req: Request) {
    const result = await this.taskService.completeTask(+taskId, user.id);
    return buildResponse(result, req.url, 'Tarea completada correctamente');
  }

  @ApiOperation({ summary: 'Obtener el resumen de tareas de una casa' })
  @ApiParam({ name: 'houseId', description: 'Id de la casa', example: 2 })
  @UseGuards(JwtAuthGuard)
  @Get('/:houseId/summary')
  async summary(@Param('houseId') houseId: string, @GetUser() user: User, @Req() req: Request) {
    const result = await this.taskService.summary(+houseId, user.id);
    return buildResponse(result, req.url, 'Resumen de tareas encontrado correctamente');
  }

  @ApiOperation({ summary: 'Obtener las tareas urgentes de una casa' })
  @ApiParam({ name: 'houseId', description: 'Id de la casa', example: 2 })
  @UseGuards(JwtAuthGuard)
  @Get('/:houseId/urgyTasks')
  async urgyTasks(@Param('houseId') houseId: string, @GetUser() user: User, @Req() req: Request) {
    const result = await this.taskService.getUrgyTasks(+houseId, user.id);
    return buildResponse(result, req.url, 'Tareas urgentes encontradas correctamente');
  }

  // @Get()
  // findAll() {
  //   return this.taskService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.taskService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
  //   return this.taskService.update(+id, updateTaskDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.taskService.remove(+id);
  // }
}
