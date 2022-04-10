import { Global, Module } from '@nestjs/common';
import { RequestLoggerService } from './request-logger.service';
import { CryptoService } from '../crpyto/crypto.service';

@Global()
@Module({
  providers: [RequestLoggerService, CryptoService],
  exports: [RequestLoggerService]
})
export class RequestLoggerModule {}
