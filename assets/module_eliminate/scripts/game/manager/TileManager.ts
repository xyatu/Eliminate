import { _decorator, Component, Node, Vec2, v3, tween, v2, log, warn, error, random, math, instantiate, Prefab } from 'cc';
const { ccclass, property } = _decorator;

import Tile from "../component/Tile";
import { TileType, TileEvent, SlideDirection } from "../type/Enum";
import GameConfig from "../../data/GameConfig";
import GameUtil from "../util/GameUtil";
import PoolManager from "./PoolManager";
import MapManager from "./MapManager";
import { Coordinate, Combination, Coord } from "../type/DataStructure";
import { GameEvent } from "../../../eazax-ccc/core/GameEvent";
import ResManager from './ResManager';
import { UI_Eliminate } from '../../../ui_eliminate/UI_Eliminate';
import { EliminateState } from './EliminateState';
import { GameManager } from '../../../../start/GameManager';
import { DataGetter, Sound } from '../../../../start/DataGetter';
import { tgxAudioMgr } from '../../../../core_tgx/tgx';
import { SoundConfig } from '../../../../start/SoundConfig';

@ccclass('TileManager')
export default class TileManager extends Component {
    @property(Node)
    private container: Node | null = null; // 所有方块的容器

    @property(Node)
    private selectFrame: Node | null = null; // 选中框

    @property(Node)
    private mapContainer: Node | null = null; //所有底格的容器


    @property(Node)
    effBox: Node = null;
    @property(Prefab)
    matrixEff: Prefab = null;
    @property(Prefab)
    horiEff: Prefab = null;
    @property(Prefab)
    verEff: Prefab = null;

    private typeMap: TileType[][] = null; // 类型表：二维数组，保存所有方块的类型，方便计算

    private tileMap: Tile[][] = null; // 组件表：二维数组，保存所有方块 Tile 组件，方便读取

    private selectedCoord: Coordinate = null; // 当前已经选中的方块坐标

    private selectedCoordType: TileType = null; // 当前已经选中的方块类型

    private oldSelectedCoord: Coordinate = null; // 上一个已经选中的方块坐标

    private tileTouchStartPos: Vec2 | null = null; // 滑动开始位置

    private combinations: Combination[] = null; // 可消除组合

    private static instance: TileManager = null; // 实例

    // autoFallInterval: number = 0.1;
    autoFallInterval: number = GameConfig.autoFallInterval;

    timeTick: number = 0;

    public static getmapContainer() {
        return TileManager.instance.mapContainer;
    }

    protected onLoad() {
        TileManager.instance = this;
        this.bindTouchEvent();
        // 开始自动下落
        this.schedule(this.autoFall, this.autoFallInterval)
    }

    protected start(): void {
        EliminateState.inst.cbGameOverEvent.push(() => {
            this.unBindTouchEvent();
        });
    }

    protected onDestroy() {
        this.unBindTouchEvent();
    }

    protected bindTouchEvent() {
        GameEvent.on(TileEvent.TouchStart, this.onTileTouchStart, this);
        GameEvent.on(TileEvent.TouchEnd, this.onTileTouchEnd, this);
        GameEvent.on(TileEvent.TouchCancel, this.onTileTouchCancel, this);
        GameEvent.on(TileEvent.TouchMove, this.onTileTouchMove, this);
    }

    protected unBindTouchEvent() {
        warn(`TileManager Un Bind Touch Event`);
        GameEvent.off(TileEvent.TouchStart, this.onTileTouchStart, this);
        GameEvent.off(TileEvent.TouchEnd, this.onTileTouchEnd, this);
        GameEvent.off(TileEvent.TouchCancel, this.onTileTouchCancel, this);
        GameEvent.off(TileEvent.TouchMove, this.onTileTouchMove, this);
        this.tileTouchStartPos = null;
        this.setSelectedTile(null);
        this.unscheduleAllCallbacks();
    }

