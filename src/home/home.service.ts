import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Home } from './entities/home.entity';
import { In, Repository } from 'typeorm';
import { MemberHome } from 'src/member_home/entities/member_home.entity';
import { MemberHomeRole } from 'src/member_home/enums/member-home-role.enum';
import { GetHomeMembersDto } from './dto/get-home-members.dto';

@Injectable()
export class HomeService {
  private readonly logger = new Logger(HomeService.name);
  constructor(
    @InjectRepository(Home)
    private readonly homeRepo: Repository<Home>,
    @InjectRepository(MemberHome)
    private readonly memberHomeRepo: Repository<MemberHome>,
  ) {}

  async create(createHomeDto: CreateHomeDto, userId: number) {
    const { name } = createHomeDto;

    const invitationCode = await this.generateUniqueInvitationCode();

    const home = this.homeRepo.create({ name, invitationCode });
    const savedHome = await this.homeRepo.save(home);

    const owner = this.memberHomeRepo.create({
      home: savedHome,
      user: { id: userId },
      role: MemberHomeRole.ADMIN,
    });
    await this.memberHomeRepo.save(owner);

    return {
      home: savedHome,
    };
  }

  async findHomesByUserId(userId: number) {
    const memberHomes = await this.memberHomeRepo.find({
      where: { user: { id: userId } },
      relations: ['home'],
    });

    const homes = memberHomes.map((memberHome) => ({
      id: memberHome.home.id,
      name: memberHome.home.name,
      invitationCode: memberHome.home.invitationCode,
      isAdmin: memberHome.role === MemberHomeRole.ADMIN,
    }));

    return { homes };
  }

  async findHomeDetails(homeId: string, userId: number) {
    const home = await this.homeRepo.findOne({
      where: { id: +homeId },
      relations: {
        members: { user: true },
        // members: true,
      },
    });

    if (!home) {
      throw new NotFoundException('Home not found');
    }

    const memberHomes = await this.memberHomeRepo.findOne({
      where: { home: { id: +homeId }, user: { id: userId } },
    });

    if (!memberHomes) {
      throw new NotFoundException('Member not found in this home');
    }

    const response: GetHomeMembersDto = {
      id: home.id,
      name: home.name,
      invitationCode: home.invitationCode,
      members: home.members.map((m) => ({
        userId: m.user.id,
        memberId: m.id,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        isAdmin: m.role === MemberHomeRole.ADMIN,
      })),
    };

    return { home: response };
  }

  async deleteHome(homeId: number, userId: number) {
    const home = await this.homeRepo.findOne({
      where: { id: homeId },
      relations: {
        members: { user: true },
      },
    });

    if (!home) {
      throw new NotFoundException('Home with that user not found');
    }

    const isAdmin = home.members.some(
      (m) => m.user.id === userId && m.role === MemberHomeRole.ADMIN,
    );

    if (!isAdmin) {
      throw new ForbiddenException('You are not admin of this home');
    }

    await this.homeRepo.delete({ id: homeId });

    return { message: 'Home deleted successfully' };
  }

  async exitFromHome(homeId: number, userId: number) {
    const home = await this.homeRepo.findOne({
      where: { id: homeId },
      relations: {
        members: { user: true },
      },
    });

    if (!home) {
      throw new NotFoundException('Home with that user not found');
    }

    const isAdmin = home.members.some(
      (m) => m.user.id === userId && m.role === MemberHomeRole.ADMIN,
    );

    if (isAdmin) {
      throw new ForbiddenException('Yoy cannot exit from admin home');
    }

    const memberHome = await this.memberHomeRepo.findOne({
      where: { home: { id: homeId }, user: { id: userId } },
    });

    if (!memberHome) {
      throw new NotFoundException('Member not found in this home');
    }

    await this.memberHomeRepo.delete({ id: memberHome.id });

    return { message: 'Member exited from home successfully' };
  }

  async deletePerson(homeId: number, userId: number, personId: number) {
    const home = await this.homeRepo.findOne({
      where: { id: homeId },
      relations: {
        members: { user: true },
      },
    });

    if (!home) {
      throw new NotFoundException('Home with that user not found');
    }

    const isAdmin = home.members.some(
      (m) => m.user.id === userId && m.role === MemberHomeRole.ADMIN,
    );

    if (!isAdmin) {
      throw new ForbiddenException('You are not admin of this home');
    }

    const memberHome = await this.memberHomeRepo.findOne({
      where: { home: { id: homeId }, id: personId },
    });

    if (!memberHome) {
      throw new NotFoundException('Member not found in this home');
    }

    await this.memberHomeRepo.delete({ id: memberHome.id });

    return { message: 'Member deleted from home successfully' };
  }

  async joinHome(code: string, userId: number) {
    this.logger.log('QUe paosa porra');
    this.logger.log(`code: -${code}- userId: -${userId}-`);
    const home = await this.homeRepo.findOne({
      where: {
        invitationCode: code,
      },
      relations: {
        members: { user: true },
      },
    });

    this.logger.log(`home: ${JSON.stringify(home)}`);

    if (!home) {
      throw new NotFoundException('Home not found');
    }

    const isAlreadyMember = home.members.some((m) => m.user.id === userId);

    if (isAlreadyMember) {
      throw new ForbiddenException('Member already in this home');
    }

    const member = this.memberHomeRepo.create({
      user: { id: userId },
      home: { id: home.id },
    });

    await this.memberHomeRepo.save(member);

    // return {
    //   data: {
    //     homeId: home.id,
    //     name: home.name,
    //   },
    // };

    return { message: 'Member joined home successfully' };
  }

  findAll() {
    return `This action returns all home`;
  }

  async findAllHomesByUser(userId: number) {
    const userMember = await this.memberHomeRepo.find({
      where: { user: { id: userId } },
      relations: ['home'],
      select: ['home'],
    });

    const homesIds = userMember.map((m) => m.home.id);

    const homes = await this.homeRepo.find({
      where: { id: In(homesIds) },
      relations: ['members', 'members.user'],
      select: ['id', 'name', 'members'],
    });

    const response = homes.map((h) => ({
      id: h.id,
      name: h.name,
      members: h.members.map((m) => ({
        id: m.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role === MemberHomeRole.ADMIN ? 'admin' : 'member',
      })),
    }));

    return { homes: response };
  }

  findOne(id: number) {
    return `This action returns a #${id} home`;
  }

  update(id: number, updateHomeDto: UpdateHomeDto) {
    return `This action updates a #${id} home`;
  }

  remove(id: number) {
    return `This action removes a #${id} home`;
  }

  private async generateUniqueInvitationCode(): Promise<string> {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let code: string;
    let exists: Home | null;

    do {
      code = '';
      for (let i = 0; i < 15; i++) {
        code += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
      }

      exists = await this.homeRepo.findOne({ where: { invitationCode: code } });
    } while (exists);

    return code;
  }
}
