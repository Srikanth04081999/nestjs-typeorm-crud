import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto.js';
import { FilterPostsDto } from './dto/filter-posts.dto.js';
import { PostsService } from './posts.service.js';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @Get()
  findAll(@Query() query: FilterPostsDto) {
    return this.postsService.findAll(query.title);
  }
}