    /**
     * 方块的 touchstart 回调
     * @param coord 坐标
     * @param pos 点击位置
     */
    private onTileTouchStart(coord: Coordinate, pos: Vec2) {
        GameManager.inst.playClick();
        log('点击 | coord: ' + coord.toString() + ' | type: ' + this.getType(coord));
        // 是否已经选中了方块
        if (!this.selectedCoord) {
            this.tileTouchStartPos = pos;
            this.setSelectedTile(coord);
            this.selectedCoordType = this.getType(this.selectedCoord);
            this.setType(this.selectedCoord, TileType.Z)
            this.oldSelectedCoord = this.selectedCoord;
        }
    }

    // private checkTimeTick: number = 0;
    update(dt) {
        this.falldown();

        this.changeFallInterval(dt);
    }

    changeFallInterval(dt) {
        if (this.autoFallInterval > 0.1) {
            this.timeTick += dt;
            if (this.timeTick >= GameConfig.changeFallIntervalval) {
                this.timeTick -= GameConfig.changeFallIntervalval;
                this.autoFallInterval -= 0.02;
                if (this.autoFallInterval < 0.1) this.autoFallInterval = 0.1;
            }
        }
    }

    /**
     * 方块的 touchmove 回调
     * @param coord 坐标
     * @param pos 点击位置
     */
    private onTileTouchMove(coord: Coordinate, pos: Vec2) {
        // console.log('移动 | coord: ' + coord.toString() + ' | type: ' + this.getType(coord));
        // 是否已经选中了方块
        if (this.selectedCoord) {
            let targetCoord = GameUtil.getTileByPosition(pos);
            // log(`targetCoord ${targetCoord}`)
            if (targetCoord) {
                // log(this.selectedCoord.toString(), targetCoord.toString())
                if (this.selectedCoord.x != targetCoord.x || this.selectedCoord.y != targetCoord.y) {
                    this.exchangeTiles(this.selectedCoord, targetCoord).then(() => { })
                    this.tileTouchStartPos = pos;
                    this.setSelectedTile(targetCoord);
                }
            }
        }
    }

    /**
     * 方块的 touchend 回调
     */
    private onTileTouchEnd(coord: Coordinate, cancelPos: Vec2) {
        this.setType(this.selectedCoord, this.selectedCoordType)
        this.tryEliminate(this.selectedCoord);
        this.tileTouchStartPos = null;
        this.setSelectedTile(null);
    }

    /**
     * 方块的 touchcancel 回调
     * @param coord 坐标
     * @param cancelPos 位置
     */
    private onTileTouchCancel(coord: Coordinate, cancelPos: Vec2) {
        this.setType(this.selectedCoord, this.selectedCoordType)
        this.tryEliminate(this.selectedCoord);
        this.tileTouchStartPos = null;
        this.setSelectedTile(null);
    }

    private autoFall() {
        let c = Math.floor(math.randomRange(0, GameConfig.col));
        if (this.getType(new Coordinate(c, GameConfig.row - 1)) && this.getType(new Coordinate(c, GameConfig.row - 1)) != TileType.Z) {
            EliminateState.onGameOverEvent();
        }
        else {
            let type = GameUtil.getRandomType();
            let tile = this.getNewTile(c, GameConfig.row - 1, type);
            this.setTile(c, GameConfig.row - 1, tile)
            this.setType(c, GameConfig.row - 1, type);
        }
    }

    /**
     * 设置选中的方块
     * @param coord 坐标
     */
    private setSelectedTile(coord: Coordinate) {
        this.selectedCoord = coord;
        if (coord) {
            this.selectFrame.active = true;
            this.selectFrame.setPosition(v3(MapManager.getPos(coord).x, MapManager.getPos(coord).y, 0));
        } else {
            this.selectFrame.active = false;
        }
    }

    /**
     * 尝试点击交换方块
     * @param coord1 1
     * @param coord2 2
     */
    private tryExchangeByTouch(coord1: Coordinate, coord2: Coordinate) {
        log('尝试点击交换方块 | coord1: ' + coord1.toString() + ' | coord2: ' + coord2.toString());
        this.tryExchange(coord1, coord2);
    }

    /**
     * 尝试滑动交换方块
     * @param coord 坐标
     * @param direction 方向
     */
    private tryExchangeBySlid(coord: Coordinate, direction: SlideDirection) {
        log('点击交换方块 | coord1: ' + coord.toString() + ' | direction: ' + direction);
        let targetCoord = GameUtil.getCoordByDirection(coord, direction);
        if (targetCoord) {
            this.tryExchange(coord, targetCoord);
            this.setSelectedTile(null);
        }
    }

