import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CryptoService } from '../crpyto/crypto.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly cryptoService: CryptoService,
        private jwtService: JwtService
    ) {
    }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.userService.findUser(username);

        if (user) {
            const { password: hashedPassword, ...remaining } = user;
            if(await this.cryptoService.checkPassword(password, hashedPassword)) {
                return remaining;
            }
        }

        return null;
    }

    async login(user: User) {
        const payload = { username: user.username, uid: user.uid, signingKey: user.data.signingKey };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                signingKey: user.data.signingKey,
                uid: user.uid,
                username: user.username
            }
        };
    }

    async register(username: string, password: string) {
        const hashedPassword = await this.cryptoService.hashPassword(password) as string;

        return this.userService.createUser(username, hashedPassword);
    }
}

