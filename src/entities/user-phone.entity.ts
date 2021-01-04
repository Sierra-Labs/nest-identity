import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Organization } from './organization.entity';
import { State } from './state.entity';
import { User } from './user.entity';

@Entity()
export class UserPhone {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(type => User)
  @JoinColumn({ name: 'user_id' })
  public userId: number;

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

  @ApiPropertyOptional()
  @Column('timestamp', { nullable: true })
  public deleted: Date;
}
