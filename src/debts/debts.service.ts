import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Home } from 'src/home/entities/home.entity';
import { MemberHome } from 'src/member_home/entities/member_home.entity';
import { DebtMember } from './entities/debtMember.entity';
import { Debt } from './entities/debt.entity';

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

      return {
        creditor,
      };
    });
    // const home = await this.homeRepository.findOne({
    //   where: { id: homeId },
    // });

    // if (!home) {
    //   throw new NotFoundException('Casa no encontrada');
    // }

    // const creditor = await this.memberHomeRepository.findOne({
    //   where: { home: { id: homeId }, user: { id: creditorId } },
    //   relations: ['user'],
    // });

    // return 'This action adds a new debt';
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
