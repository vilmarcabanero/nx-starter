import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthController } from './AuthController';
import { ApiResponseBuilder } from '../dto/ApiResponse';

// Mock the use cases and dependencies
const mockRegisterUserUseCase = {
  execute: vi.fn(),
};

const mockValidationService = {
  validateRegisterCommand: vi.fn(),
};

// Mock the UserMapper
vi.mock('@nx-starter/application-shared', async () => {
  const actual = await vi.importActual('@nx-starter/application-shared');
  return {
    ...actual,
    UserMapper: {
      toRegisterResponseDto: vi.fn((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
      })),
    },
  };
});

describe('AuthController', () => {
  let controller: AuthController;
  let mockUser: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create controller instance with mocked dependencies
    controller = new AuthController(
      mockRegisterUserUseCase as any,
      mockValidationService as any
    );

    // Setup mock user data
    mockUser = {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      username: 'john.doe',
      createdAt: new Date('2023-01-01'),
    };
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'SecurePassword123!',
      };

      const validatedCommand = {
        ...registerData,
        username: 'john.doe',
      };

      const expectedResponse = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'john.doe',
      };

      mockValidationService.validateRegisterCommand.mockReturnValue(validatedCommand);
      mockRegisterUserUseCase.execute.mockResolvedValue(mockUser);

      const result = await controller.register(registerData);

      expect(mockValidationService.validateRegisterCommand).toHaveBeenCalledWith(registerData);
      expect(mockRegisterUserUseCase.execute).toHaveBeenCalledWith(validatedCommand);
      expect(result).toEqual(ApiResponseBuilder.success(expectedResponse));
    });

    it('should handle validation errors', async () => {
      const registerData = {
        firstName: '',
        lastName: 'Doe',
        email: 'invalid-email',
        password: '123', // Too short
      };

      const validationError = new Error('Validation failed: First name is required');
      mockValidationService.validateRegisterCommand.mockImplementation(() => {
        throw validationError;
      });

      await expect(controller.register(registerData)).rejects.toThrow(
        'Validation failed: First name is required'
      );

      expect(mockValidationService.validateRegisterCommand).toHaveBeenCalledWith(registerData);
      expect(mockRegisterUserUseCase.execute).not.toHaveBeenCalled();
    });

    it('should handle empty first name', async () => {
      const registerData = {
        firstName: '',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'SecurePassword123!',
      };

      const validationError = new Error('First name is required');
      mockValidationService.validateRegisterCommand.mockImplementation(() => {
        throw validationError;
      });

      await expect(controller.register(registerData)).rejects.toThrow('First name is required');
      expect(mockRegisterUserUseCase.execute).not.toHaveBeenCalled();
    });

    it('should handle empty last name', async () => {
      const registerData = {
        firstName: 'John',
        lastName: '',
        email: 'john.doe@example.com',
        password: 'SecurePassword123!',
      };

      const validationError = new Error('Last name is required');
      mockValidationService.validateRegisterCommand.mockImplementation(() => {
        throw validationError;
      });

      await expect(controller.register(registerData)).rejects.toThrow('Last name is required');
      expect(mockRegisterUserUseCase.execute).not.toHaveBeenCalled();
    });

    it('should handle invalid email format', async () => {
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email-format',
        password: 'SecurePassword123!',
      };

      const validationError = new Error('Invalid email format');
      mockValidationService.validateRegisterCommand.mockImplementation(() => {
        throw validationError;
      });

      await expect(controller.register(registerData)).rejects.toThrow('Invalid email format');
      expect(mockRegisterUserUseCase.execute).not.toHaveBeenCalled();
    });

    it('should handle weak password', async () => {
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: '123', // Too weak
      };

      const validationError = new Error('Password must be at least 8 characters long');
      mockValidationService.validateRegisterCommand.mockImplementation(() => {
        throw validationError;
      });

      await expect(controller.register(registerData)).rejects.toThrow(
        'Password must be at least 8 characters long'
      );
      expect(mockRegisterUserUseCase.execute).not.toHaveBeenCalled();
    });

    it('should handle use case execution errors', async () => {
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'SecurePassword123!',
      };

      const validatedCommand = {
        ...registerData,
        username: 'existing',
      };

      const useCaseError = new Error('User with this email already exists');

      mockValidationService.validateRegisterCommand.mockReturnValue(validatedCommand);
      mockRegisterUserUseCase.execute.mockRejectedValue(useCaseError);

      await expect(controller.register(registerData)).rejects.toThrow(
        'User with this email already exists'
      );

      expect(mockValidationService.validateRegisterCommand).toHaveBeenCalledWith(registerData);
      expect(mockRegisterUserUseCase.execute).toHaveBeenCalledWith(validatedCommand);
    });

    it('should handle database connection errors', async () => {
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'SecurePassword123!',
      };

      const validatedCommand = {
        ...registerData,
        username: 'john.doe',
      };

      const dbError = new Error('Database connection failed');

      mockValidationService.validateRegisterCommand.mockReturnValue(validatedCommand);
      mockRegisterUserUseCase.execute.mockRejectedValue(dbError);

      await expect(controller.register(registerData)).rejects.toThrow('Database connection failed');
    });

    it('should handle special characters in names', async () => {
      const registerData = {
        firstName: "John-Paul O'Connor",
        lastName: "Smith-Wilson",
        email: 'john.paul@example.com',
        password: 'SecurePassword123!',
      };

      const validatedCommand = {
        ...registerData,
        username: 'john.paul',
      };

      const userWithSpecialChars = {
        ...mockUser,
        firstName: "John-Paul O'Connor",
        lastName: "Smith-Wilson",
        email: 'john.paul@example.com',
        username: 'john.paul',
      };

      const expectedResponse = {
        id: 'user-123',
        firstName: "John-Paul O'Connor",
        lastName: "Smith-Wilson",
        email: 'john.paul@example.com',
        username: 'john.paul',
      };

      mockValidationService.validateRegisterCommand.mockReturnValue(validatedCommand);
      mockRegisterUserUseCase.execute.mockResolvedValue(userWithSpecialChars);

      const result = await controller.register(registerData);

      expect(result).toEqual(ApiResponseBuilder.success(expectedResponse));
    });

    it('should handle unicode characters in names', async () => {
      const registerData = {
        firstName: 'José',
        lastName: 'Müller',
        email: 'jose.muller@example.com',
        password: 'SecurePassword123!',
      };

      const validatedCommand = {
        ...registerData,
        username: 'jose.muller',
      };

      const userWithUnicode = {
        ...mockUser,
        firstName: 'José',
        lastName: 'Müller',
        email: 'jose.muller@example.com',
        username: 'jose.muller',
      };

      const expectedResponse = {
        id: 'user-123',
        firstName: 'José',
        lastName: 'Müller',
        email: 'jose.muller@example.com',
        username: 'jose.muller',
      };

      mockValidationService.validateRegisterCommand.mockReturnValue(validatedCommand);
      mockRegisterUserUseCase.execute.mockResolvedValue(userWithUnicode);

      const result = await controller.register(registerData);

      expect(result).toEqual(ApiResponseBuilder.success(expectedResponse));
    });

    it('should handle long email addresses', async () => {
      const longEmail = 'very.long.email.address.with.many.dots@very-long-domain-name.example.com';
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: longEmail,
        password: 'SecurePassword123!',
      };

      const validatedCommand = {
        ...registerData,
        username: 'very.long.email.address.with.many.dots',
      };

      const userWithLongEmail = {
        ...mockUser,
        email: longEmail,
        username: 'very.long.email.address.with.many.dots',
      };

      const expectedResponse = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: longEmail,
        username: 'very.long.email.address.with.many.dots',
      };

      mockValidationService.validateRegisterCommand.mockReturnValue(validatedCommand);
      mockRegisterUserUseCase.execute.mockResolvedValue(userWithLongEmail);

      const result = await controller.register(registerData);

      expect(result).toEqual(ApiResponseBuilder.success(expectedResponse));
    });

    it('should handle missing properties in request body', async () => {
      const incompleteData = {
        firstName: 'John',
        // Missing lastName, email, password
      };

      const validationError = new Error('Missing required fields');
      mockValidationService.validateRegisterCommand.mockImplementation(() => {
        throw validationError;
      });

      await expect(controller.register(incompleteData as any)).rejects.toThrow(
        'Missing required fields'
      );

      expect(mockRegisterUserUseCase.execute).not.toHaveBeenCalled();
    });

    it('should handle null values in request body', async () => {
      const dataWithNulls = {
        firstName: null,
        lastName: null,
        email: null,
        password: null,
      };

      const validationError = new Error('Fields cannot be null');
      mockValidationService.validateRegisterCommand.mockImplementation(() => {
        throw validationError;
      });

      await expect(controller.register(dataWithNulls as any)).rejects.toThrow(
        'Fields cannot be null'
      );

      expect(mockRegisterUserUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('dependency injection', () => {
    it('should properly inject use case and validation service', () => {
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(AuthController);
    });
  });

  describe('error handling', () => {
    it('should propagate unexpected errors', async () => {
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'SecurePassword123!',
      };

      const unexpectedError = new Error('Unexpected server error');
      mockValidationService.validateRegisterCommand.mockImplementation(() => {
        throw unexpectedError;
      });

      await expect(controller.register(registerData)).rejects.toThrow('Unexpected server error');
    });

    it('should handle validation service returning undefined', async () => {
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'SecurePassword123!',
      };

      mockValidationService.validateRegisterCommand.mockReturnValue(undefined);
      mockRegisterUserUseCase.execute.mockResolvedValue(mockUser);

      // This should actually work since the use case is mocked to succeed
      // The validation service returning undefined doesn't necessarily mean an error
      const result = await controller.register(registerData);
      expect(result).toBeDefined();
    });
  });
});