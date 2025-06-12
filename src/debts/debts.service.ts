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
import { GetDebtDashboardDto } from './dto/GetDebtDashboardDto';

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
        throw new NotFoundException(`Creditor con id ${userId} no encontrado`);
      }
      if (creditor.home.id !== homeId) {
        throw new BadRequestException('El creditor debe pertenecer a la casa especificada');
      }

      const affectedMembers = await manager.find(MemberHome, {
        where: { id: In(affectedMemberIds), home: { id: homeId } },
        relations: ['home'],
      });

      if (affectedMembers.length !== affectedMemberIds.length) {
        throw new BadRequestException('Los miembros deben pertenecer a la casa especificada');
      }

      const memberFromDiferrentHome = affectedMembers.filter((member) => member.home.id !== homeId);

      if (memberFromDiferrentHome.length > 0)
        throw new BadRequestException('Los miembros deben pertenecer a la casa especificada');

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

      return { message: 'Deuda creada correctamente' };
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

  async summary(homeId: number, userId: number) {
    // Obtener todas las deudas de la casa
    const debts = await this.debtRepository.find({
      where: {
        home: { id: homeId },
        status: DebtStatus.PENDING,
        // creditor: { user: { id: userId } },
      },
      relations: [
        'creditor',
        'affectedMembers',
        'affectedMembers.debtor',
        'affectedMembers.debtor.user',
        'creditor.user',
      ],
    });

    let totalOwedToMe = 0;
    debts.forEach((debt) => {
      if (debt.creditor.user.id === userId) {
        debt.affectedMembers.forEach((member) => {
          if (!member.isPaid && member.debtor.user.id !== userId) {
            totalOwedToMe += Number(member.amount);
          }
        });
      }
    });

    // Obtener lo que yo debo
    const myDebts = await this.debtMemberRepository.find({
      where: {
        debtor: { user: { id: userId } },
        debt: { home: { id: homeId } },
        isPaid: false,
      },
      relations: ['debt', 'debt.creditor', 'debt.creditor.user'],
    });

    const filteredDebts = myDebts.filter(
      (debtMember) => debtMember.debt.creditor.user.id !== userId,
    );
    const totalIOwe = filteredDebts.reduce((sum, part) => sum + Number(part.amount), 0);

    const lastDebtIAffect = filteredDebts
      .sort((a, b) => new Date(b.debt.createdAt).getTime() - new Date(a.debt.createdAt).getTime())
      .slice(0, 3)
      .map((debtmember) => ({
        id: debtmember.debt.id,
        description: debtmember.debt.description,
        amount: Number(debtmember.amount),
        creditor: {
          id: debtmember.debt.creditor.user.id,
          name: debtmember.debt.creditor.user.name,
        },
      }));

    return { totalOwedToMe, totalIOwe, balance: totalOwedToMe - totalIOwe, lastDebtIAffect };
  }

  // async summary(homeId: number, userId: number): Promise<GetDebtDashboardDto> {
  //   const myDebts = await this.debtRepository.find({
  //     where: { creditor: { id: homeId } },
  //     relations: ['affectedMembers', 'affectedMembers.debtor', 'affectedMembers.debtor.user'],
  //   });

  //   const totalOwedToMe = myDebts.reduce((sum, debt) => {
  //     const unpaid = debt.affectedMembers.filter((m) => !m.isPaid);
  //     return sum + unpaid.reduce((acc, m) => acc + Number(m.amount), 0);
  //   }, 0);

  //   // Lo que yo debo
  //   const myDebtParts = await this.debtMemberRepository.find({
  //     where: { debtor: { id: homeId }, isPaid: false },
  //     relations: ['debt', 'debt.creditor'],
  //   });

  //   const totalIOwe = myDebtParts.reduce((sum, part) => sum + Number(part.amount), 0);

  //   return {
  //     totalOwedToMe,
  //     totalIOwe,
  //     balance: totalOwedToMe - totalIOwe,

  //     myCreatedDebts: myDebts.map((debt) => ({
  //       id: debt.id,
  //       description: debt.description,
  //       total: Number(debt.amount),
  //       paid: debt.affectedMembers.reduce((acc, m) => acc + (m.isPaid ? Number(m.amount) : 0), 0),
  //       createdAt: debt.createdAt,
  //       affectedMembers: debt.affectedMembers.map((m) => ({
  //         id: m.debtor.id,
  //         name: m.debtor.user.name,
  //         isPaid: m.isPaid,
  //         amount: Number(m.amount),
  //       })),
  //     })),

  //     debtsIAffect: myDebtParts.map((part) => ({
  //       id: part.id,
  //       description: part.debt.description,
  //       amount: Number(part.amount),
  //       isPaid: part.isPaid,
  //       createdAt: part.debt.createdAt,
  //       creditor: {
  //         id: part.debt.id,
  //         name: 'part.debtor.user.name',
  //       },
  //     })),
  //   };
  // }

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