    /**
     * 尝试消除方块
     */
    private async tryEliminate(coord?: Coordinate) {
        if (coord) {
            if (this.eliminateTileVerOrHori(coord.copy())) GameUtil.changeScore(10500);
        }

        // 获取可消除组合
        this.combinations = GameUtil.getCombinations(this.typeMap);
        if (this.combinations.length > 0) {
            await new Promise(res => setTimeout(res, 250));
            this.eliminateCombinations(); // 消除
            await new Promise(res => setTimeout(res, 250));
            // await this.falldown(); // 下落
            await new Promise(res => setTimeout(res, 250));
            // await this.fillEmpty(); // 填充
            await new Promise(res => setTimeout(res, 250));
            this.keepCheckingUntilNoMoreCombiantion(); // 持续检测
        }
    }

    /**
     * 尝试交换方块
     * @param coord1 1
     * @param coord2 2
     */
    private async tryExchange(coord1: Coordinate, coord2: Coordinate) {
        // 交换方块
        await this.exchangeTiles(coord1, coord2);
        // 获取可消除组合
        this.combinations = GameUtil.getCombinations(this.typeMap);
        if (this.combinations.length > 0) {
            await new Promise(res => setTimeout(res, 250));
            this.eliminateCombinations(); // 消除
            await new Promise(res => setTimeout(res, 250));
            // await this.falldown(); // 下落
            await new Promise(res => setTimeout(res, 250));
            // await this.fillEmpty(); // 填充
            await new Promise(res => setTimeout(res, 250));
            this.keepCheckingUntilNoMoreCombiantion(); // 持续检测
        } else {
            // 不能消除，换回来吧
            await this.exchangeTiles(coord1, coord2);
        }
    }

    /**
     * 交换方块
     * @param coord1 1
     * @param coord2 2
     */

    private async exchangeTiles(coord1: Coordinate, coord2: Coordinate) {

        // 保存变量
        let tile1 = this.getTile(coord1);

        let tile2 = this.getTile(coord2);

        let tile1Type = this.getType(coord1);

        let tile2Type = this.getType(coord2);

        if (tile1 && tile1.tween) tile1.tween.stop();
        if (tile2 && tile2.tween) tile2.tween.stop();

        // 交换数据
        if (tile1) tile1.setCoord(coord2);

        if (tile2) tile2.setCoord(coord1);

        this.setType(coord1, tile2Type);

        this.setType(coord2, tile1Type);

        this.setTile(coord1, tile2);

        this.setTile(coord2, tile1);

        // 交换方块动画
        if (tile1) tween(tile1.node).to(0.1, { position: v3(MapManager.getPos(coord2).x, MapManager.getPos(coord2).y, 0) }).start();

        if (tile2) tween(tile2.node).to(0.1, { position: v3(MapManager.getPos(coord1).x, MapManager.getPos(coord1).y, 0) }).start();

        await new Promise(res => setTimeout(res, 100));
    }

    /**
     * 消除组合
     */
    private eliminateCombinations() {
        let sound: Sound = DataGetter.inst.sound.get(SoundConfig.eliminate_normal);
        tgxAudioMgr.inst.playOneShot(sound.audio, sound.volumn);
        for (let i = 0; i < this.combinations.length; i++) {
            GameUtil.changeScore((this.calcScore(this.combinations[i].coords.length)) * (2 + i));
            // GameUtil.changeScore((this.calcScore(this.combinations[i].coords.length)) * (1 + i * 0.2));
            for (let j = 0; j < this.combinations[i].coords.length; j++) {
                this.eliminateTile(this.combinations[i].coords[j]);
            }
        }
        this.combinations = [];
    }

    calcScore(n: number): number {
        return n <= 3 ? 800 : (n - 3) * (n - 3) * 300 + (n - 3) * 500 + 500;
    }

