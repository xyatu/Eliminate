import { _decorator, instantiate, Layout, log, Node, Sprite, v2, v3, Vec2, Vec3 } from 'cc';
import BuildGameConfig from '../data/BuildGameConfig';
import BuildGameUtil from '../BuildGameUtil';
import { Layout_MapGrid } from '../../ui/map/Layout_MapGrid';
import { Layout_BuildFrame } from '../../ui/ui_buildFrame/Layout_BuildFrame';
import { GameManager } from '../../../start/GameManager';
import { Coordinate } from '../../../scripts/DataStructure';
import BuildingPool from '../../../scripts/BuildingPool';

export default class BuildMapManager {

    public static buildMapDit: { [key: number]: number[][] } = {};

    public static collisionMapDit: { [key: number]: number[][] } = {};

    public static nodeMapDit: { [key: number]: Node[][] } = {};

    public static dataBuilding: Building[] = [];

    private static _posMap: Vec2[][] = null;

    private static width: number = null;

    private static height: number = null;

    private static beginX: number = null;

    private static beginY: number = null;

    public static selectNode: Building = null;

    public static getPos(x: number | Coordinate, y?: number): Vec2 {
        try {
            if (typeof x === 'number') return this._posMap[x][y];
            else return this._posMap[x.x][x.y];
        } catch (error) {

        }
    }

    public static getCoord(x: number | Vec2, y?: number): Coordinate {
        let pos: Vec2 = typeof x === 'number' ? v2(x, y) : x;
        for (let index = 0; index < GameManager.inst.playerState.mapCol; index++) {
            for (let j = 0; j < GameManager.inst.playerState.mapRow; j++) {
                if (BuildGameUtil.pointIsInsideTargetArea(pos, this._posMap[index][j])) {
                    return new Coordinate(index, j);
                }
            }
        }
        return;
    }

    public static getPosArr(): Vec2[][] {
        return this._posMap;
    }

    public static getNode(type: number, coord: Coordinate): Node {
        return this.nodeMapDit[type][coord.y][coord.x];
    }

    public static checkVoid(type: number, x: number, y: number, building: Node): boolean {
        return (this.buildMapDit[type][y][x] === 0 && this.nodeMapDit[type][y][x] === null) || this.nodeMapDit[type][y][x] === building;
    }

    public static place(coord: Coordinate, oldCoord: Coordinate, type: number, colShape: number[][], buildShape: number[][], node: Node) {

        if (oldCoord) {
            for (let c = 0; c < buildShape.length; c++) {
                for (let r = 0; r < buildShape[c].length; r++) {
                    if (buildShape[c][r] !== 0) {
                        this.buildMapDit[type][oldCoord.y + c][oldCoord.x + r] = 0;
                        this.nodeMapDit[type][oldCoord.y + c][oldCoord.x + r] = null;
                        this.collisionMapDit[type][oldCoord.y + c][oldCoord.x + r] = 0;
                    }
                }
            }
            let index = BuildMapManager.dataBuilding.findIndex(data => data.node === node);
            BuildMapManager.dataBuilding.splice(index, 1);
        }

        let building = new Building(node, type, node.getPosition());

        for (let c = 0; c < buildShape.length; c++) {
            for (let r = 0; r < buildShape[c].length; r++) {
                if (buildShape[c][r] !== 0) {
                    this.buildMapDit[type][coord.y + c][coord.x + r] = buildShape[c][r];
                    this.nodeMapDit[type][coord.y + c][coord.x + r] = node;
                    this.collisionMapDit[type][coord.y + c][coord.x + r] = colShape[c][r];
                    building.setCoord(new Coordinate(coord.x + r, coord.y + c), buildShape[c][r], colShape[c][r]);
                }
            }
        }

        // log(this.buildMapDit);
        // log(this.collisionMapDit);
        // log(this.nodeMapDit);

        this.dataBuilding.push(building);
    }

    public static RemoveBuildFromMap(building: Node) {
        let mapBuilding = this.dataBuilding.find(databuilding => databuilding.node === building);

        if (mapBuilding) {
            // 更新地图数据
            for (let i = 0; i < mapBuilding.coordArr.length; i++) {
                let coord = mapBuilding.coordArr[i];
                this.buildMapDit[mapBuilding.type][coord.y][coord.x] = 0;
                this.collisionMapDit[mapBuilding.type][coord.y][coord.x] = 0;
                this.nodeMapDit[mapBuilding.type][coord.y][coord.x] = null;
            }

            // 找到并移除该建筑物
            const index = this.dataBuilding.indexOf(mapBuilding);
            if (index !== -1) {
                this.dataBuilding.splice(index, 1);
            }
        }


        BuildingPool.put(building);
    }


    public static ClearAll() {
        this.dataBuilding.forEach(data => {
            for (let i = 0; i < data.coordArr.length; i++) {
                let coord = data.coordArr[i];
                this.buildMapDit[data.type][coord.y][coord.x] = 0;
                this.collisionMapDit[data.type][coord.y][coord.x] = 0;
                this.nodeMapDit[data.type][coord.y][coord.x] = null;
            }
            try {
                if (data.node.isValid) {
                    data.node.destroy();
                }
            } catch (error) {
            }
        });

        // 过滤掉所有 node 为空的 dataBuilding 元素，并重新赋值给 this.dataBuilding
        this.dataBuilding = this.dataBuilding.filter(databuilding => databuilding.node != null);
        this.ClearSelectNode();
    }

    public static RemoveSelectNode() {
        this.RemoveBuildFromMap(this.selectNode.node);
        this.ClearSelectNode();
    }

