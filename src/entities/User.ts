import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ length: 256 })
  firstName!: string;

  @Column({ length: 256 })
  lastName!: string;

  @Column({ length: 64, unique: true })
  email!: string;

  @Column({ length: 64 })
  password!: string;
}
