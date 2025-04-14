import { Module } from '@nestjs/common';
import { MemberHomeService } from './member_home.service';
import { MemberHomeController } from './member_home.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberHome } from './entities/member_home.entity';
import { Home } from 'src/home/entities/home.entity';
import { HomeModule } from 'src/home/home.module';

@Module({
  imports: [TypeOrmModule.forFeature([MemberHome, Home]), HomeModule],
  controllers: [MemberHomeController],
  providers: [MemberHomeService],
  // exports: [TypeOrmModule],
})
export class MemberHomeModule {}
