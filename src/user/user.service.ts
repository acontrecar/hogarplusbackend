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
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
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
    let oldAvatarPublicId: string | undefined;

    try {
      if (file) {
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        avatarUploadedUrl = uploadResult.secure_url;
        oldAvatarPublicId = user.avatarPublicId ?? undefined;
        oldAvatarUrl = user.avatar ?? undefined;
        user.avatar = avatarUploadedUrl;
        user.avatarPublicId = uploadResult.public_id;
      }

      const parsedDto =
        typeof updateUserDto === 'string'
          ? JSON.parse(updateUserDto)
          : updateUserDto;

      const cleanedDto: UpdateUserDto = Object.fromEntries(
        Object.entries(parsedDto).filter(
          ([_, v]) => v !== undefined && v !== '',
        ),
      );

      if (cleanedDto.password) {
        cleanedDto.password = await bcrypt.hash(cleanedDto.password, 10);
      }

      Object.assign(user, cleanedDto);

      this.logger.log(`Dto: ${JSON.stringify(cleanedDto)}`);

      // Object.assign(user, cleanedDto);

      const updatedUser = await this.userRepo.save(user);

      if (oldAvatarPublicId) {
        // await this.cloudinaryService.deleteFileByUrl(oldAvatarUrl);
        await this.cloudinaryService.deleteFile(oldAvatarPublicId);
      }

      const { password, ...result } = updatedUser;

      this.logger.log(`password: ${password}`);

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