    /**
     * 检查可消除组合直到没有可以消除的组合
     */
    private async keepCheckingUntilNoMoreCombiantion() {

        this.combinations = GameUtil.getCombinations(this.typeMap); // 获取可消除的组合

        // 有可消除的组合吗
        while (this.combinations.length > 0) {
            this.eliminateCombinations(); // 消除
            await new Promise(res => setTimeout(res, 250));
            // await this.falldown(); // 下落
            await new Promise(res => setTimeout(res, 250));
            // await this.fillEmpty(); // 填充
            await new Promise(res => setTimeout(res, 250));
            this.combinations = GameUtil.getCombinations(this.typeMap); // 获取可消除的组合
            await new Promise(res => setTimeout(res, 250));
        }

        // 存在一步可消除情况吗
        if (!GameUtil.hasValidCombo(this.typeMap)) {
            this.removeAllTiles(); // 移除所有方块
            this.generateInitTypeMap(); // 生成可用 typeMap
            this.generateTiles(); // 生成方块
        }
    }

    /**
     * 移除所有方块
     */
    private removeAllTiles() {
        for (let i = 0; i < this.tileMap.length; i++) {
            for (let j = 0; j < this.tileMap[i].length; j++) {
                this.getTile(i, j).disappear();
                this.setType(i, j, null);
            }
        }
    }

    /**
     * 消除方块
     * @param coord 坐标
     */
    private eliminateTile(coord: Coordinate) {
        try {
            this.getTile(coord).disappear(); // 方块消失
            // 数据置空
            this.setTile(coord, null);
            this.setType(coord, null);

        } catch (error) {

        }
    }

    /**
     * 消除方块
     * @param coord 坐标
     */
    private eliminateTileVerOrHori(coord: Coordinate): boolean {
        switch (this.getType(coord)) {
            case TileType.Ver:
                {
                    let eff: Node = instantiate(this.verEff);
                    eff.parent = this.effBox;
                    eff.setPosition(MapManager.getPos(coord).x, MapManager.getPos(coord).y, 0)

                    let sound: Sound = DataGetter.inst.sound.get(SoundConfig.eliminate_Ver);
                    tgxAudioMgr.inst.playOneShot(sound.audio, sound.volumn);

                    for (let index = 0; index < GameConfig.row; index++) { // 修正列索引为行索引
                        if (this.getType(coord.x, index)) {
                            if (this.getType(coord.x, index) == TileType.Hori || this.getType(index, coord.y) == TileType.Matrix) {
                                this.eliminateTileVerOrHori(Coord(coord.x, index));
                            }
                            this.eliminateTile(Coord(coord.x, index));
                        }
                    }
                    return true;
                }
            case TileType.Hori:
                {
                    let eff: Node = instantiate(this.horiEff);
                    eff.parent = this.effBox;
                    eff.setPosition(MapManager.getPos(coord).x, MapManager.getPos(coord).y, 0)

                    let sound: Sound = DataGetter.inst.sound.get(SoundConfig.eliminate_Hori);
                    tgxAudioMgr.inst.playOneShot(sound.audio, sound.volumn);

                    for (let index = 0; index < GameConfig.col; index++) { // 保持列索引不变
                        if (this.getType(index, coord.y)) {
                            if (this.getType(index, coord.y) == TileType.Ver || this.getType(index, coord.y) == TileType.Matrix) {
                                this.eliminateTileVerOrHori(Coord(index, coord.y));
                            }
                            this.eliminateTile(Coord(index, coord.y));
                        }
                    }
                    return true;
                }
            case TileType.Matrix:
                {
                    let eff: Node = instantiate(this.matrixEff);
                    eff.parent = this.effBox;
                    eff.setPosition(MapManager.getPos(coord).x, MapManager.getPos(coord).y, 0)

                    let sound: Sound = DataGetter.inst.sound.get(SoundConfig.eliminate_Matrix);
                    tgxAudioMgr.inst.playOneShot(sound.audio, sound.volumn);
                    this.eliminateTile(Coord(coord.x, coord.y));
                    const directions = [
                        { dx: -1, dy: -1 }, // 左上
                        { dx: 0, dy: -1 },  // 上
                        { dx: 1, dy: -1 },  // 右上
                        { dx: -1, dy: 0 },  // 左
                        { dx: 1, dy: 0 },   // 右
                        { dx: -1, dy: 1 },  // 左下
                        { dx: 0, dy: 1 },   // 下
                        { dx: 1, dy: 1 }    // 右下
                    ];

                    for (const direction of directions) {
                        const newX = coord.x + direction.dx;
                        const newY = coord.y + direction.dy;

                        // 检查是否在边界内
                        if (newX >= 0 && newX < GameConfig.row && newY >= 0 && newY < GameConfig.col) {
                            if (this.getType(newX, newY) == TileType.Ver ||
                                this.getType(newX, newY) == TileType.Hori ||
                                this.getType(newX, newY) == TileType.Matrix) {
                                this.eliminateTileVerOrHori(Coord(newX, newY));
                            }
                            this.eliminateTile(Coord(newX, newY));
                        }
                    }
                    return true;
                }

            default: return false;
        }
    }


