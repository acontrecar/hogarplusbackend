import { Module } from '@nestjs/common';
import { DebtsService } from './debts.service';
import { DebtsController } from './debts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberHome } from 'src/member_home/entities/member_home.entity';
import { Home } from 'src/home/entities/home.entity';
import { Debt } from './entities/debt.entity';
import { DebtMember } from './entities/debtMember.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MemberHome, Home, Debt, DebtMember])],
  controllers: [DebtsController],
  providers: [DebtsService],
})
export class DebtsModule {}
