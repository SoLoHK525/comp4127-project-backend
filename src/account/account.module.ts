import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { CryptoService } from '../crpyto/crypto.service';

@Module({
  controllers: [AccountController],
  providers: [AccountService, CryptoService]
})
export class AccountModule {}
