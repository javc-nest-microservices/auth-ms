import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { LoginUserDto, RegisterUserDto } from './dto'
import { PrismaClient } from '@prisma/client'
import { RpcException } from '@nestjs/microservices'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService')

  onModuleInit() {
    this.$connect()
    this.logger.log('Connected to the database')
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email, password, name } = registerUserDto
    try {
      const user = await this.user.findUnique({
        where: {
          email
        }
      })

      if (user) {
        throw new RpcException({ status: 400, message: 'User already exists' })
      }

      const newUser = await this.user.create({
        data: {
          email,
          password: bcrypt.hashSync(password, 10),
          name
        }
      })

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = newUser

      return {
        user: userWithoutPassword,
        token: 'token'
      }
    } catch (error) {
      throw new RpcException({ status: 400, message: error.message })
    }
  }

  loginUser(loginUserDto: LoginUserDto) {
    return loginUserDto
  }

  verifyToken() {
    return 'Token verified'
  }
}