    public static ClearSelectNode() {
        if (this.selectNode) this.selectNode.node.getChildByName('bg').active = false;
        this.SetSelectNode(null);
    }

    public static SetSelectNode(selectNode: Node) {
        if (selectNode) { this.selectNode = this.dataBuilding.find(databuilding => databuilding.node == selectNode); }
        else this.selectNode = null;
        if (selectNode) {
            for (let i = 0; i < this.selectNode.coordArr.length; i++) {
                this.buildMapDit[this.selectNode.type][this.selectNode.coordArr[i].y][this.selectNode.coordArr[i].x] = this.selectNode.coordDataArr[i];
                this.collisionMapDit[this.selectNode.type][this.selectNode.coordArr[i].y][this.selectNode.coordArr[i].x] = this.selectNode.coordColArr[i];
                this.nodeMapDit[this.selectNode.type][this.selectNode.coordArr[i].y][this.selectNode.coordArr[i].x] = this.selectNode.node;
            }
        }
    }

    public static hideBuilding(targetNode: Node) {
        this.selectNode = this.dataBuilding.find(databuilding => databuilding.node == targetNode).copy();
        targetNode.getChildByName('Sprite').active = false;
        targetNode.getComponent(Sprite).enabled = false;
        let mapBuilding = this.dataBuilding.find(databuilding => databuilding.node == targetNode);
        mapBuilding.coordArr.forEach(coord => {
            this.buildMapDit[mapBuilding.type][coord.y][coord.x] = 0;
            this.collisionMapDit[mapBuilding.type][coord.y][coord.x] = 0;
            this.nodeMapDit[mapBuilding.type][coord.y][coord.x] = null;
        })
        mapBuilding = null;

        this.dataBuilding.filter(data => {
            return data != null;
        })

    }

    /**
     * 初始化
     */
    public static init(isReset?: boolean) {
        this.generatePosMap(isReset);
        this.generateDataMapDit();
        this.generateNodeMapDit();
        this.generateColMapDit();
        BuildGameUtil.saveMap();
    }

    /**
     * 生成位置表
     */
    private static generatePosMap(isReset?: boolean) {
        this._posMap = [];
        // 计算宽高
        this.width = (BuildGameConfig.padding * 2) + (BuildGameConfig.size * GameManager.inst.playerState.mapCol) + (BuildGameConfig.spacing * (GameManager.inst.playerState.mapCol - 1));
        this.height = (BuildGameConfig.padding * 2) + (BuildGameConfig.size * GameManager.inst.playerState.mapRow) + (BuildGameConfig.spacing * (GameManager.inst.playerState.mapRow - 1));
        // 以左下角为原点，计算第一个方块的位置
        if (!isReset) {
            this.beginX = -(this.width / 2) + BuildGameConfig.padding + (BuildGameConfig.size / 2) - BuildGameConfig.size / 2;
            this.beginY = -(this.height / 2) + BuildGameConfig.padding + (BuildGameConfig.size / 2);
        }
        // 计算所有方块的位置
        // 从左到右计算每一列方块的位置
        for (let c = 0; c < GameManager.inst.playerState.mapCol; c++) {
            let colSet = [];
            let x = this.beginX + c * (BuildGameConfig.size + BuildGameConfig.spacing);
            // 从下到上计算该列的每一个方块的位置
            for (let r = 0; r < GameManager.inst.playerState.mapRow; r++) {
                let y = this.beginY + r * (BuildGameConfig.size + BuildGameConfig.spacing);
                colSet.push(v2(x, y));
            }
            this._posMap.push(colSet);
        }
    }

    private static generateDataMapDit() {
        for (let layer = 0; layer < BuildGameConfig.layers; layer++) {
            let dataMap: number[][] = [];
            for (let i = 0; i < GameManager.inst.playerState.mapRow; i++) {
                dataMap.push([]);
                for (let j = 0; j < GameManager.inst.playerState.mapCol; j++) {
                    dataMap[i].push(0);
                }
            }
            this.buildMapDit[layer] = dataMap;
        }
    }

    private static generateNodeMapDit() {
        for (let layer = 0; layer < BuildGameConfig.layers; layer++) {
            let dataMap: Node[][] = [];
            for (let i = 0; i < GameManager.inst.playerState.mapRow; i++) {
                dataMap.push([]);
                for (let j = 0; j < GameManager.inst.playerState.mapCol; j++) {
                    dataMap[i].push(null);
                }
            }
            this.nodeMapDit[layer] = dataMap;
        }
    }

    private static generateColMapDit() {
        for (let layer = 0; layer < BuildGameConfig.layers; layer++) {
            let dataMap: number[][] = [];
            for (let i = 0; i < GameManager.inst.playerState.mapRow; i++) {
                dataMap.push([]);
                for (let j = 0; j < GameManager.inst.playerState.mapCol; j++) {
                    dataMap[i].push(null);
                }
            }
            this.collisionMapDit[layer] = dataMap;
        }
    }
}

class Building {
    node: Node = null;
    type: number = 0;
    position: Vec3 = new Vec3();
    coordArr: Coordinate[] = [];
    coordDataArr: number[] = [];
    coordColArr: number[] = [];

    constructor(node: Node, type: number, position: Vec3) {
        this.node = node;
        this.type = type;
        this.position = position
    }

    setCoord(coord: Coordinate, data: number, col: number) {
        this.coordArr.push(coord);
        this.coordDataArr.push(data);
        this.coordColArr.push(col);
    }

    copy(): Building {
        let result: Building = new Building(instantiate(this.node), this.type, new Vec3(this.position));
        result.coordArr = [...this.coordArr];
        result.coordDataArr = [...this.coordDataArr];
        result.coordColArr = [...this.coordColArr];
        return result;
    }
}