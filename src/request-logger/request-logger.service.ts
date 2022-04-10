import { Injectable } from '@nestjs/common';
import { Model } from '../database/model';
import { SHA256 } from 'crypto-js';
import * as moment from 'moment';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class RequestLoggerService extends Model<{
    requests: RequestLog[];
}> {
    constructor() {
        super('requests');
    }

    async onApplicationBootstrap() {
        await this.db.read();
        this.db.data ||= { requests: [] };
        await this.db.write();
    }

    // Prune expired requests every 5 minutes
    @Cron("0 */5 * * * *")
    pruneExpiredRequests() {
        this.db.data.requests = this.db.data.requests.filter((req) => {
            const fiveMinutesAgo = moment().subtract(5, 'minutes');
            return moment(req.requestTime).isAfter(fiveMinutesAgo);
        });
    }

    async isRequestSent(trace_id: string) {
        this.pruneExpiredRequests();

        const digest = SHA256(trace_id).toString();

        return this.db.data.requests.find(req => {
            return req.traceId === digest;
        }) != null;
    }

    async addRequest(trace_id: string, request_time: string) {
        const requestLog: RequestLog = {
            traceId: SHA256(trace_id).toString(),
            requestTime: moment(request_time).toISOString()
        }

        this.db.data.requests.push(requestLog);

        await this.db.write();
    }
}
