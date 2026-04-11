import { Test, TestingModule } from '@nestjs/testing';
import { BoardMemberService } from './board-member.service';

describe('BoardMemberService', () => {
  let service: BoardMemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardMemberService],
    }).compile();

    service = module.get<BoardMemberService>(BoardMemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
