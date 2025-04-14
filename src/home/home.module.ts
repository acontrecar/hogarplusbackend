import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberHome } from 'src/member_home/entities/member_home.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MemberHome]), HomeModule],
  controllers: [HomeController],
  providers: [HomeService],
  // exports: [TypeOrmModule],
})
export class HomeModule {}
