import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { SecureRequestGuard } from './guards/SecureRequestGuard';


@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @UseGuards(SecureRequestGuard)
    @UseGuards(JwtAuthGuard)
    @Post('test')
    test(@Request() request: Request) {
        return 'hi';
    }
}
