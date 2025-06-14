import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberHome } from 'src/member_home/entities/member_home.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text')
  name: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text')
  password: string;

  @Column('text', { nullable: true })
  avatar?: string;

  @Column('text', { nullable: true })
  avatarPublicId?: string;

  @Column('text', { nullable: true })
  phone?: string;

  @OneToMany(() => MemberHome, (memberHome) => memberHome.user)
  memberHomes: MemberHome[];

  // @BeforeInsert()
  // async hashPassword() {
  //   this.password = await bcrypt.hash(this.password, 10);
  // }

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }
  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }

  // @BeforeInsert()
  // checkFieldsBeforeInsert() {
  //   this.email = this.email.toLowerCase().trim();
  // }

  // @BeforeUpdate()
  // checkFieldsBeforeUpdate() {
  //   this.checkFieldsBeforeInsert();
  // }
}

// @BeforeInsert()
//   async checkFieldsBeforeInsert() {
//     this.email = this.email.toLowerCase().trim();
//     if (this.password) {
//       this.password = await bcrypt.hash(this.password, 10);
//     }
//   }

//   @BeforeUpdate()
//   async checkFieldsBeforeUpdate() {
//     await this.checkFieldsBeforeInsert();
//   }
