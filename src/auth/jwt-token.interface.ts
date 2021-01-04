export interface JwtToken<T> {
  expiresIn: string;
  accessToken: string;
  user?: T;
}
