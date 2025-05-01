import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { mapDtoToEntity } from 'src/common/helper/mapDtoToEntity.helper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateUserDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const user = this.userRepo.create(dto);
    const savedUser = await this.userRepo.save(user);

    return this.buildUserRO(savedUser);
    // await this.userRepo.save(user);
    // const userRO = this.buildUserRO(user);
    // return {
    //   user: userRO,
    //   token: this.authService.getJwtToken({
    //     email: user.email,
    //     id: user.id,
    //   }),
    // };
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto | string,
    file?: Express.Multer.File,
  ) {
    const user = await this.findById(id);

    let avatarUploadedUrl: string | undefined;
    let oldAvatarUrl: string | undefined;

    try {
      if (file) {
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        avatarUploadedUrl = uploadResult.secure_url;
        oldAvatarUrl = user.avatar ?? undefined;
        user.avatar = avatarUploadedUrl;
      }

      const parsedDto =
        typeof updateUserDto === 'string'
          ? JSON.parse(updateUserDto)
          : updateUserDto;

      Object.assign(user, parsedDto);

      const updatedUser = await this.userRepo.save(user);

      if (oldAvatarUrl) {
        await this.cloudinaryService.deleteFileByUrl(oldAvatarUrl);
      }

      const { password, ...result } = updatedUser;

      return result;
    } catch (error) {
      if (avatarUploadedUrl) {
        await this.cloudinaryService.deleteFileByUrl(avatarUploadedUrl);
      }
      throw new InternalServerErrorException('Failed to update user profile.');
    }
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  buildUserRO(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
