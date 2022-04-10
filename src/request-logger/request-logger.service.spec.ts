import { Test, TestingModule } from '@nestjs/testing';
import { RequestLoggerService } from './request-logger.service';

describe('RequestLoggerService', () => {
  let service: RequestLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestLoggerService],
    }).compile();

    service = module.get<RequestLoggerService>(RequestLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
