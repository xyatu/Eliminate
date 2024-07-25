import { _decorator, Component, find, instantiate, Layout, log, Node, Sprite, tween, UITransform, v2, v3, Vec3, view } from "cc";

import { Coord, Coordinate } from "../../../scripts/DataStructure";
import BuildGameConfig from "../../script/data/BuildGameConfig";
import { tgxUIAlert, tgxUIEditAlert } from "../../../core_tgx/tgx";
import { BuildingState } from "../../script/building/BuildingState";
import { Building, DataGetter } from "../../../start/DataGetter";
import { Layout_MapGrid } from "../../ui/map/Layout_MapGrid";
import { GameManager, SaveBuilding } from "../../../start/GameManager";
import { BuilderComp } from "./BuilderComp";
import BuildMapManager from "./BuildMapManager";
import BuildingPool from "../../../scripts/BuildingPool";
import { CharacterManager } from "./CharacterManager";
import { Layout_Normal } from "../../ui/ui_normal/Layout_Normal";
import BuildGameUtil from "../BuildGameUtil";
import { measure } from "../../../scripts/UIDef";
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
    0b11111111: [26, 27, 32, 33],
    0b01111111: [4, 27, 32, 33],
    0b11011111: [26, 5, 32, 33],
    0b01011111: [4, 5, 32, 33],
    0b11111110: [26, 27, 32, 11],
    0b01111110: [4, 27, 32, 11],
    0b11011110: [26, 5, 32, 11],
    0b01011110: [4, 5, 32, 11],
    0b11111011: [26, 27, 10, 33],
    0b01111011: [4, 27, 10, 33],
    0b11011011: [26, 5, 10, 33],
    0b01011011: [4, 5, 10, 33],
    0b11111010: [26, 27, 10, 11],
    0b01111010: [4, 27, 10, 11],
    0b11011010: [26, 5, 10, 11],
    0b01011010: [4, 5, 10, 11],
    0b01101011: [24, 25, 30, 31],
    0b01001011: [24, 5, 30, 31],
    0b01101010: [24, 25, 30, 11],
    0b01001010: [24, 5, 30, 11],
    0b00011111: [14, 15, 20, 21],
    0b00011110: [14, 15, 20, 11],
    0b00011011: [14, 15, 10, 21],
    0b00011010: [14, 15, 10, 11],
    0b11010110: [28, 29, 34, 35],
    0b11010010: [28, 29, 10, 35],
    0b01010110: [4, 29, 34, 35],
    0b01010010: [4, 29, 10, 35],
    0b11111000: [26, 27, 44, 45],
    0b01111000: [4, 39, 44, 45],
    0b11011000: [38, 5, 44, 45],
    0b01011000: [4, 5, 44, 45],
    0b01000010: [24, 29, 30, 35],
    0b00011000: [14, 15, 44, 45],
    0b00001011: [12, 13, 18, 19],
    0b00001010: [12, 13, 18, 11],
    0b00010110: [16, 17, 22, 23],
    0b00010010: [16, 17, 10, 23],
    0b11010000: [40, 41, 46, 47],
    0b01010000: [4, 41, 46, 47],
    0b01101000: [36, 37, 42, 43],
    0b01001000: [36, 5, 42, 43],
    0b00000010: [12, 17, 18, 23],
    0b00001000: [12, 13, 42, 43],
    0b01000000: [36, 41, 42, 47],
    0b00010000: [16, 17, 46, 47],
    0b00000000: [0, 1, 6, 7],
};

const visited = new Set<string>();

@ccclass('Builder')
export class Builder extends Component {

    public static inst: Builder;

    static isBuilding: boolean = false;

    isLoaded: boolean = false;

    canvas: UITransform = null;

    isLoadedBuilding: Map<Coordinate, number> = new Map();

    getCanvas(): UITransform {
        if (!this.canvas) {
            this.canvas = find('Canvas').getComponent(UITransform);
        }
        return this.canvas;
    }

    protected onLoad(): void {
        Builder.inst = this;
    }

    protected start(): void {
    }

    loadMap() {
        // console.time('loadMap');
        let buildings: SaveBuilding[] = GameManager.inst.playerState.building;

        // 初始加载当前视角内的建筑物
        this.loadVisibleBuildings(buildings);

        // 异步加载其余建筑物
        this.LoadRemainingBuildings(buildings);
    }

