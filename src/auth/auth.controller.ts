import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { buildResponse } from 'src/common/helper/build-response.helper';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  // @HttpCode(HttpStatus.OK)
  async login(@Body('user') user: LoginUserDto, @Req() req: Request) {
    const result = await this.authService.login(user.email, user.password);
    return buildResponse(result, req.url, 'Login successful', HttpStatus.OK);
  }

  @Post('register')
  // @HttpCode(HttpStatus.CREATED)
  async create(
    @Body('user') createUserDto: CreateUserDto,
    @Req() req: Request,
  ) {
    const result = await this.authService.create(createUserDto);
    return buildResponse(
      result,
      req.url,
      'User created successfully',
      HttpStatus.CREATED,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async checkStatus(
    @GetUser() userRequest: { id: number; email: string },
    @Req() req: Request,
  ) {
    const result = await this.authService.checkStatus(userRequest);
    return buildResponse(result, req.url, 'Token valid', HttpStatus.OK);
  }
}
