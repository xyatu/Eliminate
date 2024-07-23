import { _decorator, Component, find, instantiate, log, Node, Sprite, UITransform, Vec3, view } from "cc";

import { Coord, Coordinate } from "../../../module_eliminate/scripts/game/type/DataStructure";
import BuildMapManager from "../../script/manager/BuildMapManager";
import BuildGameConfig from "../../script/data/BuildGameConfig";
import { tgxUIAlert, tgxUIEditAlert } from "../../../core_tgx/tgx";
import BuildGameUtil from "../../script/BuildGameUtil";
import { BuildingState } from "../../script/building/BuildingState";
import { Building, DataGetter } from "../../../start/DataGetter";
import { Layout_MapGrid } from "../../ui/map/Layout_MapGrid";
import { GameManager } from "../../../start/GameManager";
import { BuilderComp } from "./BuilderComp";
const { ccclass, property } = _decorator;

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

const directions_Four = [
    { dx: 0, dy: 1 },  // 上
    { dx: 0, dy: -1 },   // 下
    { dx: -1, dy: 0 },   // 左
    { dx: 1, dy: 0 },  // 右
];

const fence: { [key: string]: number } = {
    on_L: 0, //左端
    on_R: 1, //右端
    on_LU: 2, //左上
    on_HM: 3, //中_横
    on_RU: 4, //右上
    on_U: 5, //上
    on_VM: 6, //中_竖
    on_alone: 7, //单独
    on_D: 8, //下端
    on_LD: 9, //左下
    on_RD: 10, //右下
}

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

@ccclass('Builder')
export class Builder extends Component {

    public static inst: Builder;

    static isBuilding: boolean = false;

    protected onLoad(): void {
        Builder.inst = this;
    }

    loadMap() {
        GameManager.inst.playerState.building.forEach(building => {
            let data: Building = DataGetter.inst.buildingdata.find(buildingdata => building.id === buildingdata.id);
            let node: Node = this.createBuilding(data);
            this.tryBuild(node, data, true, building.coord);
            node.getComponent(BuildingState).unSelect();
        });

        BuildGameUtil.saveBuilding();
    }

    adsorption(building: Node) {
        let coord: Coordinate = BuildMapManager.getCoord(building.position.x, building.position.y + BuildGameConfig.size / 2);
        let pos: Vec3 = building.position;
        if (pos.x > BuildMapManager.getPos(GameManager.inst.playerState.mapCol - 1, GameManager.inst.playerState.mapRow - 1).x) {
            coord = BuildMapManager.getCoord(BuildMapManager.getPos(GameManager.inst.playerState.mapCol - 1, GameManager.inst.playerState.mapRow - 1).x, building.position.y + BuildGameConfig.size / 2);
        }
        if (pos.y > BuildMapManager.getPos(GameManager.inst.playerState.mapCol - 1, GameManager.inst.playerState.mapRow - 1).y) {
            coord = BuildMapManager.getCoord(building.position.x, BuildMapManager.getPos(GameManager.inst.playerState.mapCol - 1, GameManager.inst.playerState.mapRow - 1).y + BuildGameConfig.size / 2);
        }
        if (pos.x < BuildMapManager.getPos(0, 0).x) {
            coord = BuildMapManager.getCoord(BuildMapManager.getPos(0, 0).x, building.position.y + BuildGameConfig.size / 2);
        }
        if (pos.y < BuildMapManager.getPos(0, 0).y) {
            coord = BuildMapManager.getCoord(building.position.x, BuildMapManager.getPos(0, 0).y + BuildGameConfig.size / 2);
        }
        building.setPosition(BuildMapManager.getPos(coord).x, BuildMapManager.getPos(coord).y - BuildGameConfig.size / 2, 0);
    }

    moveEndCheck(data: Building, building: Node): boolean {
        let coord: Coordinate = BuildMapManager.getCoord(building.position.x, building.position.y + BuildGameConfig.size / 2);
        return this.buildCheckVoid(data, coord, this.node);
    }

