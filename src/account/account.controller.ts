import { BadRequestException, Body, Controller, ForbiddenException, Get, Post, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { AuthUser } from '../decorators/auth_user.decorator';
import { User } from '../user/user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SecureRequestGuard } from '../guards/SecureRequestGuard';

@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    @UseGuards(SecureRequestGuard)
    @UseGuards(JwtAuthGuard)
    @Post('/create')
    create(@AuthUser() user: User, @Body('name') name: string) {
        return this.accountService.createAccount(user.uid, name);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/')
    listAccounts(@AuthUser() user: User) {
        return this.accountService.listAccounts(user.uid);
    }

    @UseGuards(SecureRequestGuard)
    @UseGuards(JwtAuthGuard)
    @Post('/transfer')
    async transfer(
        @AuthUser() user: User,
        @Body('sender_id') sender_id: string,
        @Body('receiver_id') receiver_id: string,
        @Body('amount') amount: number
    ) {
        const sender = this.accountService.find(sender_id);
        const receiver = this.accountService.find(receiver_id);

        if(!sender) {
            // throw error
            throw new BadRequestException("Invalid sender address");
        }

        if(!receiver) {
            // throw error
            throw new BadRequestException("Invalid receiver address");
        }

        if(sender === receiver) {
            throw new BadRequestException("Receiver address cannot be the same as sender address");
        }

        if(amount <= 0) {
            // throw error
            throw new BadRequestException("Amount must be greater than 0");
        }

        if(await this.accountService.transfer(sender, receiver, amount)){
            return true;
        }else{
            throw new ForbiddenException("Insufficient Balance");
        }
    }
}
