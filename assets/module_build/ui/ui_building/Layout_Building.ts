import { _decorator, Component, EventTouch, instantiate, Node, Prefab, Size, sp, Sprite, SpriteAtlas, SpriteFrame, UITransform, v3, Vec3 } from 'cc';
import { Builder } from './Builder';
const { ccclass, property } = _decorator;

@ccclass('LayputBuilding')
export class Layout_Building extends Component {

    @property(SpriteFrame)
    sprite: SpriteFrame = null;

    @property(Prefab)
    building: Prefab = null;

    @property(Prefab)
    buildingShow: Prefab = null;

    @property(SpriteFrame)
    autoTileSet: SpriteFrame = null;

    @property(Node)
    test: Node = null;

    shape: string = '2';

    tileSet: SpriteFrame[] = [];

    shapeArray: number[][] = [];

    buildingType: number = 1;

    buildingDrag: Node = null;

    dragNum: number = 0;

    initialPosition: Vec3 = new Vec3();

    offset: Vec3 = new Vec3();

    buildingWasMove: boolean = false;

    builder: Builder = new Builder();

    size: Size = new Size();

    count: number = 0;

    showUI(){
        for (let index = 0; index < this.tileSet.length; index++) {
            this.test.children[index].getComponent(Sprite).spriteFrame = this.tileSet[index];
        }
        this.test.children[0].getComponent(Sprite).spriteFrame = this.tileSet[16];
        this.test.children[1].getComponent(Sprite).spriteFrame = this.tileSet[17];
        this.test.children[6].getComponent(Sprite).spriteFrame = this.tileSet[46];
        this.test.children[7].getComponent(Sprite).spriteFrame = this.tileSet[47];
    }

}


