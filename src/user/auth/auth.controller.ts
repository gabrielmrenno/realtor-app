import {
  Body,
  Controller,
  Param,
  ParseEnumPipe,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { UserType } from '@prisma/client';
import { compare } from 'bcrypt';
import { GenerateProductKeyDTO, SignInDTO, SignUpDTO } from '../dtos/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/:userType')
  async signUp(
    @Body() body: SignUpDTO,
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
  ) {
    if (userType !== UserType.BUYER) {
      const { productKey } = body;

      if (!productKey) {
        throw new UnauthorizedException('Product key is required');
      }

      const baseProductKeyString = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;

      const isValidProductKey = await compare(baseProductKeyString, productKey);

      if (!isValidProductKey) {
        throw new UnauthorizedException('Invalid product key');
      }
    }

    const { token } = await this.authService.signUp({ ...body, userType });
    return {
      message: 'User created successfully',
      data: {
        token,
      },
    };
  }

  @Post('signin')
  async signIn(@Body() body: SignInDTO) {
    const { token } = await this.authService.signIn(body);
    return {
      message: 'User logged in successfully',
      data: {
        token,
      },
    };
  }

  @Post('key')
  generateProductKey(@Body() { email, userType }: GenerateProductKeyDTO) {
    return this.authService.generateProductKey(email, userType);
  }
}
