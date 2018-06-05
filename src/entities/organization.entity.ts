import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne
} from 'typeorm';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { State } from './state.entity';

@Entity()
export class Organization {

  @ApiModelProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiModelProperty()
  @Column('text')
  public name: string;

  @Column('text', { nullable: true })
  public description: string;

  /**
   * Name of the contact at the organization.
   */
  @Column('text', { name: 'contact_name', nullable: true })
  public contactName: string;

  /**
   * Email address of the contact at the organization.
   */
  @Column('citext', { name: 'contact_email', nullable: true })
  @IsEmail()
  public contactEmail: string;

  /**
   * Phone number of the contact at the organization.
   */
  @Column('text', { name: 'contact_phone', nullable: true })
  public contactPhone: string;

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

  @ApiModelPropertyOptional()
  @CreateDateColumn()
  public created: Date;

  @Column({ name: 'created_by', nullable: true })
  public createdBy: number;

  @ApiModelPropertyOptional()
  @UpdateDateColumn()
  public modified: Date;

  @Column({ name: 'modified_by', nullable: true })
  public modifiedBy: number;

}
