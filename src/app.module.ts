import { Module, Post, UseGuards, Request } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RequestLoggerModule } from './request-logger/request-logger.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [AccountModule, AuthModule, UserModule, RequestLoggerModule, ScheduleModule.forRoot()],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
