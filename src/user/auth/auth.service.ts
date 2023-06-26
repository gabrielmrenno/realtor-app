import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserType } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

interface SignUpParams {
  name: string;
  email: string;
  password: string;
  phone: string;
  userType: UserType;
}

interface AuthReturn {
  token: string;
}

interface SignInParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp({
    email,
    name,
    password,
    phone,
    userType = UserType.BUYER,
  }: SignUpParams): Promise<AuthReturn> {
    const userAlreadyExists = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (userAlreadyExists) {
      throw new BadRequestException('User already exists');
    }

    const hashPassword = await hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email,
        name,
        password: hashPassword,
        phone,
        userType,
      },
    });

    const token = await this.generateToken(user.id, user.name);

    return {
      token,
    };
  }

  async signIn({ email, password }: SignInParams): Promise<AuthReturn> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordMatched = await compare(password, user.password);

    if (!isPasswordMatched) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = await this.generateToken(user.id, user.name);

    return {
      token,
    };
  }

  private async generateToken(id: number, name: string): Promise<string> {
    const payload = {
      sub: id,
      name: name,
    };

    const token = await this.jwtService.signAsync(payload);

    return token;
  }

  async generateProductKey(email: string, userType: UserType): Promise<string> {
    const baseString = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;

    const productKey = await hash(baseString, 10);

    return productKey;
  }
}
