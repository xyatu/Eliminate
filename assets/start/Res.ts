import { AudioClip, error, log, SpriteAtlas, SpriteFrame, warn } from "cc";

export class Res {

    public static spriteAtlas: { [key: string]: SpriteAtlas } = {};

    public static spriteFrame: { [key: string]: SpriteFrame } = {};

    public static audio: {[key: string]: AudioClip} = {};

    constructor() {
        warn(`ResManager has been created`)
    }
}