import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { Repository } from 'typeorm';
import { Status } from './entities/status.entity';
import { BoardMemberService } from '../board-member/board-member.service';
import { BoardWithMemberRoleResponseDto } from './dto/board-with-member-role-response.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(Status)
    private statusRepository: Repository<Status>,

    @Inject(BoardMemberService)
    private boardMemberService: BoardMemberService,
  ) {}

  async create(createBoardDto: CreateBoardDto, userId: string): Promise<BoardWithMemberRoleResponseDto> {
    const { name, statuses } = createBoardDto;

    const board = this.boardRepository.create({
      name,
      statuses,
      createdBy: userId
    });

    const savedBoard = await this.boardRepository.save(board);
    await this.boardMemberService.create({
      userId,
      board: savedBoard,
      role: "owner"
    });

    const createdBoard = await this.boardRepository.findOne({
      where: { id: savedBoard.id },
      order: { createdAt: 'ASC', statuses: { createdAt: 'ASC' } },
      relations: { boardMembers: true },
    });

    if (!createdBoard) {
      throw new NotFoundException(`Board with ID ${savedBoard.id} not found`);
    }

    return mapBoardWithMemberRole(createdBoard, userId);
  }

  async findAllWithBoardMemberRole(userId: string): Promise<BoardWithMemberRoleResponseDto[]> {
    const boards = await this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.statuses', 'status')
      .leftJoinAndSelect('board.boardMembers', 'boardMember')
      .where('boardMember.userId = :userId', { userId })
      .orderBy('board.createdAt', 'ASC')
      .addOrderBy('status.createdAt', 'ASC')
      .getMany();

    return boards.map((board) => mapBoardWithMemberRole(board, userId));
  }

  async findOne(id: string, userId: string): Promise<BoardWithMemberRoleResponseDto> {
    const board = await this.boardRepository.findOne({
      where: { id },
      order: { createdAt: 'ASC', statuses: { createdAt: 'ASC' } },
      relations: { boardMembers: true },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    return mapBoardWithMemberRole(board, userId);
  }

  async update(
    id: string,
    updateBoardDto: UpdateBoardDto,
    userId: string,
  ): Promise<BoardWithMemberRoleResponseDto> {
    const { name, statuses } = updateBoardDto;

    // 1️⃣ Fetch the board with existing statuses
    const board = await this.boardRepository.findOne({
      where: { id },
      order: { createdAt: 'ASC', statuses: { createdAt: 'ASC' } },
      relations: { boardMembers: true },
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
    const updatedBoard = await this.boardRepository.findOne({
      where: { id: board.id },
      order: { createdAt: 'ASC', statuses: { createdAt: 'ASC' } },
      relations: { boardMembers: true },
    });

    if (!updatedBoard) {
      throw new NotFoundException(`Board with ID ${board.id} not found`);
    }

    return mapBoardWithMemberRole(updatedBoard, userId);
  }

  async remove(id: string) {
    return await this.boardRepository.delete(id);
  }
}

  function mapBoardWithMemberRole(
    board: Board,
    userId: string,
  ): BoardWithMemberRoleResponseDto {
    const boardWithBoardMembers = {
      ...board,
      boardMemberRole:
        board.boardMembers?.find((member) => member.userId === userId)?.role ||
        null,
    };
    const { boardMembers, ...boardWithoutMembers } = boardWithBoardMembers;
    return boardWithoutMembers;
  }