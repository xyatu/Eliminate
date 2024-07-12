import { _decorator, instantiate, Layout, log, Node, v2, v3, Vec2, Vec3 } from 'cc';
import { Coord, Coordinate } from '../../../module_eliminate/scripts/game/type/DataStructure';
import BuildGameConfig from '../data/BuildGameConfig';
import BuildGameUtil from '../BuildGameUtil';
import { Layout_MapGrid } from '../../ui/map/Layout_MapGrid';
import { Layout_BuildFrame } from '../../ui/ui_buildFrame/Layout_BuildFrame';

export default class BuildMapManager {

    public static dataMapDit: { [key: number]: number[][] } = {};

    public static nodeMapDit: { [key: number]: Node[][] } = {};

    public static dataBuilding: Building[] = [];

    private static _posMap: Vec2[][] = null;

    private static width: number = null;

    private static height: number = null;

    private static beginX: number = null;

    private static beginY: number = null;

    public static selectNode: Building = null;

    public static getPos(x: number | Coordinate, y?: number): Vec2 {
        if (typeof x === 'number') return this._posMap[x][y];
        else return this._posMap[x.x][x.y];
    }

    public static getCoord(x: number | Vec2, y?: number): Coordinate {
        let pos: Vec2 = typeof x === 'number' ? v2(x, y) : x;
        for (let index = 0; index < BuildGameConfig.col; index++) {
            for (let j = 0; j < BuildGameConfig.row; j++) {
                if (BuildGameUtil.pointIsInsideTargetArea(pos, this._posMap[index][j])) {
                    return Coord(index, j);
                }
            }
        }
        return;
    }

    public static getPosArr(): Vec2[][] {
        return this._posMap;
    }

    public static checkVoid(type: number, x: number, y: number): boolean {
        return this.dataMapDit[type][y][x] === 0 && this.nodeMapDit[type][y][x] === null;
    }

    public static place(coord: Coordinate, type: number, dataArr: number[][], node: Node) {

        let building = new Building(node, type, node.getPosition());

        for (let c = 0; c < dataArr.length; c++) {
            for (let r = 0; r < dataArr[c].length; r++) {
                if (dataArr[c][r] !== 0) {
                    this.dataMapDit[type][coord.y + c][coord.x + r] = dataArr[c][r];
                    this.nodeMapDit[type][coord.y + c][coord.x + r] = node;
                    building.setCoord(Coord(coord.x + r, coord.y + c), dataArr[c][r]);
                }
            }
        }

        this.dataBuilding.push(building);
    }

    public static RemoveBuildFromMap(building: Node) {
        let mapBuilding = this.dataBuilding.find(databuilding => databuilding.node === building);

        if (mapBuilding) {
            // 更新地图数据
            for (let i = 0; i < mapBuilding.coordArr.length; i++) {
                let coord = mapBuilding.coordArr[i];
                this.dataMapDit[mapBuilding.type][coord.y][coord.x] = 0;
                this.nodeMapDit[mapBuilding.type][coord.y][coord.x] = null;
            }

            // 找到并移除该建筑物
            const index = this.dataBuilding.indexOf(mapBuilding);
            if (index !== -1) {
                this.dataBuilding.splice(index, 1);
            }
        }

        // 检查节点是否有效并销毁
        if (building.isValid) {
            building.destroy();
        }
    }


    public static ClearAll() {
        this.dataBuilding.forEach(data => {
            for (let i = 0; i < data.coordArr.length; i++) {
                let coord = data.coordArr[i];
                this.dataMapDit[data.type][coord.y][coord.x] = 0;
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
        Layout_BuildFrame.inst.onSelectBuilding(this.selectNode != null);
        if (selectNode) {
            for (let i = 0; i < this.selectNode.coordArr.length; i++) {
                this.dataMapDit[this.selectNode.type][this.selectNode.coordArr[i].y][this.selectNode.coordArr[i].x] = this.selectNode.coordDataArr[i];
                this.nodeMapDit[this.selectNode.type][this.selectNode.coordArr[i].y][this.selectNode.coordArr[i].x] = this.selectNode.node;
            }
        }
    }

    public static hideBuilding(targetNode: Node) {
        this.selectNode = this.dataBuilding.find(databuilding => databuilding.node == targetNode).copy();
        targetNode.getChildByName('Sprite').active = false;
        let mapBuilding = this.dataBuilding.find(databuilding => databuilding.node == targetNode);
        mapBuilding.coordArr.forEach(coord => {
            this.dataMapDit[mapBuilding.type][coord.y][coord.x] = 0;
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
    public static init() {
        this.generatePosMap();
        this.generateDataMapDit();
        this.generateNodeMapDit();
    }

    /**
     * 生成位置表
     */
    private static generatePosMap() {
        this._posMap = [];
        // 计算宽高
        this.width = (BuildGameConfig.padding * 2) + (BuildGameConfig.size * BuildGameConfig.col) + (BuildGameConfig.spacing * (BuildGameConfig.col - 1));
        this.height = (BuildGameConfig.padding * 2) + (BuildGameConfig.size * BuildGameConfig.row) + (BuildGameConfig.spacing * (BuildGameConfig.row - 1));
        // 以左下角为原点，计算第一个方块的位置
        this.beginX = -(this.width / 2) + BuildGameConfig.padding + (BuildGameConfig.size / 2);
        this.beginY = -(this.height / 2) + BuildGameConfig.padding + (BuildGameConfig.size / 2);
        // 计算所有方块的位置
        // 从左到右计算每一列方块的位置
        for (let c = 0; c < BuildGameConfig.col; c++) {
            let colSet = [];
            let x = this.beginX + c * (BuildGameConfig.size + BuildGameConfig.spacing);
            // 从下到上计算该列的每一个方块的位置
            for (let r = 0; r < BuildGameConfig.row; r++) {
                let y = this.beginY + r * (BuildGameConfig.size + BuildGameConfig.spacing);
                colSet.push(v2(x, y));
            }
            this._posMap.push(colSet);
        }
    }

    private static generateDataMapDit() {
        for (let layer = 0; layer < BuildGameConfig.layers; layer++) {
            let dataMap: number[][] = [];
            for (let i = 0; i < BuildGameConfig.row; i++) {
                dataMap.push([]);
                for (let j = 0; j < BuildGameConfig.col; j++) {
                    dataMap[i].push(0);
                }
            }
            this.dataMapDit[layer + 1] = dataMap;
        }
    }

    private static generateNodeMapDit() {
        for (let layer = 0; layer < BuildGameConfig.layers; layer++) {
            let dataMap: Node[][] = [];
            for (let i = 0; i < BuildGameConfig.row; i++) {
                dataMap.push([]);
                for (let j = 0; j < BuildGameConfig.col; j++) {
                    dataMap[i].push(null);
                }
            }
            this.nodeMapDit[layer + 1] = dataMap;
        }
    }
}

class Building {
    node: Node = null;
    type: number = 0;
    position: Vec3 = new Vec3();
    coordArr: Coordinate[] = [];
    coordDataArr: number[] = [];

    constructor(node: Node, type: number, position: Vec3) {
        this.node = node;
        this.type = type;
        this.position = position
    }

    setCoord(coord: Coordinate, data: number) {
        this.coordArr.push(coord);
        this.coordDataArr.push(data);
    }

    copy(): Building {
        let result: Building = new Building(instantiate(this.node), this.type, new Vec3(this.position));
        result.coordArr = [...this.coordArr];
        result.coordDataArr = [...this.coordDataArr];
        return result;
    }
}