import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async getAllByHome(homeId: number, userId: number) {
    const member = await this.memberHomeRepository.findOne({
      where: { user: { id: userId }, home: { id: homeId } },
      relations: ['home', 'user'],
    });

    if (!member) {
      throw new NotFoundException(`Member with id ${userId} not found`);
    }

    const debts = await this.debtRepository.find({
      where: { home: { id: homeId } },
      relations: [
        'home',
        'creditor',
        'creditor.user',
        'affectedMembers',
        'affectedMembers.debtor',
        'affectedMembers.debtor.user',
      ],
      order: { createdAt: 'DESC' },
    });

    const response = debts.map((debt, index) => ({
      id: debt.id,
      index: index,
      description: debt.description,
      homeName: debt.home.name,
      amount: debt.amount,
      status: debt.status,
      createdAt: debt.createdAt,
      creditor: {
        id: debt.creditor.user.id,
        name: debt.creditor.user.name,
        avatar: debt.creditor.user.avatar,
      },
      affectedMembers: debt.affectedMembers.map((am) => ({
        id: am.debtor.user.id,
        debtMemberId: am.id,
        name: am.debtor.user.name,
        amount: am.amount,
        isPaid: am.isPaid,
        avatar: am.debtor.user.avatar,
      })),
    }));

    return { debts: response };
  }

  async payDebtMember(debtMemberId: number, userId: number) {
    const debtMember = await this.debtMemberRepository.findOne({
      where: { id: debtMemberId },
      relations: ['debt', 'debtor', 'debtor.user'],
    });

    if (!debtMember) {
      throw new NotFoundException(`Debt member with id ${debtMemberId} not found`);
    }

    if (debtMember.debtor.user.id !== userId) {
      throw new ForbiddenException('You cannot pay this debt member');
    }

    if (debtMember.isPaid) {
      throw new BadRequestException('This debt member has already been paid');
    }

    await this.dataSource.transaction(async (manager) => {
      debtMember.isPaid = true;

      await manager.save(debtMember);

      const allDebtMembers = await manager.find(DebtMember, {
        where: { debt: { id: debtMember.debt.id } },
      });

      const allPaid = allDebtMembers.every((member) => member.isPaid);

      if (allPaid) {
        await manager.update(Debt, debtMember.debt.id, {
          status: DebtStatus.COMPLETED,
        });
      }
    });

    return { debtMember };
  }

  async deleteDebt(debtId: number, userId: number) {
    const debt = await this.debtRepository.findOne({
      where: { id: debtId },
      relations: ['creditor', 'creditor.user', 'home', 'affectedMembers', 'affectedMembers.debtor'],
    });

    if (!debt) {
      throw new NotFoundException(`Debt with id ${debtId} not found`);
    }

    // return { debt };

    if (debt.creditor.user.id !== userId) {
      throw new ForbiddenException('You cannot delete this debt');
    }

    await this.debtRepository.delete({
      id: debtId,
    });

    return { debtIdDelete: debt.id };
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
