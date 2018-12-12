import { ApiModelProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiModelProperty()
  email: string;

  @ApiModelProperty()
  password: string;
}

export class RegisterDto {
  @ApiModelProperty()
  email: string;

  @ApiModelProperty()
  password: string;

  @ApiModelProperty()
  firstName: string;

  @ApiModelProperty()
  lastName: string;
}

export class PasswordRecoveryDto {
  @ApiModelProperty()
  email: string;
}

export class PasswordResetDto {
  @ApiModelProperty()
  password: string;

  @ApiModelProperty()
  token: string;
}
