import { Injectable } from '@nestjs/common';
import { CryptoService } from '../crpyto/crypto.service';
import { Model } from '../database/model';
import { SerializedUser, User } from './user.interface';
import { v4 } from 'uuid';
import { EncryptSecret } from '../config';

@Injectable()
export class UserService extends Model<{
    users: SerializedUser[];
}> {
    constructor(private readonly cryptoService: CryptoService) {
        super('users');
    }

    async onApplicationBootstrap() {
        await this.db.read();
        this.db.data ||= { users: [] };
        await this.db.write();
    }

    update(user: User) {
        const index = this.db.data.users.findIndex((u) => user.uid === u.uid);

        if(index < 0) {
            return false;
        }

        this.db.data.users[index] = this.serializeUser(user);

        return true;
    }

    async createUser(username: string, password: string) {
        if (this.findUser(username) != null) {
            return false;
        }

        const uid = v4();

        const signingKey =
            await this.cryptoService.generateKey();

        const user: User = {
            uid,
            username,
            password,
            data: {
                signingKey
            },
        };

        this.db.data.users.push(this.serializeUser(user));
        await this.db.write();

        return true;
    }

    find(uid: string) {
        const user = this.db.data.users.find(user => user.uid === uid);

        if(user)
            return this.deserializeUser(user);

        return null;
    }

    findUser(username: string) {
        const user = this.db.data.users.find((user) => user.username === username);

        if(user) {
            return this.deserializeUser(user);
        }

        return null;
    }

    serializeUser({ data, ...other }: User): SerializedUser {
        const key = this.cryptoService.base64ToKey(EncryptSecret);

        return {
            data: this.cryptoService.encryptAES(key, JSON.stringify(data)),
            ...other,
        };
    }

    deserializeUser({ data, ...other }: SerializedUser): User {
        const key = this.cryptoService.base64ToKey(EncryptSecret);

        return {
            data: JSON.parse(this.cryptoService.decryptAES(key, data)),
            ...other,
        };
    }
}
