import { Test, TestingModule } from '@nestjs/testing';
import { OutingsController } from './outings.controller';
import { OutingsService } from './outings.service';
import { JwtService } from '@nestjs/jwt';

describe('OutingsController', () => {
  let controller: OutingsController;
  let service: OutingsService;

  const mockService = {
    createOuting: jest.fn(),
    findAllByUser: jest.fn(),
    findOne: jest.fn(),
    addParticipant: jest.fn(),
    addAccount: jest.fn(),
    addProduct: jest.fn(),
    addPayer: jest.fn(),
    calculateDebts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OutingsController],
      providers: [
        { provide: OutingsService, useValue: mockService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } }, // For AuthGuard
      ],
    }).compile();

    controller = module.get<OutingsController>(OutingsController);
    service = module.get<OutingsService>(OutingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.createOuting', async () => {
      const dto = { name: 'Test' };
      const userId = 'user-1';
      await controller.create(userId, dto);
      expect(service.createOuting).toHaveBeenCalledWith(dto, userId);
    });
  });

  describe('calculate', () => {
    it('should call service.calculateDebts', async () => {
      const id = 'outing-1';
      await controller.calculate(id);
      expect(service.calculateDebts).toHaveBeenCalledWith(id);
    });
  });
});
