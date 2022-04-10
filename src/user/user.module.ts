import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { CryptoService } from '../crpyto/crypto.service';

@Module({
  providers: [UserService, CryptoService],
  exports: [UserService]
})
export class UserModule {}
