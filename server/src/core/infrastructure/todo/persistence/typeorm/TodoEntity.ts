import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('todos')
export class TodoEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 255 })
  title!: string;

  @Column('boolean', { default: false })
  completed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @Column('varchar', { length: 20, default: 'medium' })
  priority!: string;

  @Column('datetime', { nullable: true })
  dueDate?: Date;
}