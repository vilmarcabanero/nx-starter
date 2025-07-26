import { injectable } from 'tsyringe';
import { DataSource, Repository } from 'typeorm';
import { User, IUserRepository } from '@nx-starter/domain';
import { UserMapper } from '@nx-starter/application-shared';
import { UserEntity } from './UserEntity';

/**
 * TypeORM implementation of IUserRepository
 * Works with PostgreSQL, MySQL, and other SQL databases
 */
@injectable()
export class TypeOrmUserRepository implements IUserRepository {
  private repository: Repository<UserEntity>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(UserEntity);
  }

  async getById(id: string): Promise<User | undefined> {
    const userEntity = await this.repository.findOne({ where: { id } });
    return userEntity ? this.mapToUserDomain(userEntity) : undefined;
  }

  async getByEmail(email: string): Promise<User | undefined> {
    const userEntity = await this.repository.findOne({ 
      where: { email: email.toLowerCase() } 
    });
    return userEntity ? this.mapToUserDomain(userEntity) : undefined;
  }

  async getByUsername(username: string): Promise<User | undefined> {
    const userEntity = await this.repository.findOne({ 
      where: { username: username.toLowerCase() } 
    });
    return userEntity ? this.mapToUserDomain(userEntity) : undefined;
  }

  async getByEmailOrUsername(identifier: string): Promise<User | undefined> {
    const userEntity = await this.repository.findOne({
      where: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ]
    });
    return userEntity ? this.mapToUserDomain(userEntity) : undefined;
  }

  async create(user: User): Promise<string> {
    const userEntity = this.repository.create({
      id: user.id,
      firstName: user.firstName.value,
      lastName: user.lastName.value,
      email: user.email.value,
      username: user.username.value,
      hashedPassword: user.hashedPassword.value,
      createdAt: user.createdAt,
    });

    await this.repository.save(userEntity);
    return user.id;
  }

  async update(id: string, changes: Partial<User>): Promise<void> {
    const updateData: Partial<UserEntity> = {};

    if (changes.firstName !== undefined) {
      updateData.firstName = (changes.firstName as any).value;
    }

    if (changes.lastName !== undefined) {
      updateData.lastName = (changes.lastName as any).value;
    }

    if (changes.email !== undefined) {
      updateData.email = (changes.email as any).value;
    }

    if (changes.username !== undefined) {
      updateData.username = (changes.username as any).value;
    }

    if (changes.hashedPassword !== undefined) {
      updateData.hashedPassword = (changes.hashedPassword as any).value;
    }

    if (Object.keys(updateData).length === 0) {
      return;
    }

    const result = await this.repository.update(id, updateData);
    
    if (result.affected === 0) {
      throw new Error(`User with ID ${id} not found`);
    }
  }

  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    
    if (result.affected === 0) {
      throw new Error(`User with ID ${id} not found`);
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({ 
      where: { email: email.toLowerCase() } 
    });
    return count > 0;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.repository.count({ 
      where: { username: username.toLowerCase() } 
    });
    return count > 0;
  }

  async generateUniqueUsername(baseUsername: string): Promise<string> {
    // Check if base username is available
    if (!(await this.existsByUsername(baseUsername))) {
      return baseUsername;
    }

    // Find unique username with incremental suffix
    let counter = 1;
    let candidateUsername = `${baseUsername}${counter}`;
    
    while (await this.existsByUsername(candidateUsername)) {
      counter++;
      candidateUsername = `${baseUsername}${counter}`;
      
      // Prevent infinite loops
      if (counter > 1000) {
        throw new Error('Unable to generate unique username');
      }
    }

    return candidateUsername;
  }

  private mapToUserDomain(entity: UserEntity): User {
    return UserMapper.fromPlainObject({
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      username: entity.username,
      hashedPassword: entity.hashedPassword,
      createdAt: entity.createdAt,
    });
  }
}