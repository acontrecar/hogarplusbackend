import { Injectable } from '@nestjs/common';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Home } from './entities/home.entity';
import { Repository } from 'typeorm';
import { MemberHome } from 'src/member_home/entities/member_home.entity';
import { MemberHomeRole } from 'src/member_home/enums/member-home-role.enum';

@Injectable()
export class HomeService {
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

  findAll() {
    return `This action returns all home`;
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
