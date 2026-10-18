import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { Post } from './post.entity.js';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreatePostDto): Promise<Post> {
    const user = await this.usersService.getUserById(dto.userId);

    const post = this.postsRepository.create({
      title: dto.title,
      content: dto.content,
      user,
    });

    const savedPost = await this.postsRepository.save(post);

    return this.postsRepository.findOneOrFail({
      where: { id: savedPost.id },
      relations: { user: true },
    });
  }

  async findAll(title?: string): Promise<Post[]> {
    const query = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .orderBy('post.id', 'ASC');

    if (title) {
      query.where('post.title LIKE :title', {
        title: `%${title}%`,
      });
    }

    return query.getMany();
  }
}