    createBuilding(data: Building): Node {
        let building: Node = instantiate(BuilderComp.inst.building);

        Layout_MapGrid.inst.node.addChild(building);

        building.setWorldPosition(BuildGameConfig.canvasW * view.getScaleX() / 2, BuildGameConfig.canvasH * view.getScaleY() / 2, 0);

        building.getComponent(BuildingState).data = data;
        building.getComponent(Sprite).spriteFrame = data.anim.anim[0];
        if (data.autoTile !== 1) {
            building.getComponent(UITransform).width = data.anim.anim[0].originalSize.width * 4;
            building.getComponent(UITransform).height = data.anim.anim[0].originalSize.height * 4;
        }
        else {
            building.getComponent(UITransform).width = 64;
            building.getComponent(UITransform).height = 64;
        }

        let pos = building.position;
        let size = building.getComponent(UITransform).contentSize;
        let canvas = find('Canvas');
        building.setWorldPosition(canvas.getComponent(UITransform).contentSize.width / 2 - size.width / 2, canvas.getComponent(UITransform).contentSize.height / 2, pos.z);

        BuilderComp.inst.setSelect(building);

        return building;
    }

    tryBuild(building: Node, data: Building, isLoad: boolean, coord?: Coordinate): boolean {
        let pos: Coordinate = null;
        if (coord) {
            pos = coord;
        }
        else {
            pos = BuildMapManager.getCoord(building.position.x, building.position.y + BuildGameConfig.size / 2);
        }

        if (this.buildCheckVoid(data, pos, building)) {
            this.build(data, building, pos, isLoad);
            // log(pos);
            return true;
        }
        else {
            tgxUIAlert.show('格子已被占用或未完全在格内', false).onClick(isOK => {
                log(`Close`)
            });
            return false;
        }
    }

