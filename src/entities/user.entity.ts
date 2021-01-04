import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  TableInheritance,
  ChildEntity,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength, IsMobilePhone } from 'class-validator';
import { Role } from './role.entity';

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  /**
   * User email address for communication and login.
   */
  @ApiProperty()
  @Column('citext', { unique: true })
  @IsEmail()
  public email: string;

  @Column('varchar', { length: 256, select: false }) // omit password from regular select queries
  @Exclude({ toPlainOnly: true })
  @MinLength(8)
  public password: string;

  @ApiProperty()
  @Column('text', { name: 'first_name' })
  public firstName: string;

  @ApiProperty()
  @Column('text', { name: 'last_name' })
  public lastName: string;

  @ApiProperty()
  @Column({ default: false })
  public verified: boolean;

  @ApiProperty()
  @Column({ default: false })
  public deleted: boolean;

  @ApiPropertyOptional()
  @CreateDateColumn()
  public created: Date;

  @ApiPropertyOptional()
  @Column({ name: 'created_by', nullable: true })
  public createdBy: number;

  @ApiPropertyOptional()
  @UpdateDateColumn()
  public modified: Date;

  @ApiPropertyOptional()
  @Column({ name: 'modified_by', nullable: true })
  public modifiedBy: number;

  // @ApiPropertyOptional({ type: Role, isArray: true })
  @ManyToMany(type => Role, role => role.users, {
    eager: true,
  })
  @JoinTable({
    name: 'user_role',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'role_id' },
  })
  public roles: Role[];
}
