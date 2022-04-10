import { Low, JSONFile } from 'lowdb'
import { join, resolve } from "path";
import { existsSync, mkdirSync } from 'fs';

export class Model<T> {
    protected db: Low<T>;

    constructor(collection: string) {
        const path = resolve(__dirname + "/../storage/db");

        if(!existsSync(path)) {
           mkdirSync(path, {
               recursive: true
           });
        }

        const file = join(path, `${collection}.json`);
        const adapter = new JSONFile(file);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.db = new Low(adapter);
    }
}
