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
import { HomeService } from './home.service';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { buildResponse } from 'src/common/helper/build-response.helper';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Home')
@ApiBearerAuth()
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear una nueva casa' })
  @Post()
  async create(@Body() createHomeDto: CreateHomeDto, @GetUser() user: User, @Req() req: Request) {
    const result = await this.homeService.create(createHomeDto, user.id);
    return buildResponse(result, req.url, 'Casa creada correctamente', HttpStatus.CREATED);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener todas las casas en la que esta el usuario' })
  @Get()
  async findHomesByUserId(@GetUser() user: User, @Req() req: Request) {
    const result = await this.homeService.findHomesByUserId(user.id);
    return buildResponse(result, req.url, 'Casa encontrada exitosamente', HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener detalles de una casa' })
  @ApiParam({ name: 'id', description: 'Id de la casa', example: 1 })
  @Get(':id')
  async findHomeDetails(@Param('id') homeId: string, @GetUser() user: User, @Req() req: Request) {
    const result = await this.homeService.findHomeDetails(homeId, user.id);
    return buildResponse(result, req.url, 'Casa encontrada exitosamente', HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar una casa' })
  @ApiParam({ name: 'id', description: 'Id de la casa', example: 1 })
  @Delete(':id')
  async remove(@Param('id') homeId: string, @GetUser() user: User, @Req() req: Request) {
    const result = await this.homeService.deleteHome(+homeId, user.id);
    return buildResponse(result, req.url, 'Casa eliminada exitosamente', HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Borrar a un miembro de una casa (creador del hogar)' })
  @ApiParam({ name: 'id', description: 'Id de la casa', example: 1 })
  @ApiParam({
    name: 'personId',
    description: 'Id de la persona a eliminar',
    example: 5,
  })
  @Delete(':id/person/:personId')
  async deletePerson(
    @Param('id') homeId: string,
    @Param('personId') personId: string,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    const result = await this.homeService.deletePerson(+homeId, user.id, +personId);
    return buildResponse(
      result,
      req.url,
      'Persona eliminada de la casa correctamente',
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Salir de un hogar' })
  @ApiParam({ name: 'id', description: 'Id de la casa', example: 1 })
  @Delete('exit/:id')
  async exitFromHome(@Param('id') homeId: string, @GetUser() user: User, @Req() req: Request) {
    const result = await this.homeService.exitFromHome(+homeId, user.id);
    return buildResponse(result, req.url, 'Salida de la casa exitosa', HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Unirse a una casa con un código de invitación' })
  @ApiParam({ name: 'code', description: 'Codigo de invitación', example: 'ABC123' })
  @Post('join/:code')
  async joinHome(@Param('code') code: string, @GetUser() user: User, @Req() req: Request) {
    const result = await this.homeService.joinHome(code, user.id);
    return buildResponse(result, req.url, 'Unido a la casa correctamente', HttpStatus.OK);
  }

  // @Get()
  // findAll() {
  //   return this.homeService.findAll();
  // }
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener todas las casas del usuario y los miembros de la misma' })
  @Get('/user/get')
  async findAllHomesByUser(@GetUser() user: User, @Req() req: Request) {
    const result = await this.homeService.findAllHomesByUser(user.id);
    return buildResponse(result, req.url, 'Casa encontrada exitosamente', HttpStatus.OK);
  }
}
