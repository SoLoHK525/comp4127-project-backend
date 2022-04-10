import { Module, Post, UseGuards, Request } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RequestLoggerModule } from './request-logger/request-logger.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        AccountModule,
        AuthModule,
        UserModule,
        RequestLoggerModule,
        ScheduleModule.forRoot(),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', '..', 'frontend/build'),
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
