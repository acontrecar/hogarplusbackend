import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { UserRegisterRO } from './auth.interfaces';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private userService: UserService,
    private jwtService: JwtService,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    this.logger.log(`COntrase: ${user.password}`);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    throw new UnauthorizedException('Credenciales incorrectas');
  }

  getJwtToken(payload: { id: number; email: string }) {
    return this.jwtService.sign(payload);
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { id: user.id, email: user.email };
    return {
      user,
      token: this.jwtService.sign(payload),
    };
  }

  async create(dto: CreateUserDto): Promise<UserRegisterRO> {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('El email ya existe');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword,
    });
    // const savedUser = await this.userRepo.save(user);

    // return this.buildUserRO(savedUser);
    await this.userRepo.save(user);
    const userRO = this.userService.buildUserRO(user);

    return {
      user: userRO,
      token: this.getJwtToken({
        email: user.email,
        id: user.id,
      }),
    };
  }

  async checkStatus(userRequest: { id: number; email: string }) {
    const user = await this.userService.findById(userRequest.id);
    return {
      user,
      token: this.getJwtToken({
        email: user.email,
        id: user.id,
      }),
    };
  }
}
