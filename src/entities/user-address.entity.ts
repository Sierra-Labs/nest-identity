import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Organization } from './organization.entity';
import { State } from './state.entity';
import { User } from './user.entity';

@Entity()
export class UserAddress {

  @ApiModelProperty()
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

  /**
   * The state to which this ID is tied. Provided by the Point-of-Sale (POS) system.
   */
  @Column('text', { nullable: true })
  public state: string;

  @Column('text', { name: 'postal_code', nullable: true })
  public postalCode: string;

  @Column({ default: false })
  public isPrimary: boolean;

  @Column({ default: true })
  public isActive: boolean;

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
