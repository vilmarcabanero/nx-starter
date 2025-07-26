import { injectable } from 'tsyringe';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
  role?: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  issuer: string;
  audience: string;
}

/**
 * JWT service interface
 */
export interface IJwtService {
  generateToken(payload: JwtPayload): string;
  verifyToken(token: string): JwtPayload;
}

/**
 * JWT service implementation using jsonwebtoken
 */
@injectable()
export class JwtService implements IJwtService {
  private readonly config: JwtConfig;

  constructor(config: JwtConfig) {
    // Validate required configuration
    if (!config.secret || config.secret === '') {
      throw new Error('JWT secret is required');
    }
    if (!config.expiresIn || config.expiresIn === '') {
      throw new Error('JWT expiresIn is required');
    }
    if (!config.issuer || config.issuer === '') {
      throw new Error('JWT issuer is required');
    }
    if (!config.audience || config.audience === '') {
      throw new Error('JWT audience is required');
    }
    
    this.config = config;
  }

  /**
   * Generates a JWT token with user payload
   * Token expires in 24 hours by default
   */
  generateToken(payload: JwtPayload): string {
    try {
      return jwt.sign(payload, this.config.secret, {
        expiresIn: this.config.expiresIn,
        issuer: this.config.issuer,
        audience: this.config.audience,
      } as jwt.SignOptions);
    } catch (error) {
      throw new Error('Failed to generate JWT token');
    }
  }

  /**
   * Verifies and decodes a JWT token
   */
  verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.config.secret, {
        issuer: this.config.issuer,
        audience: this.config.audience,
      } as jwt.VerifyOptions);
      
      if (typeof decoded === 'object' && decoded !== null) {
        return decoded as JwtPayload;
      }
      
      throw new Error('Invalid token payload');
    } catch (error) {
      throw new Error('Invalid or expired JWT token');
    }
  }
}