import { UserType } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export abstract class SignUpDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Matches(/^\s*(\d{2}|\d{0})[-. ]?(\d{5}|\d{4})[-. ]?(\d{4})[-. ]?\s*$/, {
    message: 'Phone need to be a valid phone number',
  })
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(5)
  password: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  productKey?: string;
}

export abstract class SignInDTO {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export abstract class GenerateProductKeyDTO {
  @IsEmail()
  email: string;

  @IsEnum(UserType)
  userType: UserType;
}
