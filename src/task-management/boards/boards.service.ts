import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createBoardDto: CreateBoardDto, userId: string): Promise<Board> {
    const { name, statuses } = createBoardDto;

    const board = this.boardRepository.create({
      name,
      statuses,
      createdBy: userId,
    });

    return this.boardRepository.save(board);
  }

  async findAllAfterUser(userId: string): Promise<Board[]> {
    return await this.boardRepository.find({
      where: { createdBy: userId },
      order: { createdAt: 'ASC', statuses: { createdAt: 'ASC' } },
    });
  }

  async findOne(id: string) {
    return await this.boardRepository.findOne({
      where: { id },
      order: { createdAt: 'ASC', statuses: { createdAt: 'ASC' } },
    });
  }

  async update(id: string, updateBoardDto: UpdateBoardDto) {
    const { name, statuses } = updateBoardDto;

    // 1️⃣ Fetch the board with existing statuses
    const board = await this.boardRepository.findOne({
      where: { id },
      order: { createdAt: 'ASC', statuses: { createdAt: 'ASC' } },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    // 2️⃣ Update board name
    if (name) {
      board.name = name;
    }

    // 3️⃣ Track existing statuses
    const existingStatusMap = new Map(
      board.statuses.map((status) => [status.id, status]),
    );

    // 4️⃣ Process incoming statuses: Update existing & create new
    const updatedStatuses = await Promise.all(
      statuses.map(async (statusDto) => {
        if (statusDto.id && existingStatusMap.has(statusDto.id)) {
          // Update existing status
          const existingStatus = existingStatusMap.get(statusDto.id)!;
          existingStatus.name = statusDto.name;

          return this.statusRepository.save(existingStatus);
        } else {
          // Create a new status
          const newStatus = this.statusRepository.create({
            name: statusDto.name,
            board,
          });
          return this.statusRepository.save(newStatus);
        }
      }),
    );

    // 5️⃣ Remove statuses that are no longer in the request
    const incomingStatusIds = statuses
      .map((status) => status.id)
      .filter((id) => id !== undefined);
    const statusesToRemove = board.statuses.filter(
      (status) => !incomingStatusIds.includes(status.id),
    );

    if (statusesToRemove.length > 0) {
      await this.statusRepository.remove(statusesToRemove);
    }

    // 6️⃣ Assign updated statuses & save board
    board.statuses = updatedStatuses;
    await this.boardRepository.save(board);

    // 7️⃣ Return updated board with statuses
    return await (this.boardRepository.findOne({
      where: { id: board.id },
      order: { createdAt: 'ASC', statuses: { createdAt: 'ASC' } },
    }) as Promise<Board>);
  }

  async remove(id: string) {
    return await this.boardRepository.delete(id);
  }
}
