import { User } from '../entities';

export interface JwtToken {
  expiresIn: string;
  accessToken: string;
  user?: User;
}
