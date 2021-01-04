import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}

export class RegisterDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;
}

export class PasswordRecoveryDto {
  @ApiProperty()
  email: string;
}

export class PasswordResetDto {
  @ApiProperty()
  password: string;

  @ApiProperty()
  token: string;
}

export class LoginGoogleDto {
  @ApiProperty()
  token: string;
}
