import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { State } from './state.entity';

@Entity()
export class Organization {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @Column('text')
  public name: string;

  @Column('text', { nullable: true })
  public description: string;

  /**
   * Organization primary street address.
   */
  @Column('text', { name: 'address_line_1', nullable: true })
  public addressLine1: string;

  @Column('text', { name: 'address_line_2', nullable: true })
  public addressLine2: string;

  /**
   * Organization primary city.
   */
  @Column('text', { nullable: true })
  public city: string;

  @ManyToOne(type => State, { eager: true, nullable: true })
  @JoinColumn({ name: 'state_id' })
  public state: State;

  @Column('text', { name: 'postal_code', nullable: true })
  public postalCode: string;

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
