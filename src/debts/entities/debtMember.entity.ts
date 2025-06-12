import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MemberHome } from 'src/member_home/entities/member_home.entity';
import { Debt } from './debt.entity';

@Entity()
export class DebtMember {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Debt, (debt) => debt.affectedMembers, { onDelete: 'CASCADE' })
  debt: Debt;

  @ManyToOne(() => MemberHome, { eager: true, onDelete: 'CASCADE' })
  debtor: MemberHome;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: false })
  isPaid: boolean;
}
