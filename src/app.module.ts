import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './user/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';
import { MemberHomeModule } from './member_home/member_home.module';
import { Home } from './home/entities/home.entity';
import { MemberHome } from './member_home/entities/member_home.entity';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { TaskModule } from './task/task.module';
import { Task } from './task/entities/task.entity';
import { DebtsModule } from './debts/debts.module';
import { Debt } from './debts/entities/debt.entity';
import { DebtMember } from './debts/entities/debtMember.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        synchronize: true,
        entities: [User, Home, MemberHome, Task, Debt, DebtMember],
      }),
    }),
    UserModule,
    AuthModule,
    HomeModule,
    MemberHomeModule,
    CloudinaryModule,
    TaskModule,
    DebtsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
