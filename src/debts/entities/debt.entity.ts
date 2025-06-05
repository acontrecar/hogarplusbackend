import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DebtStatus } from '../infraestructure/debt.enums';
import { MemberHome } from 'src/member_home/entities/member_home.entity';
import { Home } from 'src/home/entities/home.entity';
import { DebtMember } from './debtMember.entity';

@Entity()
export class Debt {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: DebtStatus, default: DebtStatus.PENDING })
  status: string;

  @ManyToOne(() => MemberHome, { eager: true, onDelete: 'CASCADE' })
  creditor: MemberHome;

  @ManyToOne(() => Home, (home) => home.debts, { onDelete: 'CASCADE' })
  home: Home;

  @OneToMany(() => DebtMember, (debtMember) => debtMember.debt)
  affectedMembers: DebtMember[];

  @CreateDateColumn()
  createdAt: Date;
}
