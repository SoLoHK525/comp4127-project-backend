import { Injectable } from '@nestjs/common';
import { Model } from '../database/model';
import { Account, SerializedAccount } from './account.interface';
import { v4 } from 'uuid';
import { CryptoService } from '../crpyto/crypto.service';
import { EncryptSecret } from '../config';

@Injectable()
export class AccountService extends Model<{
    accounts: SerializedAccount[];
}> {
    constructor(private readonly cryptoService: CryptoService) {
        super('accounts');
    }

    async onApplicationBootstrap() {
        await this.db.read();
        this.db.data ||= { accounts: [] };
        await this.db.write();
    }

    find(account_id: string) {
        const account = this.db.data.accounts.find((account) => account.identifier === account_id);

        if (account) {
            return this.deserializeAccount(account);
        }

        return null;
    }

    update(account: Account) {
        const index = this.db.data.accounts.findIndex((a) => a.identifier === account.identifier);

        if (index < 0) {
            return false;
        }

        this.db.data.accounts[index] = this.serializeAccount(account);

        return true;
    }

    async listAccounts(userid: string) {
        return this.db.data.accounts
            .filter((account) => {
                return account.owner === userid;
            })
            .map((account) => {
                return this.deserializeAccount(account);
            });
    }

    async createAccount(owner: string, name: string) {
        let identifier = v4();

        while (this.db.data.accounts.find((b) => b.identifier === identifier) != null) {
            identifier = v4();
        }

        const account: Account = {
            identifier,
            owner,
            name,
            data: {
                balance: 1000.0,
            },
        };

        this.db.data.accounts.push(this.serializeAccount(account));

        await this.db.write();

        return account;
    }

    async transfer(senderSrc: Account, receiverSrc: Account, amountRaw: string | number) {
        const sender = this.find(senderSrc.identifier);
        const amount = parseFloat(String(amountRaw));

        if (sender.data.balance < amount) {
            return false;
        }

        const receiver = this.find(receiverSrc.identifier);
        sender.data.balance -= amount;
        receiver.data.balance += amount;

        const senderUpdated = this.update(sender);
        const receiverUpdated = this.update(receiver);

        if (senderUpdated && receiverUpdated) {
            await this.db.write();
            return true;
        }

        return false;
    }

    private serializeAccount({ data, ...other }: Account): SerializedAccount {
        const key = this.cryptoService.base64ToKey(EncryptSecret);

        return {
            data: this.cryptoService.encryptAES(key, JSON.stringify(data)),
            ...other,
        };
    }

    private deserializeAccount({ data, ...other }: SerializedAccount): Account {
        const key = this.cryptoService.base64ToKey(EncryptSecret);

        return {
            data: JSON.parse(this.cryptoService.decryptAES(key, data)),
            ...other,
        };
    }
}