    buildCheckVoid(data: Building, coord: Coordinate, building: Node) {
        for (let i = 0; i < data.buildShape.length; i++) {
            for (let j = 0; j < data.buildShape[i].length; j++) {
                if (data.buildShape[i][j] !== 0) {
                    try {
                        if (!BuildMapManager.checkVoid(data.layer, coord.x + j, coord.y + i, building)) {
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

    build(data: Building, building: Node, coord: Coordinate, isLoad: boolean) {
        Layout_MapGrid.inst.node.getChildByName(data.layer.toString()).addChild(building);

        building.setPosition(BuildMapManager.getPos(coord).x, BuildMapManager.getPos(coord).y - BuildGameConfig.size / 2, 0);

        BuildMapManager.place(coord.copy(), data.layer, data.colShape, data.buildShape, building);

        this.changeMap(data, coord, true, isLoad);

        if (data.autoTile == 1) {
            this.drawAt(data, coord, data.layer, building)
        } else if (data.autoTile == 2) {
            building.getChildByName('Sprite').active = false;
            this.drawFence(data, coord, data.layer, building);
        } else {
            building.getChildByName('Sprite').active = false;
            building.getComponent(Sprite).spriteFrame = data.anim.anim[0];
        }

        building.getComponent(BuildingState).coord = coord.copy();
    }

    remove(node: Node, data: Building, coord: Coordinate) {
        this.changeMap(data, coord, false, false);

        BuildMapManager.RemoveBuildFromMap(node);
    }

    // 在row行，col列绘制一个自动地图元件
    drawAt(data: Building, coord: Coordinate, type: number, building: Node) {
        for (const iterator of directions) {
            const newX = coord.x + iterator.dx;
            const newY = coord.y + iterator.dy;
            // 判断row和col是否越界
            if (newX < GameManager.inst.playerState.mapRow && newX >= 0 && newY < GameManager.inst.playerState.mapCol && newY >= 0) {
                this.updateTileState(data, newY, newX, type, building);
            }
        }
    }
    drawTileIndex(data: Building, index: number, building: Node) {
        // 根据index得到对应的小元件表
        let widget: number[] = autoTileMap[index];
        // 根据小元件表拼接成地图元件
        for (let i = 0; i < 4; i++) {
            building.getChildByName('Sprite').children[i].getComponent(Sprite).spriteFrame = data.anim.anim[widget[i]];
        }
    }
    updateTileState(data: Building, row: number, col: number, type: number, building: Node) {

        // log(`data: ${BuildMapManager.dataMapDit[type][row][col]}, row: ${row}, col: ${col}, change: ${BuildMapManager.dataMapDit[type][col][row]}`)
        // 如果该位置没有地图元件，则直接返回
        if (!this.hasTileAt(data, row, col, type)) return;

        let state: number = 0b00000000;

        if (this.hasTileAt(data, row + 1, col, type)) {
            state |= 0b01000000;
        }
        if (this.hasTileAt(data, row - 1, col, type)) {
            state |= 0b00000010;
        }
        if (this.hasTileAt(data, row, col - 1, type)) {
            state |= 0b00010000;
        }
        if (this.hasTileAt(data, row, col + 1, type)) {
            state |= 0b00001000;
        }
        if (this.hasTileAt(data, row + 1, col - 1, type)) {
            if ((state | 0b01010000) == state) state |= 0b10000000;
        }
        if (this.hasTileAt(data, row + 1, col + 1, type)) {
            if ((state | 0b01001000) == state) state |= 0b00100000;
        }
        if (this.hasTileAt(data, row - 1, col - 1, type)) {
            if ((state | 0b00010010) == state) state |= 0b00000100;
        }
        if (this.hasTileAt(data, row - 1, col + 1, type)) {
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
        this.drawTileIndex(data, index, BuildMapManager.nodeMapDit[type][row][col]);
    }
    hasTileAt(data: Building, row: number, col: number, type: number) {
        if (col < GameManager.inst.playerState.mapRow && col >= 0 && row < GameManager.inst.playerState.mapCol && row >= 0) {
            return BuildMapManager.nodeMapDit[type][row][col] &&
                BuildMapManager.nodeMapDit[type][row][col].getComponent(BuildingState).data.autoTile === 1 &&
                BuildMapManager.nodeMapDit[type][row][col].getComponent(BuildingState).data.id === data.id;
        }
        else return false;

    }

    drawFence(data: Building, coord: Coordinate, type: number, building: Node) {
        // 遍历四个方向并获取对应节点
        for (let index = 0; index < directions_Four.length; index++) {
            const newX = coord.x + directions_Four[index].dx;
            const newY = coord.y + directions_Four[index].dy;

            if (newX < GameManager.inst.playerState.mapRow && newX >= 0 && newY < GameManager.inst.playerState.mapCol && newY >= 0) {
                let node = Coord(newX, newY).getNode(type);
                if (node) {
                    if (BuildMapManager.nodeMapDit[type][newY][newX].getComponent(BuildingState).data.autoTile === 2) {
                        this.updateFence(data, Coord(newX, newY), data.layer, node);
                    }
                }
            }
        }

        this.updateFence(data, coord, data.layer, building);

    }

    updateFence(data: Building, coord: Coordinate, type: number, building: Node) {
        let direction: { [key: number]: boolean } = {
            0: null,
            1: null,
            2: null,
            3: null,
        };

        // 遍历四个方向并获取对应节点
        for (let index = 0; index < directions_Four.length; index++) {
            const newX = coord.x + directions_Four[index].dx;
            const newY = coord.y + directions_Four[index].dy;

            if (newX < GameManager.inst.playerState.mapRow && newX >= 0 && newY < GameManager.inst.playerState.mapCol && newY >= 0) {
                if (Coord(newX, newY).getNode(type)) {
                    direction[index] = Coord(newX, newY).getNode(type).getComponent(BuildingState).data.autoTile === 2;
                }
                else {
                    direction[index] = false;
                }
            }
        }

        // 记录有节点的方向
        let up = direction[0];
        let down = direction[1];
        let left = direction[2];
        let right = direction[3];

        let index: number = fence['on_alone'];

        if (left && right) {
            // console.log('leftright');
            index = fence['on_HM'];
        } else if (up && down) {
            // console.log('updown');
            index = fence['on_VM'];
        } else if (up && left) {
            // console.log('upleft');
            index = fence['on_RD'];
        } else if (up && right) {
            // console.log('upright');
            index = fence['on_LD'];
        } else if (down && left) {
            // console.log('downleft');
            index = fence['on_RU'];
        } else if (down && right) {
            // console.log('downright');
            index = fence['on_LU'];
        } else if (up) {
            // console.log('u');
            index = fence['on_D'];
        } else if (down) {
            // console.log('d');
            index = fence['on_U'];
        } else if (left) {
            // console.log('l');
            index = fence['on_R'];
        } else if (right) {
            // console.log('r');
            index = fence['on_L'];
        } else {
            // console.log('没有节点');
            index = fence['on_alone'];
        }


        building.getComponent(Sprite).spriteFrame = data.anim.anim[index];
    }

    findLongestArrayLength(twoDimArray: any[][]): number {
        let maxLength = 0;

        for (const array of twoDimArray) {
            if (array.length > maxLength) {
                maxLength = array.length;
            }
        }

        return maxLength;
    }

    changeMap(data: Building, coord: Coordinate, isBuild: boolean, isLoad: boolean) {

        if (!isLoad) {

            if (GameManager.inst.playerState.building.findIndex(building => building.id === data.id && building.coord.compare(coord)) != -1 && isBuild) return;

            GameManager.inst.changeMap(data, coord, isBuild);

            BuildGameUtil.saveBuilding();
        }
        else {
            GameManager.inst.onProsperousChange(data.proserity);
        }
    }
}