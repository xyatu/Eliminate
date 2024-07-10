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

    @property(SpriteAtlas)
    spriteAtlas: SpriteAtlas = null;

    shape: string = '1';

    shapeArray: number[][] = [];

    buildingType: number = 1;

    buildingDrag: Node = null;

    dragNum: number = 0;

    initialPosition: Vec3 = new Vec3();

    offset: Vec3 = new Vec3();

    buildingWasMove: boolean = false;

    builder: Builder = new Builder();

    size: Size = new Size();

}


