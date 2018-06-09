import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable,
  TableInheritance, ChildEntity } from 'typeorm';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength, IsMobilePhone } from 'class-validator';
import { Role } from './role.entity';

@Entity()
export class User {

  @ApiModelProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  public roleType;
  /**
   * User email address for communication and login.
   */
  @ApiModelProperty()
  @Column('citext', { unique: true })
  @IsEmail()
  public email: string;

  @Column('varchar', { length: 256 })
  @Exclude({ toPlainOnly: true })
  @MinLength(8)
  public password: string;

  @ApiModelProperty()
  @Column('text', { name: 'first_name' })
  public firstName: string;

  @ApiModelProperty()
  @Column('text', { name: 'last_name' })
  public lastName: string;

  @ApiModelProperty()
  @Column({ default: false })
  public verified: boolean = false; // tslint:disable-line

  @ApiModelProperty()
  @Column({ default: false })
  public deleted: boolean = false; // tslint:disable-line

  @ApiModelPropertyOptional()
  @CreateDateColumn()
  public created: Date;

  @ApiModelPropertyOptional()
  @Column({ name: 'created_by', nullable: true })
  public createdBy: number;

  @ApiModelPropertyOptional()
  @UpdateDateColumn()
  public modified: Date;

  @ApiModelPropertyOptional()
  @Column({ name: 'modified_by', nullable: true })
  public modifiedBy: number;

  @ApiModelPropertyOptional({ type: Role, isArray: true })
  @ManyToMany(type => Role, role => role.users, {
    eager: true
  })
  @JoinTable({
    name: 'user_role',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'role_id' }
  })
  public roles: Role[];
}
