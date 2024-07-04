import { _decorator, Component, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

import { TileType } from "../type/Enum";

@ccclass('ResManager')
export default class ResManager extends Component {

    @property(SpriteFrame)
    private a: SpriteFrame | null = null;

    @property(SpriteFrame)
    private b: SpriteFrame | null = null;

    @property(SpriteFrame)
    private c: SpriteFrame | null = null;

    @property(SpriteFrame)
    private d: SpriteFrame | null = null;

    @property(SpriteFrame)
    private e: SpriteFrame | null = null;

    private static instance: ResManager = null;

    protected onLoad() {
        ResManager.instance = this;
    }
    /**
     * 获取方块图片资源
     * @param tileType 方块类型
     */
    public static getTileSpriteFrame(tileType: TileType): SpriteFrame {
        switch (tileType) {
            case TileType.A:
                return this.instance.a;
            case TileType.B:
                return this.instance.b;
            case TileType.C:
                return this.instance.c;
            case TileType.D:
                return this.instance.d;
            case TileType.E:
                return this.instance.e;
        }
    }
}
