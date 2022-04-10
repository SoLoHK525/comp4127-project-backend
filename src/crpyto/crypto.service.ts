import { Injectable } from '@nestjs/common';
import { generateKeyPair, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { compare, genSalt, hash } from 'bcrypt';

@Injectable()
export class CryptoService {
    async generateKey(): Promise<string> {
        return new Promise((resolve, reject) => {
            randomBytes(24, (err, key) => {
                if (err) return reject(err);

                resolve(key.toString('base64'));
            });
        });
    }

    generateKeyPair(): Promise<{
        publicKey: string;
        privateKey: string;
    }> {
        return new Promise((resolve, reject) => {
            generateKeyPair(
                'rsa',
                {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem',
                    },
                    privateKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem',
                    },
                },
                (err, publicKey, privateKey) => {
                    if (err) return reject(err);

                    resolve({
                        publicKey,
                        privateKey,
                    });
                },
            );
        });
    }

    hashPassword(password: string) {
        const saltRounds = 10;

        return new Promise((resolve, reject) => {
            genSalt(saltRounds, function(err, salt) {
                hash(password, salt, function(err, hash) {
                    if (err) return reject(err);

                    resolve(hash);
                });
            });
        });
    }

    checkPassword(password: string, hashedPassword: string) {
        return new Promise((resolve, reject) => {
            compare(password, hashedPassword, function(err, result) {
                if (err) return reject(err);

                resolve(result);
            });
        });
    }

    base64ToKey(key: string) {
        return Buffer.from(key, 'base64');
    }

    encryptAES(key: string | Buffer, message: string) {
        const iv = randomBytes(16);
        const cipher = createCipheriv("aes-192-gcm", key, iv);
        let ciphered = cipher.update(message, "utf8", "base64");
        ciphered += cipher.final('base64');
        const authTag = cipher.getAuthTag();

        return iv.toString('hex') + ":" + authTag.toString('hex') + ":" + ciphered;
    }

    decryptAES(key: string | Buffer, cipherText: string) {
        const components = cipherText.split(":");
        const ivHex = components.shift();
        const authTagHex = components.shift();

        const iv = Buffer.from(ivHex, 'hex');
       const authTag = Buffer.from(authTagHex, 'hex');

        const decipher = createDecipheriv("aes-192-gcm", key, iv);
        decipher.setAuthTag(authTag);

        const cipher = components.join(':');
        let deciphered = decipher.update(cipher, 'base64', 'utf-8');
        deciphered += decipher.final('utf-8');

        return deciphered;
    }
}
