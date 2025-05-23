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
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Home')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createHomeDto: CreateHomeDto,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    const result = await this.homeService.create(createHomeDto, user.id);
    return buildResponse(
      result,
      req.url,
      'Home created successfully',
      HttpStatus.CREATED,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findHomesByUserId(@GetUser() user: User, @Req() req: Request) {
    const result = await this.homeService.findHomesByUserId(user.id);
    return buildResponse(
      result,
      req.url,
      'Home found successfully',
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findHomeDetails(
    @Param('id') homeId: string,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    const result = await this.homeService.findHomeDetails(homeId, user.id);
    return buildResponse(
      result,
      req.url,
      'Home found successfully',
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') homeId: string,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    const result = await this.homeService.deleteHome(+homeId, user.id);
    return buildResponse(
      result,
      req.url,
      'Home deleted successfully',
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/person/:personId')
  async deletePerson(
    @Param('id') homeId: string,
    @Param('personId') personId: string,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    const result = await this.homeService.deletePerson(
      +homeId,
      user.id,
      +personId,
    );
    return buildResponse(
      result,
      req.url,
      'Person deleted from home successfully',
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('exit/:id')
  async exitFromHome(
    @Param('id') homeId: string,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    const result = await this.homeService.exitFromHome(+homeId, user.id);
    return buildResponse(
      result,
      req.url,
      'Home exited successfully',
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('join/:code')
  async joinHome(
    @Param('code') code: string,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    const result = await this.homeService.joinHome(code, user.id);
    return buildResponse(
      result,
      req.url,
      'Home joined successfully',
      HttpStatus.OK,
    );
  }

  @Get()
  findAll() {
    return this.homeService.findAll();
  }
  @UseGuards(JwtAuthGuard)
  @Get('/user/get')
  async findAllHomesByUser(@GetUser() user: User, @Req() req: Request) {
    const result = await this.homeService.findAllHomesByUser(user.id);
    return buildResponse(
      result,
      req.url,
      'Home found successfully',
      HttpStatus.OK,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.homeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHomeDto: UpdateHomeDto) {
    return this.homeService.update(+id, updateHomeDto);
  }
}
