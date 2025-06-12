import { Home } from 'src/home/entities/home.entity';
import { MemberHome } from 'src/member_home/entities/member_home.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text')
  title: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time', nullable: true })
  time?: string;

  @Column({ nullable: true })
  duration?: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'overdue'],
    default: 'pending',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  })
  priority: string;

  @ManyToOne(() => Home, { onDelete: 'CASCADE' })
  house: Home;

  @ManyToMany(() => MemberHome, (memberHome) => memberHome.createdTasks, { onDelete: 'CASCADE' })
  @JoinTable()
  assignedTo: MemberHome[];

  @ManyToOne(() => MemberHome, (memberHome) => memberHome.createdTasks, { onDelete: 'CASCADE' })
  createdBy: MemberHome;

  @ManyToMany(() => MemberHome, (memberHome) => memberHome.completedByTasks, {
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'task_completed_by' })
  completedBy?: MemberHome[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
