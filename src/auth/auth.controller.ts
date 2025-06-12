import { Body, Controller, Get, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { buildResponse } from 'src/common/helper/build-response.helper';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión de un usuario' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiBody({
    type: LoginUserDto,
  })
  async login(@Body() user: LoginUserDto, @Req() req: Request) {
    const result = await this.authService.login(user.email, user.password);
    return buildResponse(result, req.url, 'Login correcto', HttpStatus.OK);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado correctamente' })
  @ApiResponse({ status: 400, description: 'Error de validación' })
  @ApiBody({
    type: CreateUserDto,
  })
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    const result = await this.authService.create(createUserDto);
    return buildResponse(result, req.url, 'Usuario creado correctamente', HttpStatus.CREATED);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar estado de autenticación' })
  @ApiResponse({ status: 200, description: 'Token válido' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  async checkStatus(@GetUser() userRequest: { id: number; email: string }, @Req() req: Request) {
    const result = await this.authService.checkStatus(userRequest);
    return buildResponse(result, req.url, 'Token valido', HttpStatus.OK);
  }
}
