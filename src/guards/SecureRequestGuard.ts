import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { pick, transform } from 'lodash';
import * as moment from 'moment';
import { enc, HmacSHA256, SHA256 } from 'crypto-js';
import { RequestLoggerService } from '../request-logger/request-logger.service';

const signHeaders = (
    headers: {
        [key: string]: string;
    },
    key: string,
): string => {
    const headerString = Object.keys(headers).map((key) => {
        return key.toLowerCase();
    });
    // compute sig here
    let signingBase = '';

    for (const [key, value] of Object.entries(headers)) {
        if (signingBase !== '') {
            signingBase += '\n';
        }

        signingBase += key.toLowerCase() + ': ' + value;
    }

    const signature = HmacSHA256(signingBase, key).toString();

    return `headers="${headerString}",signature="${enc.Base64.stringify(enc.Utf8.parse(signature))}"`;
};

@Injectable()
export class SecureRequestGuard implements CanActivate {
    constructor(private readonly requestLoggerService: RequestLoggerService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const user = (request as any).user;

        const headers: { [key: string]: string } = transform(request.headers, (result, val: any, key: any) => {
            result[key.toLowerCase()] = val;
        });

        const requiredHeaders = ['digest', 'x-request-time', 'signature', 'trace-id'];
        const validHeaders = requiredHeaders.every((item) => item in headers);

        if (validHeaders) {
            // Check if signature header is valid
            const signatureHeader = headers['signature'].split(/="|",|"/);
            if (signatureHeader.length < 4 || signatureHeader[0] != 'headers' || signatureHeader[2] != 'signature') {
                throw new BadRequestException('Invalid Signature Header');
            }

            const signedHeaders = signatureHeader[1].split(',');
            const signingHeaders = ['authorization', 'trace-id', 'x-request-time', 'digest'];

            const validSignedHeaders = signingHeaders.every((h) => signedHeaders.includes(h));

            if (!validSignedHeaders) {
                throw new BadRequestException('Insufficient header signature');
            }

            const signatureHeaders = pick(headers, signedHeaders);
            const signature = signHeaders(signatureHeaders, user.signingKey);

            const validHeader = signature === headers['signature'];

            if (!validHeader) {
                throw new BadRequestException('Invalid header signature');
            }

            // Check if the message is sent within 5 minutes
            const requestTime = request.headers['x-request-time'];
            const fiveMinutesAgo = moment().subtract(5, 'minutes');
            const validRequestTime = moment(requestTime).isAfter(fiveMinutesAgo);

            if (!validRequestTime) {
                throw new BadRequestException('Request time timed-out');
            }

            // Check if a message has already been sent
            const traceId = request.headers['trace-id'];
            const sent = await this.requestLoggerService.isRequestSent(traceId);
            if(sent) {
                throw new BadRequestException("Replaying request is not allowed");
            }

            // Check if body digest is valid
            const bodyDigest = `SHA256=${SHA256(JSON.stringify(request.body))}`;
            const validBody = bodyDigest === request.headers['digest'];

            if (!validBody) {
                throw new BadRequestException('Invalid body digest');
            }

            await this.requestLoggerService.addRequest(traceId, requestTime);

            return true;
        }

        throw new BadRequestException('Missing HTTP Signing');
    }
}
