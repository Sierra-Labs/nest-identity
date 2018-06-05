import { EntityRepository, Repository, Connection } from 'typeorm';

import { User } from '../entities/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {

  public async findByEmail(email: string, fields?: string[]): Promise<User> {
    const query = this.createQueryBuilder('user');

    if (fields) {
      query.select('user.id');
      for (const field of fields) {
        query.addSelect(field);
      }
    }
    query
      // .leftJoinAndSelect('user.profileMedia', 'media')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.email = :email')
      .setParameters({ email });
    if (fields) {
      return query.getRawOne();
    } else {
      return query.getOne();
    }
  }

  public async findWithFilter(
    order: any,
    limit: number,
    offset: number,
    filter: string
  ): Promise<User[]> {
    return this.createQueryBuilder('user')
      .where(
        `(user.id)::text LIKE :filter OR
              first_name LIKE :filter OR
              last_name LIKE :filter OR
              user.email LIKE :filter`,
        { filter }
      )
      .orderBy(order)
      .limit(limit)
      .offset(offset)
      .getMany();
  }

}

export const UserRepositoryProvider = {
  provide: 'UserRepository',
  useFactory: (connection: Connection) => connection.getCustomRepository(UserRepository),
  inject: [Connection]
};
