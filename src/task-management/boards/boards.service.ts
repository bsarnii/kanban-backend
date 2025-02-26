import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { Repository } from 'typeorm';
import { Status } from './entities/status.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(Status)
    private statusRepository: Repository<Status>,
  ) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const { name, statuses } = createBoardDto;

    const board = this.boardRepository.create({
      name,
      statuses, // TypeORM will automatically save them due to `cascade: true`
    });

    return this.boardRepository.save(board);
  }

  findAll() {
    return this.boardRepository.find();
  }

  findOne(id: string) {
    return this.boardRepository.findOneBy({ id });
  }

  update(id: string, updateBoardDto: UpdateBoardDto) {
    return this.boardRepository.update(id, updateBoardDto);
  }

  remove(id: string) {
    return this.boardRepository.delete(id);
  }
}