    private fallSelect() {
        for (let c = 0; c < GameConfig.col; c++) {
            for (let r = 0; r < GameConfig.row; r++) {
                // 找到空位
                if (!this.getType(c, r)) {
                    // 往上找方块
                    for (let nr = r + 1; nr < GameConfig.row; nr++) {
                        // 找到可以用的方块
                        if (this.getType(c, nr)) {
                            // 转移数据
                            this.setType(c, r, this.getType(c, nr));
                            this.setTile(c, r, this.getTile(c, nr));
                            this.getTile(c, r).setCoord(c, r);
                            // 置空
                            this.setTile(c, nr, null);
                            this.setType(c, nr, null);
                            // 下落
                            let fallPos = MapManager.getPos(c, r);
                            let fallTime = (nr - r) * 0.1;
                            tween(this.getTile(c, r).node)
                                .to(fallTime, { position: v3(fallPos.x, fallPos.y - 10, 0) })
                                .to(0.01, { position: v3(fallPos.x, fallPos.y, 0) })
                                .start();
                            break;
                        }
                    }
                }
            }
        }
    }

    private fallRow(c, r) {
        for (let r = 0; r < GameConfig.row; r++) {
            // 找到空位
            if (!this.getType(c, r)) {
                // 往上找方块
                for (let nr = r + 1; nr < GameConfig.row; nr++) {
                    // 找到可以用的方块
                    if (this.getType(c, nr)) {
                        // 转移数据
                        this.setType(c, r, this.getType(c, nr));
                        this.setTile(c, r, this.getTile(c, nr));
                        this.getTile(c, r).setCoord(c, r);
                        // 置空
                        this.setTile(c, nr, null);
                        this.setType(c, nr, null);
                        // 下落
                        let fallPos = MapManager.getPos(c, r);
                        let fallTime = (nr - r) * 0.1;
                        tween(this.getTile(c, r).node)
                            .to(fallTime, { position: v3(fallPos.x, fallPos.y - 10, 0) })
                            .to(0.05, { position: v3(fallPos.x, fallPos.y, 0) })
                            .start();
                        break;
                    }
                }
            }
        }
    }

    /**
     * 方块下落
     */
    private async falldown() {
        if (EliminateState.inst.isGameOver) return;
        let promises: Promise<Coordinate>[] = [];
        for (let c = 0; c < GameConfig.col; c++) {
            for (let r = 0; r < GameConfig.row; r++) {
                // 找到空位
                if (!this.getType(c, r)) {
                    // 往上找方块
                    for (let nr = r + 1; nr < GameConfig.row; nr++) {
                        if (this.selectedCoord && this.selectedCoord.x == c && this.selectedCoord.y == nr) {
                            nr++;
                            continue;
                        }
                        // 找到可以用的方块
                        if (this.getType(c, nr)) {

                            // 转移数据
                            this.setType(c, r, this.getType(c, nr));
                            this.setTile(c, r, this.getTile(c, nr));
                            this.getTile(c, r).setCoord(c, r);
                            // 置空
                            this.setTile(c, nr, null);
                            this.setType(c, nr, null);
                            // 下落
                            let fallPos = MapManager.getPos(c, r);
                            let fallTime = (nr - r) * 0.1;
                            promises.push(new Promise(res => {
                                this.getTile(c, r).tween = tween(this.getTile(c, r).node)
                                    .to(fallTime / 2, { position: v3(fallPos.x, fallPos.y - 10, 0) })
                                    .to(0.05, { position: v3(fallPos.x, fallPos.y, 0) })
                                    .call(() => {
                                        for (let c = 0; c < GameConfig.col; c++) {
                                            for (let r = 0; r < GameConfig.row; r++) {
                                                if (this.getType(c, r)) {
                                                    try {
                                                        this.getTile(c, r).node.setPosition(v3(MapManager.getPos(c, r).x, MapManager.getPos(c, r).y, 0))
                                                    } catch (error) {

                                                    }
                                                }
                                            }
                                        }
                                        this.tryEliminate();
                                        res(Coord(c, r));
                                    })
                                    .start();
                            }));
                            break;
                        }
                    }
                }
            }
        }

        // 等待所有方块完成下落动画
        await Promise.all(promises);
    }

