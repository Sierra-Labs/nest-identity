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
export class UserPhone {

  @ApiModelProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(type => User)
  @JoinColumn({ name: 'user_id' })
  public userId: number;

  /**
   * The phone number identifier from the Point-of-Sale (POS) system
   */
  @ApiModelProperty()
  @Column({ nullable: true })
  public posId: number;

  /**
   * The property of this phone number
   */
  @Column('text')
  public type: string;

  /**
   * The user's phone number
   */
  @Column('text')
  public number: string;

  @Column({ default: false })
  public isPrimary: boolean;

  @Column({ default: true })
  public isActive: boolean;

  /**
   * Can receive text messages.
   */
  @Column({ default: false })
  public canText: boolean;

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

  @ApiModelPropertyOptional()
  @Column('timestamp', { nullable: true })
  public deleted: Date;
}