    loadVisibleBuildings(buildings: SaveBuilding[]) {
        // 假设有一个方法能计算出当前视角内的建筑物
        let visibleBuildings: SaveBuilding[] = this.getVisibleBuildings(buildings);

        visibleBuildings.forEach(building => {
            let data: Building = DataGetter.inst.buildingdata.get(building.id);
            let node: Node = this.createBuilding(data, true);
            let bs: BuildingState = node.getComponent(BuildingState);
            this.tryBuild(node, data, true, bs, building.coord);
            bs.unSelect();
            this.isLoadedBuilding.set(building.coord, building.id);
        });

        BuildGameUtil.saveBuilding(); // 全部加载完毕后保存
        Builder.inst.isLoaded = true;
        Layout_Normal.inst.node.active = true;
    }

    getVisibleBuildings(buildings: SaveBuilding[]): SaveBuilding[] {
        let psCoord = GameManager.inst.playerState.playerCoord;
        let minCoord = Coord(psCoord.x - 8, psCoord.y - 10);
        let maxCoord = Coord(psCoord.x + 4, psCoord.y + 10);
        return buildings.filter(building => {
            return (building.coord.x >= minCoord.x && building.coord.x <= maxCoord.x &&
                building.coord.y >= minCoord.y && building.coord.y <= maxCoord.y);
        })
    }

    async LoadRemainingBuildings(buildings: SaveBuilding[]) {
        // 异步加载其他建筑物
        setTimeout(() => {
            let remainingBuildings = buildings.filter(building => !this.isBuildingLoaded(building));

            remainingBuildings.forEach(building => {
                let data: Building = DataGetter.inst.buildingdata.get(building.id);
                let node: Node = this.createBuilding(data, true);
                let bs: BuildingState = node.getComponent(BuildingState);
                this.tryBuild(node, data, true, bs, building.coord);
                bs.unSelect();
                this.isLoadedBuilding.set(building.coord, building.id);
            });
        }, 0);
    }

    isBuildingLoaded(building: SaveBuilding): boolean {
        return this.isLoadedBuilding.has(building.coord);
    }

    adsorption(building: Node) {
        let coord: Coordinate = BuildMapManager.getCoord(building.position.x, building.position.y + BuildGameConfig.size / 2);
        if (!coord) coord = new Coordinate();
        let pos: Vec3 = building.position;
        if (pos.x > BuildMapManager.getPos(GameManager.inst.playerState.mapCol - 1, GameManager.inst.playerState.mapRow - 1).x &&
            pos.y > BuildMapManager.getPos(GameManager.inst.playerState.mapCol - 1, GameManager.inst.playerState.mapRow - 1).y) {
            coord = BuildMapManager.getCoord(
                BuildMapManager.getPos(GameManager.inst.playerState.mapCol - 1, GameManager.inst.playerState.mapRow - 1).x,
                BuildMapManager.getPos(GameManager.inst.playerState.mapCol - 1, GameManager.inst.playerState.mapRow - 1).y + BuildGameConfig.size / 2);
        }
        else {
            if (pos.x > BuildMapManager.getPos(GameManager.inst.playerState.mapCol - 1, GameManager.inst.playerState.mapRow - 1).x) {
                coord = BuildMapManager.getCoord(BuildMapManager.getPos(GameManager.inst.playerState.mapCol - 1, GameManager.inst.playerState.mapRow - 1).x, building.position.y + BuildGameConfig.size / 2);
            }
            if (pos.y > BuildMapManager.getPos(GameManager.inst.playerState.mapCol - 1, GameManager.inst.playerState.mapRow - 1).y) {
                coord = BuildMapManager.getCoord(building.position.x, BuildMapManager.getPos(GameManager.inst.playerState.mapCol - 1, GameManager.inst.playerState.mapRow - 1).y + BuildGameConfig.size / 2);
            }
        }
        if (pos.x < BuildMapManager.getPos(0, 0).x &&
            pos.y < BuildMapManager.getPos(0, 0).y) {
            coord = BuildMapManager.getCoord(
                BuildMapManager.getPos(0, 0).x,
                BuildMapManager.getPos(0, 0).y + BuildGameConfig.size / 2);
        }
        else {
            if (pos.x < BuildMapManager.getPos(0, 0).x) {
                coord = BuildMapManager.getCoord(BuildMapManager.getPos(0, 0).x, building.position.y + BuildGameConfig.size / 2);
            }
            if (pos.y < BuildMapManager.getPos(0, 0).y) {
                coord = BuildMapManager.getCoord(building.position.x, BuildMapManager.getPos(0, 0).y + BuildGameConfig.size / 2);
            }
        }
        building.setPosition(BuildMapManager.getPos(coord).x, BuildMapManager.getPos(coord).y - BuildGameConfig.size / 2, 0);
    }

