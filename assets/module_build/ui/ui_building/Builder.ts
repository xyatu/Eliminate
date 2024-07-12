import { instantiate, log, math, Node, NodeEventType, rect, Rect, size, sp, Sprite, SpriteFrame, UITransform, v2, v3, Vec3 } from "cc";
import { Layout_Building } from "./Layout_Building";
import { Layout_MapGrid } from "../map/Layout_MapGrid";
import { Coord, Coordinate } from "../../../module_eliminate/scripts/game/type/DataStructure";
import BuildMapManager from "../../script/manager/BuildMapManager";
import BuildGameConfig from "../../script/data/BuildGameConfig";
import { tgxUIAlert } from "../../../core_tgx/tgx";
import { UI_Building } from "./UI_Building";
import BuildGameUtil from "../../script/BuildGameUtil";

const directions = [
    { dx: -1, dy: 1 },  // 左上
    { dx: 0, dy: 1 },  // 上
    { dx: 1, dy: 1 },  // 右上
    { dx: -1, dy: 0 },   // 左
    { dx: 0, dy: 0 },   // 中
    { dx: 1, dy: 0 },  // 右
    { dx: -1, dy: -1 },   // 左下
    { dx: 0, dy: -1 },   // 下
    { dx: 1, dy: -1 },   // 右下
];

const autoTileMap: { [key: number]: number[] } = {
    0: [26, 27, 32, 33],
    1: [4, 27, 32, 33],
    2: [26, 5, 32, 33],
    3: [4, 5, 32, 33],
    4: [26, 27, 32, 11],
    5: [4, 27, 32, 11],
    6: [26, 5, 32, 11],
    7: [4, 5, 32, 11],
    8: [26, 27, 10, 33],
    9: [4, 27, 10, 33],
    10: [26, 5, 10, 33],
    11: [4, 5, 10, 33],
    12: [26, 27, 10, 11],
    13: [4, 27, 10, 11],
    14: [26, 5, 10, 11],
    15: [4, 5, 10, 11],
    16: [24, 25, 30, 31],
    17: [24, 5, 30, 31],
    18: [24, 25, 30, 11],
    19: [24, 5, 30, 11],
    20: [14, 15, 20, 21],
    21: [14, 15, 20, 11],
    22: [14, 15, 10, 21],
    23: [14, 15, 10, 11],
    24: [28, 29, 34, 35],
    25: [28, 29, 10, 35],
    26: [4, 29, 34, 35],
    27: [4, 29, 10, 35],
    28: [26, 27, 44, 45],
    29: [4, 39, 44, 45],
    30: [38, 5, 44, 45],
    31: [4, 5, 44, 45],
    32: [24, 29, 30, 35],
    33: [14, 15, 44, 45],
    34: [12, 13, 18, 19],
    35: [12, 13, 18, 11],
    36: [16, 17, 22, 23],
    37: [16, 17, 10, 23],
    38: [40, 41, 46, 47],
    39: [4, 41, 46, 47],
    40: [36, 37, 42, 43],
    41: [36, 5, 42, 43],
    42: [12, 17, 18, 23],
    43: [12, 13, 42, 43],
    44: [36, 41, 42, 47],
    45: [16, 17, 46, 47],
    46: [12, 17, 42, 47],
    47: [12, 17, 42, 47],
};

const visited = new Set<string>();

export class Builder {

    newCoord: Coordinate = new Coordinate();

    createDrag(layout: Layout_Building, spriteFrame: SpriteFrame, i: boolean): Node {
        layout.buildingDrag = instantiate(layout.buildingShow);
        let sprite = layout.buildingDrag.getComponent(Sprite);
        sprite.spriteFrame = spriteFrame;
        sprite.color = layout.node.getComponent(Sprite).color;
        if (i) this.setBuildingScale(layout, layout.buildingDrag, sprite);
        layout.buildingDrag.setPosition(v3(0));
        return layout.buildingDrag;
    }

    buildBuilding(layout: Layout_Building, ui: UI_Building): boolean {
        let building = instantiate(layout.building);

        this.BuildingBindEvent(building, ui);

        return layout.builder.build(layout, building, layout.buildingDrag.getWorldPosition());
    }

    BuildingBindEvent(building: Node, ui: UI_Building) {
        building.on(NodeEventType.TOUCH_START, ui.buildingTouchStart, ui, true);
        building.on(NodeEventType.TOUCH_MOVE, ui.buildingTouchMove, ui, true);
        building.on(NodeEventType.TOUCH_END, ui.buildingTouchEnd, ui, true);
        building.on(NodeEventType.TOUCH_CANCEL, ui.buildingTouchCancel, ui, true);
    }

