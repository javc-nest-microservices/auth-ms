import { Injectable } from '@nestjs/common'

@Injectable()
export class AuthService {
  registerUser() {
    return 'User registered'
  }

  loginUser() {
    return 'User logged in'
  }

  verifyUser() {
    return 'User verified'
  }
}