    moveEndCheck(data: Building, building: Node): boolean {
        let coord: Coordinate = BuildMapManager.getCoord(building.position.x, building.position.y + BuildGameConfig.size / 2);
        return this.buildCheckVoid(data, coord, this.node);
    }

    createBuilding(data: Building, isLoad: boolean): Node {
        let building: Node = BuildingPool.get() || instantiate(BuilderComp.inst.building);

        Layout_MapGrid.inst.node.addChild(building);
        building.setWorldPosition(BuildGameConfig.canvasW * view.getScaleX() / 2, BuildGameConfig.canvasH * view.getScaleY() / 2, 0);

        let bs: BuildingState = building.getComponent(BuildingState);
        bs.data = data;
        if (data.autoTile === 1) {
            bs.autoTile0.spriteFrame = data.anim.anim[0];
            bs.autoTile1.spriteFrame = data.anim.anim[1];
            bs.autoTile2.spriteFrame = data.anim.anim[6];
            bs.autoTile3.spriteFrame = data.anim.anim[7];
        } else {
            bs.buildingSprite.spriteFrame = data.anim.anim[0];
        }

        if (data.autoTile !== 1) {
            bs.uiTransform.width = data.anim.anim[0].originalSize.width * 4;
            bs.uiTransform.height = data.anim.anim[0].originalSize.height * 4;
        } else {
            bs.uiTransform.width = 64;
            bs.uiTransform.height = 64;
        }

        building.setWorldPosition(this.getCanvas().contentSize.width / 2 - bs.uiTransform.contentSize.width / 2, this.getCanvas().contentSize.height / 2, building.position.z);
        if (!isLoad) {
            building.getComponent(BuildingState).select();
        }

        return building;
    }

    tryBuild(building: Node, data: Building, isLoad: boolean, bs: BuildingState, coord?: Coordinate): boolean {
        let oldCoord: Coordinate = bs.coord ? bs.coord.copy() : null;
        let pos: Coordinate = coord || BuildMapManager.getCoord(building.position.x, building.position.y + BuildGameConfig.size / 2);

        if (this.buildCheckVoid(data, pos, building)) {
            this.build(data, building, pos, isLoad, oldCoord);
            return true;
        } else {
            tgxUIAlert.show('格子已被占用或未完全在格内', false).onClick(isOK => { });
            return false;
        }
    }

