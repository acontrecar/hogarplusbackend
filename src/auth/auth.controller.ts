import {
  Body,
  Controller,
  Get,
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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({
    type: LoginUserDto,
  })
  async login(@Body() user: LoginUserDto, @Req() req: Request) {
    const result = await this.authService.login(user.email, user.password);
    return buildResponse(result, req.url, 'Login successful', HttpStatus.OK);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBody({
    type: CreateUserDto,
  })
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check authentication status' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async checkStatus(
    @GetUser() userRequest: { id: number; email: string },
    @Req() req: Request,
  ) {
    const result = await this.authService.checkStatus(userRequest);
    return buildResponse(result, req.url, 'Token valid', HttpStatus.OK);
  }
}
