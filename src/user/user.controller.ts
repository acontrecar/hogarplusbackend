import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
  Patch,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { buildResponse } from 'src/common/helper/build-response.helper';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // create(@Body('user') createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get('me')
  // getMe(@Request() req) {
  //   return req.user;
  // }

  @UseGuards(JwtAuthGuard)
  @Patch()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Actualizar perfil de usuario' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuario actualizado correctamente' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadTest(
    @UploadedFile() file: Express.Multer.File,
    @Body('updateUserDto') updateUserDto: UpdateUserDto,
    @GetUser() user: User,
    @Req() req: Request,
  ) {
    const result = await this.userService.update(user.id, updateUserDto, file);
    return buildResponse(result, req.url, 'Usuario actualizado correctamente', HttpStatus.OK);
  }
}
