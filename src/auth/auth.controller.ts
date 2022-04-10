import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    Request,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthUser } from '../decorators/auth_user.decorator';
import { User } from '../user/user.interface';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) {
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get("/")
    async auth(@AuthUser() user: User) {
        return user;
    }

    @Post('register')
    async register(@Body('username') username: string, @Body('password') password: string) {
        if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
            throw new BadRequestException("Password must contain minimum of eight characters, at least one letter and one number")
        }

        if(await this.authService.register(username, password)) {
            return true;
        }else{
            throw new UnauthorizedException("Username has been registered");
        }
    }
}
