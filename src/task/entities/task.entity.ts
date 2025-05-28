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

  @ManyToMany(() => MemberHome, (memberHome) => memberHome.createdTasks)
  @JoinTable()
  assignedTo: MemberHome[];

  @ManyToOne(() => MemberHome, (memberHome) => memberHome.createdTasks)
  createdBy: MemberHome;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

/* 
{
    id: "1",
    title: "Limpiar cocina",
    description: "Limpiar nevera y encimera",
    date: new Date().toISOString().split("T")[0],
    time: "19:00",
    duration: "30 min",
    assignedTo: ["user1", "user2"],
    houseId: "house1",
    status: "pending",
    priority: "medium",
  },
  {
    id: "2",
    title: "Comprar suministros",
    description: "Papel higiénico y lavavajillas",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Mañana
    time: "10:00",
    duration: "1h",
    assignedTo: ["user3"],
    houseId: "house1",
    status: "pending",
    priority: "high",
  },
*/