    /**
     * 填充空位
     */
    private async fillEmpty() {
        for (let c = 0; c < GameConfig.col; c++) {
            for (let r = 0; r < GameConfig.row; r++) {
                // 找到空位
                if (!this.getType(c, r)) {
                    let type = GameUtil.getRandomType();
                    let tile = this.getNewTile(c, r, type);
                    this.setTile(c, r, tile)
                    this.setType(c, r, type);
                }
            }
        }
        await new Promise(res => setTimeout(res, 100));
    }

    /**
     * 设置类型表
     * @param x 横坐标
     * @param y 纵坐标
     */
    private getType(x: number | Coordinate, y?: number): TileType {
        try {
            return (typeof x === 'number') ? this.typeMap[x][y] : this.typeMap[x.x][x.y];
        } catch (error) {

        }
    }

    /**
     * 获取类型
     * @param x 横坐标
     * @param y 纵坐标
     * @param type 类型
     */
    private setType(x: number | Coordinate, y: number | TileType, type?: TileType) {
        try {
            if (typeof x === 'number') this.typeMap[x][y] = type;
            else this.typeMap[x.x][x.y] = <TileType>y;
        } catch (error) {

        }
    }

    /**
     * 获取组件
     * @param x 横坐标
     * @param y 纵坐标
     */
    private getTile(x: number | Coordinate, y?: number): Tile {
        return typeof x === 'number' ? this.tileMap[x][y] : this.tileMap[x.x][x.y];
    }

    /**
     * 设置组件表
     * @param x 横坐标
     * @param y 纵坐标
     * @param type 组件
     */
    private setTile(x: number | Coordinate, y: number | Tile, tile?: Tile) {
        if (typeof x === 'number') this.tileMap[x][<number>y] = tile;
        else this.tileMap[x.x][x.y] = <Tile>y;
    }

    /**
     * 初始化
     */
    public static init() {
        this.instance.generateInitTypeMap();
        this.instance.generateTiles();
    }

    /**
     * 生成初始的类型表
     */
    private generateInitTypeMap() {
        this.typeMap = GameUtil.getInitTypeMap();
        // if (!GameUtil.hasValidCombo(this.typeMap)) {
        //     this.typeMap = GameUtil.getInitTypeMap();
        // }
    }

    /**
     * 根据类型表生成方块
     */
    private generateTiles() {
        this.tileMap = [];
        for (let c = 0; c < GameConfig.col; c++) {
            let colTileSet: Tile[] = [];
            for (let r = 0; r < GameConfig.initialRow; r++) {
                colTileSet.push(this.getNewTile(c, r, this.typeMap[c][r]));
            }
            this.tileMap.push(colTileSet);
        }
    }

    /**
     * 生成并初始化方块
     * @param x 横坐标
     * @param y 纵坐标
     * @param type 类型
     */
    private getNewTile(x: number, y: number, type: TileType): Tile {
        let node = PoolManager.get();
        node.setParent(this.container);
        node.setPosition(v3(MapManager.getPos(x, y).x, MapManager.getPos(x, y).y, 0));
        let tile = node.getComponent(Tile);
        tile.init();
        tile.setCoord(x, y);
        tile.setType(type);
        tile.appear();
        return tile;
    }
}