import { IUserRepository } from '../repositories/IUserRepository';
import { Username } from '../value-objects/Username';
import { Email } from '../value-objects/Email';
import { UserEmailAlreadyExistsException } from '../exceptions/DomainExceptions';

export class UserDomainService {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Generates a unique username from an email address
   * If the base username exists, appends incremental numbers
   */
  async generateUniqueUsername(email: string): Promise<string> {
    const emailObj = Email.create(email);
    const baseUsername = emailObj.getLocalPart();
    
    // Validate base username format
    try {
      Username.create(baseUsername);
    } catch (error) {
      // If base username from email is invalid, fallback to generic pattern
      return await this.generateFallbackUsername();
    }

    // Check if base username is available
    const exists = await this.userRepository.existsByUsername(baseUsername);
    if (!exists) {
      return baseUsername;
    }

    // Find unique username with incremental suffix
    let counter = 1;
    let candidateUsername = `${baseUsername}${counter}`;
    
    while (await this.userRepository.existsByUsername(candidateUsername)) {
      counter++;
      candidateUsername = `${baseUsername}${counter}`;
      
      // Prevent infinite loops
      if (counter > 1000) {
        throw new Error('Unable to generate unique username');
      }
    }

    return candidateUsername;
  }

  /**
   * Generates a fallback username pattern when email local part is invalid
   */
  private async generateFallbackUsername(): Promise<string> {
    const baseUsername = 'user';
    let counter = 1;
    let candidateUsername = `${baseUsername}${counter}`;
    
    while (await this.userRepository.existsByUsername(candidateUsername)) {
      counter++;
      candidateUsername = `${baseUsername}${counter}`;
      
      if (counter > 10000) {
        throw new Error('Unable to generate fallback username');
      }
    }

    return candidateUsername;
  }

  /**
   * Validates that email is unique in the system
   */
  async validateEmailUniqueness(email: string): Promise<void> {
    const exists = await this.userRepository.existsByEmail(email);
    if (exists) {
      throw new UserEmailAlreadyExistsException(email);
    }
  }
}