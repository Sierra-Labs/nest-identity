import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { User } from './user.entity';

@Entity()
export class Role {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @Column()
  public name: string;

  // @ApiPropertyOptional({ type: User, isArray: true })
  @ManyToMany(type => User, user => user.roles)
  public users: User[];
}
