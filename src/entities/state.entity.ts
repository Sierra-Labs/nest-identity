import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * US and Territory State names, abbreviations, and meta data from https://statetable.com/
 */
@Entity()
export class State {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty()
  @Column('text')
  public name: string;

  @Column('varchar', { length: 3 })
  public abbreviation: string;

  @Column({ select: false }) // remove from default query
  public country: string;

  @Column('text', { name: 'state_type' })
  public stateType: string;

  @Column('text', { name: 'assoc_press' })
  public assocPress: string;

  @Column('text', { name: 'standard_federal_region', select: false }) // remove from default query
  public standardFederalRegion: string;

  @Column('text', { name: 'census_region', select: false }) // remove from default query
  public censusRegion: string;

  @Column('text', { name: 'census_region_name', select: false }) // remove from default query
  public censusRegionName: string;

  @Column('text', { name: 'census_division', select: false }) // remove from default query
  public censusDivision: string;

  @Column('text', { name: 'census_division_name', select: false }) // remove from default query
  public censusDivisionName: string;

  @Column('text', { name: 'circuit_court', select: false }) // remove from default query
  public circuitCourt: string;

  @ApiPropertyOptional()
  @CreateDateColumn({ select: false }) // remove from default query
  public created: Date;
}
