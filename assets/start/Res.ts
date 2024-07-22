import { error, log, SpriteAtlas, warn } from "cc";

export class Res {

    public static spriteAtlas: { [key: string]: SpriteAtlas } = {};

    constructor() {
        warn(`ResManager has been created`)
    }
}