    buildCheckVoid(layout, coord) {
        for (let i = 0; i < layout.shapeArray.length; i++) {
            for (let j = 0; j < layout.shapeArray[i].length; j++) {
                if (layout.shapeArray[i][j] !== 0) {
                    try {
                        if (!BuildMapManager.checkVoid(layout.buildingType, coord.x + j, coord.y + i)) {
                            return false;
                        }
                    } catch (error) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    build(layout: Layout_Building, building: Node, pos: Vec3): boolean {
        Layout_MapGrid.inst.node.addChild(building);
        building.setPosition(building.parent.getComponent(UITransform).convertToNodeSpaceAR(pos));

        let coord: Coordinate = BuildMapManager.getCoord(building.position.x + BuildGameConfig.size / 2, building.position.y + BuildGameConfig.size / 2);

        if (this.buildCheckVoid(layout, coord)) {
            building.setPosition(BuildMapManager.getPos(coord).x, BuildMapManager.getPos(coord).y, 0);
            BuildMapManager.place(coord.copy(), layout.buildingType, layout.shapeArray, building);
            this.drawAt(layout, coord, layout.buildingType, building)
            return true;
        } else {
            building.destroy();
            tgxUIAlert.show('格子已被占用或未完全在格内', false).setTitle('放置错误');
            return false;
        }
    }

    // 在row行，col列绘制一个自动地图元件
    drawAt(layout: Layout_Building, coord: Coordinate, type: number, building: Node) {

        for (const iterator of directions) {
            const newX = coord.x + iterator.dx;
            const newY = coord.y + iterator.dy;
            // 判断row和col是否越界
            if (newX < BuildGameConfig.row && newX >= 0 && newY < BuildGameConfig.col && newY >= 0) {
                this.updateTileState(layout, newY, newX, type, building);
            }
        }
    }
    drawTileIndex(layout: Layout_Building, row: number, col: number, index: number, building: Node) {
        // 根据index得到对应的小元件表
        let widget: number[] = autoTileMap[index]
        // 根据小元件表拼接成地图元件
        for (let index = 0; index < 4; index++) {
            BuildMapManager.nodeMapDit[layout.buildingType][row][col].getChildByName('mapWidget').children[index].getComponent(Sprite).spriteFrame = layout.tileSet[widget[index]];
        }
    }
    updateTileState(layout: Layout_Building, row: number, col: number, type: number, building: Node) {

        log(`data: ${BuildMapManager.dataMapDit[type][row][col]}, row: ${row}, col: ${col}, change: ${BuildMapManager.dataMapDit[type][col][row]}`)
        // 如果该位置没有地图元件，则直接返回
        if (!this.hasTileAt(row, col, type)) return;

        let state: number = 0b00000000;

        if (this.hasTileAt(row + 1, col, type)) {
            state |= 0b01000000;
        }
        if (this.hasTileAt(row - 1, col, type)) {
            state |= 0b00000010;
        }
        if (this.hasTileAt(row, col - 1, type)) {
            state |= 0b00010000;
        }
        if (this.hasTileAt(row, col + 1, type)) {
            state |= 0b00001000;
        }
        if (this.hasTileAt(row + 1, col - 1, type)) {
            if ((state | 0b01010000) == state) state |= 0b10000000;
        }
        if (this.hasTileAt(row + 1, col + 1, type)) {
            if ((state | 0b01001000) == state) state |= 0b00100000;
        }
        if (this.hasTileAt(row - 1, col - 1, type)) {
            if ((state | 0b00010010) == state) state |= 0b00000100;
        }
        if (this.hasTileAt(row - 1, col + 1, type)) {
            if ((state | 0b00001010) == state) state |= 0b00000001;
        }

        let index: number = 0;

        switch (state) {
            case 0b11111111: index = 0; break;
            case 0b01111111: index = 1; break;
            case 0b11011111: index = 2; break;
            case 0b01011111: index = 3; break;
            case 0b11111110: index = 4; break;
            case 0b01111110: index = 5; break;
            case 0b11011110: index = 6; break;
            case 0b01011110: index = 7; break;
            case 0b11111011: index = 8; break;
            case 0b01111011: index = 9; break;
            case 0b11011011: index = 10; break;
            case 0b01011011: index = 11; break;
            case 0b11111010: index = 12; break;
            case 0b01111010: index = 13; break;
            case 0b11011010: index = 14; break;
            case 0b01011010: index = 15; break;
            case 0b01101011: index = 16; break;
            case 0b01001011: index = 17; break;
            case 0b01101010: index = 18; break;
            case 0b01001010: index = 19; break;
            case 0b00011111: index = 20; break;
            case 0b00011110: index = 21; break;
            case 0b00011011: index = 22; break;
            case 0b00011010: index = 23; break;
            case 0b11010110: index = 24; break;
            case 0b11010010: index = 25; break;
            case 0b01010110: index = 26; break;
            case 0b01010010: index = 27; break;
            case 0b11111000: index = 28; break;
            case 0b01111000: index = 29; break;
            case 0b11011000: index = 30; break;
            case 0b01011000: index = 31; break;
            case 0b01000010: index = 32; break;
            case 0b00011000: index = 33; break;
            case 0b00001011: index = 34; break;
            case 0b00001010: index = 35; break;
            case 0b00010110: index = 36; break;
            case 0b00010010: index = 37; break;
            case 0b11010000: index = 38; break;
            case 0b01010000: index = 39; break;
            case 0b01101000: index = 40; break;
            case 0b01001000: index = 41; break;
            case 0b00000010: index = 42; break;
            case 0b00001000: index = 43; break;
            case 0b01000000: index = 44; break;
            case 0b00010000: index = 45; break;
            case 0b00000000: index = 46; break;
        }

        // log(col, row, index)

        // 判断其周围8个格子的状态state
        // 根据判断的状态确定情况的编号index
        this.drawTileIndex(layout, row, col, index, building);
    }

    hasTileAt(row: number, col: number, type: number) {
        if (col < BuildGameConfig.row && col >= 0 && row < BuildGameConfig.col && row >= 0) return BuildMapManager.dataMapDit[type][row][col] == 2;
        else return false;

    }

    setBuildingScale(layout: Layout_Building, node: Node, sprite: Sprite) {
        node.setScale(v3(1, 1, 1))
        node.setScale(v3(layout.size.x / sprite.spriteFrame.originalSize.x,
            layout.size.y / sprite.spriteFrame.originalSize.y, 1))
    }

    public static cropSpriteFrame(sourceSpriteFrame: SpriteFrame, cropRect: Rect): SpriteFrame {
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
}