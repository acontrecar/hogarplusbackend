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

  @Get()
  findAll() {
    return this.homeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.homeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHomeDto: UpdateHomeDto) {
    return this.homeService.update(+id, updateHomeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.homeService.remove(+id);
  }
}
