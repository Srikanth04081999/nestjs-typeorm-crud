import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(dto);
    return this.saveUser(user);
  }

  async findAll(name?: string): Promise<User[]> {
    return this.usersRepository.find({
      where: name ? { name: Like(`%${name}%`) } : {},
      order: { id: 'ASC' },
    });
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { posts: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.getUserById(id);

    if (dto.name !== undefined) {
      user.name = dto.name;
    }

    if (dto.email !== undefined) {
      user.email = dto.email;
    }

    return this.saveUser(user);
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    const result = await this.usersRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      message: `User with ID ${id} deleted successfully`,
    };
  }

  private async saveUser(user: User): Promise<User> {
    try {
      return await this.usersRepository.save(user);
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }
}