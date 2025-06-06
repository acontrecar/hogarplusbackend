import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Home } from 'src/home/entities/home.entity';
import { MemberHome } from 'src/member_home/entities/member_home.entity';
import { DebtMember } from './entities/debtMember.entity';
import { Debt } from './entities/debt.entity';
import { DebtStatus } from './infraestructure/debt.enums';

@Injectable()
export class DebtsService {
  constructor(
    @InjectRepository(Debt)
    private debtRepository: Repository<Debt>,

    @InjectRepository(DebtMember)
    private debtMemberRepository: Repository<DebtMember>,

    @InjectRepository(MemberHome)
    private memberHomeRepository: Repository<MemberHome>,

    @InjectRepository(Home)
    private homeRepository: Repository<Home>,

    private dataSource: DataSource,
  ) {}

  async create(createDebtDto: CreateDebtDto, userId: number) {
    const { description, amount, homeId, affectedMemberIds } = createDebtDto;

    return await this.dataSource.transaction(async (manager) => {
      const home = await manager.findOne(Home, {
        where: { id: homeId },
      });

      if (!home) {
        throw new NotFoundException('Casa no encontrada');
      }

      const creditor = await manager.findOne(MemberHome, {
        where: { user: { id: userId }, home: { id: homeId } },
        relations: ['home', 'user'],
      });
      if (!creditor) {
        throw new NotFoundException(`Creditor with id ${userId} not found`);
      }
      if (creditor.home.id !== homeId) {
        throw new BadRequestException('Creditor must belong to the specified home');
      }

      const affectedMembers = await manager.find(MemberHome, {
        where: { id: In(affectedMemberIds), home: { id: homeId } },
        relations: ['home'],
      });

      if (affectedMembers.length !== affectedMemberIds.length) {
        throw new BadRequestException('Members must belong to the specified home');
      }

      const memberFromDiferrentHome = affectedMembers.filter((member) => member.home.id !== homeId);

      if (memberFromDiferrentHome.length > 0)
        throw new BadRequestException('Members must belong to the specified home');

      const amountPerMember = Number((amount / affectedMembers.length).toFixed(2));

      const totalCalculated = amountPerMember * (affectedMemberIds.length - 1);
      const lastMemberAmount = Number((amount - totalCalculated).toFixed(2));

      const debt = manager.create(Debt, {
        description,
        amount,
        status: DebtStatus.PENDING,
        creditor,
        home,
      });

      const savedDebt = await manager.save(debt);

      const debtMembers = affectedMembers.map((member, index) => {
        const memberAmount =
          index === affectedMembers.length - 1 ? lastMemberAmount : amountPerMember;

        return manager.create(DebtMember, {
          debt: savedDebt,
          debtor: member,
          amount: memberAmount,
          isPaid: false,
        });
      });

      await manager.save(debtMembers);

      // return await manager.findOne(Debt, {
      //   where: { id: savedDebt.id },
      //   relations: ['creditor', 'home', 'affectedMembers', 'affectedMembers.debtor'],
      // });

      return { message: 'Debts created successfully' };
    });
  }

  findAll() {
    return `This action returns all debts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} debt`;
  }

  update(id: number, updateDebtDto: UpdateDebtDto) {
    return `This action updates a #${id} debt`;
  }

  remove(id: number) {
    return `This action removes a #${id} debt`;
  }
}
