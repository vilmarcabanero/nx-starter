import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * TypeORM User Entity
 * Represents user table in relational databases
 */
@Entity('users')
export class UserEntity {
  @PrimaryColumn('varchar')
  id!: string;

  @Column('varchar', { length: 50 })
  firstName!: string;

  @Column('varchar', { length: 50 })
  lastName!: string;

  @Column('varchar', { length: 254, unique: true })
  email!: string;

  @Column('varchar', { length: 50, unique: true })
  username!: string;

  @Column('varchar')
  hashedPassword!: string;

  @CreateDateColumn()
  createdAt!: Date;
}