import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';

import { User } from './user.entity';

@Entity()
export class Role {
  @ApiModelProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiModelProperty()
  @Column()
  public name: string;

  // @ApiModelPropertyOptional({ type: User, isArray: true })
  @ManyToMany(type => User, user => user.roles)
  public users: User[];
}