    buildCheckVoid(data: Building, coord: Coordinate, building: Node): boolean {
        const buildShape = data.buildShape;
        const layer = data.layer;
        const coordX = coord.x;
        const coordY = coord.y;

        for (let i = 0; i < buildShape.length; i++) {
            const row = buildShape[i];
            for (let j = 0; j < row.length; j++) {
                if (row[j] !== 0) {
                    const x = coordX + j;
                    const y = coordY + i;

                    // 提前检查边界条件或其他可能导致错误的情况
                    if (x < 0 || y < 0 || x >= GameManager.inst.playerState.mapCol || y >= GameManager.inst.playerState.mapRow) {
                        return false;
                    }

                    if (!BuildMapManager.checkVoid(layer, x, y, building)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }


    build(data: Building, building: Node, coord: Coordinate, isLoad: boolean, oldCoord: Coordinate) {
        Layout_MapGrid.inst.node.getChildByName(data.layer.toString()).addChild(building);

        building.setPosition(BuildMapManager.getPos(coord).x, BuildMapManager.getPos(coord).y - BuildGameConfig.size / 2, 0);

        BuildMapManager.place(coord.copy(), oldCoord, data.layer, data.colShape, data.buildShape, building);

        this.changeMap(data, coord, true, isLoad, oldCoord);

        if (data.autoTile == 1) {
            if (oldCoord) this.drawAt(data, oldCoord, data.layer, building)
            this.drawAt(data, coord, data.layer, building)

            building.getComponent(Sprite).spriteFrame = null;
        } else if (data.autoTile == 2) {
            building.getChildByName('Sprite').active = false;
            this.drawFence(data, coord, data.layer, building);
        } else {
            building.getChildByName('Sprite').active = false;
            building.getComponent(Sprite).spriteFrame = data.anim.anim[0];
        }

        building.getComponent(BuildingState).coord = coord.copy();
    }

    remove(node: Node, data: Building, coord: Coordinate, building: Node) {

        if (data.autoTile === 1) {
            this.drawAt(data, coord, data.layer, node);
        }
        this.changeMap(data, coord, false, false);

        BuildMapManager.RemoveBuildFromMap(node);
    }

    // 在row行，col列绘制一个自动地图元件
    drawAt(data: Building, coord: Coordinate, type: number, building: Node) {
        const mapRow = GameManager.inst.playerState.mapRow;
        const mapCol = GameManager.inst.playerState.mapCol;

        directions.forEach(direction => {
            const newX = coord.x + direction.dx;
            const newY = coord.y + direction.dy;
            if (newX >= 0 && newX < mapRow && newY >= 0 && newY < mapCol) {
                this.updateTileState(data, newY, newX, type, building);
            }
        });
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
        if (!this.hasTileAt(data, row, col, type)) return;

        const mapDit = BuildMapManager.nodeMapDit[type];
        let state = 0b00000000;

        state |= this.hasTileAt(data, row + 1, col, type) ? 0b01000000 : 0;
        state |= this.hasTileAt(data, row - 1, col, type) ? 0b00000010 : 0;
        state |= this.hasTileAt(data, row, col - 1, type) ? 0b00010000 : 0;
        state |= this.hasTileAt(data, row, col + 1, type) ? 0b00001000 : 0;

        if (this.hasTileAt(data, row + 1, col - 1, type) && (state & 0b01010000) === 0b01010000) state |= 0b10000000;
        if (this.hasTileAt(data, row + 1, col + 1, type) && (state & 0b01001000) === 0b01001000) state |= 0b00100000;
        if (this.hasTileAt(data, row - 1, col - 1, type) && (state & 0b00010010) === 0b00010010) state |= 0b00000100;
        if (this.hasTileAt(data, row - 1, col + 1, type) && (state & 0b00001010) === 0b00001010) state |= 0b00000001;

        this.drawTileIndex(data, state, mapDit[row][col]);
    }

    hasTileAt(data: Building, row: number, col: number, type: number): boolean {
        if (row >= 0 && row < GameManager.inst.playerState.mapRow && col >= 0 && col < GameManager.inst.playerState.mapCol) {
            const tile = BuildMapManager.nodeMapDit[type][row][col];
            return tile && tile.getComponent(BuildingState).data.autoTile === 1 && tile.getComponent(BuildingState).data.id === data.id;
        }
        return false;
    }

    drawFence(data: Building, coord: Coordinate, type: number, building: Node) {
        // 遍历四个方向并获取对应节点
        for (let index = 0; index < directions_Four.length; index++) {
            const newX = coord.x + directions_Four[index].dx;
            const newY = coord.y + directions_Four[index].dy;

            if (newX < GameManager.inst.playerState.mapRow && newX >= 0 && newY < GameManager.inst.playerState.mapCol && newY >= 0) {
                let node = BuildMapManager.getNode(type, Coord(newX, newY));
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
                if (BuildMapManager.getNode(type, Coord(newX, newY))) {
                    direction[index] = BuildMapManager.getNode(type, Coord(newX, newY)).getComponent(BuildingState).data.autoTile === 2;
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

    changeMap(data: Building, coord: Coordinate, isBuild: boolean, isLoad: boolean, oldCoord?: Coordinate) {

        if (!isLoad) {

            if (GameManager.inst.playerState.building.findIndex(building => building.id === data.id && building.coord.compare(coord)) != -1 && isBuild) return;

            if (oldCoord) {
                let old = GameManager.inst.playerState.building.findIndex(building => building.id === data.id && building.coord.compare(oldCoord));
                if (old != -1) GameManager.inst.playerState.building.splice(old, 1);
            }
            GameManager.inst.changeMap(data, coord, isBuild);

            BuildGameUtil.saveBuilding();
        }
        else {
            GameManager.inst.onProsperousChange(data.proserity);
        }
    }
}