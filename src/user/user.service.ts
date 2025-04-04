import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRO } from './user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserRO> {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new Error('Email already exists');
    }

    const user = this.userRepo.create(dto);
    const savedUser = await this.userRepo.save(user);

    return this.buildUserRO(savedUser);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  private buildUserRO(user: User) {
    const userRO = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return { user: userRO };
  }
}
