import { MemberHome } from 'src/member_home/entities/member_home.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Home {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  invitationCode: string;

  @OneToMany(() => MemberHome, (memberHome) => memberHome.home)
  members: MemberHome[];
}
