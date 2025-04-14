import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MemberHome } from 'src/member_home/entities/member_home.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, MemberHome]), MemberHome],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
