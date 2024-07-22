import { _decorator, Asset, assetManager, Component, log, Node, rect, Rect, sp, SpriteAtlas, SpriteFrame, v2 } from 'cc';
import { building_data, getbuilding_dataById } from './data/building_data';
import { Res } from './Res';
import BuildGameConfig from '../module_build/script/data/BuildGameConfig';
import { role_data } from './data/role_data';
const { ccclass, property } = _decorator;

const direction = ['u', 'd', 'l', 'r'];

export class Building {
    id: number;
    layer: number;
    type: number;
    active: number;
    colShape: number[][];
    buildShape: number[][];
    anim: Anim;
    autoTile: number;
    proserity: number;
    price: number;

    constructor(
        id: number,
        layer: number,
        type: number,
        active: number,
        colShape: number[][],
        buildShape: number[][],
        anim: Anim,
        autoTile: number,
        proserity: number,
        price: number,
    ) {
        this.id = id;
        this.layer = layer;
        this.type = type;
        this.active = active;
        this.colShape = colShape;
        this.buildShape = buildShape;
        this.anim = anim;
        this.autoTile = autoTile;
        this.proserity = proserity;
        this.price = price;
    }
}

export class Role {
    id: number;
    anim: { animname: string, anim: Anim }[] = [];
    moveTime: number;

    constructor(
        id: number,
        idle: SpriteFrame[],
        move: SpriteFrame[][],
        isLoop: boolean,
        rate: number,
        moveTime: number) {
        this.id = id;

        this.anim.push({ animname: `idle`, anim: new Anim(idle, isLoop, rate) });

        for (let index = 0; index < direction.length; index++) {
            this.anim.push({ animname: `move${direction[index]}`, anim: new Anim(move[index], isLoop, rate) });
        }
        this.moveTime = moveTime;
    }
}

export class SceneAnim {
    id: number;
    anim: Anim;

    constructor(
        id: number,
        anim: Anim) {
        this.id = id;
        this.anim = anim;
    }
}

export class Anim {
    anim: SpriteFrame[];
    isLoop: boolean;
    rate: number;

    constructor(
        anim: SpriteFrame[],
        isloop: boolean,
        rate: number
    ) {
        this.anim = anim;
        this.isLoop = isloop;
        this.rate = rate;
    }
}

export class NumSprite {

    num: SpriteFrame[] = [];

    jsNum: SpriteFrame[] = [];
    point: SpriteFrame = null;

    timeNum: SpriteFrame[] = [];

    week: SpriteFrame[] = [];

}

@ccclass('DataGetter')
export class DataGetter extends Component {

    public static inst: DataGetter;

    buildingdata: Building[] = [];
    roledata: Role[] = [];
    animdata: SceneAnim[] = [];

    numSprite: NumSprite = new NumSprite();

    protected onLoad(): void {
        if (DataGetter.inst) return;
        DataGetter.inst = this;
    }

    async loadRes() {
        this.loadBuilding();
        this.loadRole();
        this.loadSundries();
    }

    loadBuilding() {
        for (const key in building_data) {
            let data = building_data[key];
            let spriteFrames: SpriteFrame[] = [];

            if (data["automatic"] === 1) {
                for (let i = 0; i < BuildGameConfig.autoTileHeight / BuildGameConfig.autoTileSize; i++) {
                    for (let j = 0; j < BuildGameConfig.autoTileWidth / BuildGameConfig.autoTileSize; j++) {
                        spriteFrames.push(this.cropSpriteFrame(Res.spriteAtlas[data["plist"]].getSpriteFrame(data["anim"]), rect(BuildGameConfig.autoTileSize * j, BuildGameConfig.autoTileSize * i, BuildGameConfig.autoTileSize, BuildGameConfig.autoTileSize)))
                    }
                }
            }
            else {
                data["anim"].toString().split(",").forEach(frameName => {
                    spriteFrames.push(Res.spriteAtlas[data["plist"]].getSpriteFrame(frameName));
                })
            }


            let building = new Building(
                data["id"],
                data["layer"],
                data["type"],
                data["ave"],
                this.setShape(data["shape"]),
                this.setShape(data["build"]),
                new Anim(spriteFrames, data["loop"], data["rate"]),
                data["automatic"],
                data["prosperous"],
                data["price"]);

            this.buildingdata.push(building);
        }
    }

    setShape(shape: string): number[][] {
        let shapeArr: number[][] = [];
        shape.toString().split(';').reverse().forEach(row => {
            let rowArr: number[] = [];
            for (let index = 0; index < row.length; index++) {
                const element = row[index];
                rowArr.push(parseInt(element));
            }

            shapeArr.push(rowArr);
        })

        shapeArr = shapeArr.reverse();

        return shapeArr;
    }

    cropSpriteFrame(sourceSpriteFrame: SpriteFrame, cropRect: Rect): SpriteFrame {
        // 创建一个新的 SpriteFrame
        const croppedSpriteFrame = new SpriteFrame();

        // 设置新的 SpriteFrame 使用的原始纹理
        croppedSpriteFrame.texture = sourceSpriteFrame.texture;

        // 设置裁剪区域
        croppedSpriteFrame.rect = cropRect;

        // 设置原点和偏移（如果有必要）
        croppedSpriteFrame.offset = v2(0, 0); // 根据需求调整
        croppedSpriteFrame.originalSize = cropRect.size;

        return croppedSpriteFrame;
    }

    loadRole() {
        for (const key in role_data) {
            let data = role_data[key];

            let idle: SpriteFrame[] = [];

            data['idleAnim'].toString().split(',').forEach(spriteFrame => {
                idle.push(Res.spriteAtlas[data['plist']].getSpriteFrame(spriteFrame))
            })

            let move: SpriteFrame[][] = [];

            data['moveAnim'].toString().split(';').forEach(anim => {
                let moveanim: SpriteFrame[] = [];
                anim.split(',').forEach(spriteFrame => {
                    moveanim.push(Res.spriteAtlas[data['plist']].getSpriteFrame(spriteFrame))
                })
                move.push(moveanim);
            })

            this.roledata.push(
                new Role(
                    data['id'],
                    idle,
                    move,
                    data['loop'],
                    data['rate'],
                    data['moveSpeed']
                )
            );
        }
    }

    loadSundries() {
        let atlas = Res.spriteAtlas['shuzi'];
        for (let index = 0; index < 10; index++) {
            this.numSprite.num.push(atlas.getSpriteFrames()[index]);
        }

        for (let index = 0 + 10; index < 10 + 10; index++) {
            this.numSprite.jsNum.push(atlas.getSpriteFrames()[index]);
        }

        this.numSprite.point = atlas.getSpriteFrames()[0 + 10 + 10];

        for (let index = 0 + 10 + 10 + 1; index < 0 + 10 + 10 + 1 + 10; index++) {
            this.numSprite.timeNum.push(atlas.getSpriteFrames()[index]);
        }

        for (let index = 0 + 10 + 10 + 1 + 10; index < 0 + 10 + 10 + 1 + 10 + 7; index++) {
            this.numSprite.week.push(atlas.getSpriteFrames()[index]);
        }
    }

}