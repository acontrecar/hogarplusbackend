import { Home } from 'src/home/entities/home.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberHomeRole } from '../enums/member-home-role.enum';

@Entity()
export class MemberHome {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, (user) => user.memberHomes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Home, (home) => home.members, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  home: Home;

  @Column({
    type: 'enum',
    enum: MemberHomeRole,
    default: MemberHomeRole.MEMBER,
  })
  role: string;

  @CreateDateColumn()
  createdAt: Date;
}
