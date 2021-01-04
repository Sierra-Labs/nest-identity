import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Organization } from './organization.entity';
import { State } from './state.entity';
import { User } from './user.entity';

@Entity()
export class UserAddress {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(type => User)
  @JoinColumn({ name: 'user_id' })
  public userId: number;

  @Column('text', { name: 'address_line_1', nullable: true })
  public addressLine1: string;

  @Column('text', { name: 'address_line_2', nullable: true })
  public addressLine2: string;

  @Column('text', { nullable: true })
  public city: string;

  @ManyToOne(type => State, { eager: true, nullable: true })
  @JoinColumn({ name: 'state_id' })
  public state: State;

  @Column('text', { name: 'postal_code', nullable: true })
  public postalCode: string;

  @Column({ default: false })
  public isPrimary: boolean;

  @Column({ default: true })
  public isActive: boolean;

  @ApiPropertyOptional()
  @CreateDateColumn()
  public created: Date;

  @Column({ name: 'created_by', nullable: true })
  public createdBy: number;

  @ApiPropertyOptional()
  @UpdateDateColumn()
  public modified: Date;

  @Column({ name: 'modified_by', nullable: true })
  public modifiedBy: number;
}
