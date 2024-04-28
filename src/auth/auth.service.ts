import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { LoginUserDto, RegisterUserDto } from './dto'
import { PrismaClient } from '@prisma/client'
import { RpcException } from '@nestjs/microservices'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { IJwtPayload } from './interfaces'
import { envs } from 'src/config'

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService')

  constructor(private readonly jwtService: JwtService) {
    super()
  }

  onModuleInit() {
    this.$connect()
    this.logger.log('Connected to the database')
  }

  async signJWT(payload: IJwtPayload) {
    return this.jwtService.sign(payload)
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
        token: await this.signJWT(userWithoutPassword)
      }
    } catch (error) {
      throw new RpcException({ status: 400, message: error.message })
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto
    try {
      const user = await this.user.findUnique({
        where: {
          email
        }
      })

      if (!user) {
        throw new RpcException({ status: 400, message: 'Invalid Credentials' })
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password)

      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid'
        })
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user

      return {
        user: userWithoutPassword,
        token: await this.signJWT(userWithoutPassword)
      }
    } catch (error) {
      throw new RpcException({ status: 400, message: error.message })
    }
  }

  async verifyToken(token: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret
      })
      return {
        user,
        token: await this.signJWT(user)
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Invalid token'
      })
    }
  }
}
