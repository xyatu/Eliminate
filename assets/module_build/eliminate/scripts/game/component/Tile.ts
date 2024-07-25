import { _decorator, Component, Sprite, Event, tween, v3, NodeEventType, EventTouch, log, Vec3, UITransform, warn, Tween, math } from 'cc';
const { ccclass, property } = _decorator;

import ResManager from "../manager/ResManager";
import PoolManager from "../manager/PoolManager";
import { GameEvent } from '../../../eazax-ccc/core/GameEvent';
import TileManager from '../manager/TileManager';
import { EliminateState } from '../manager/EliminateState';
import { TileEvent, TileType } from '../../../../../scripts/Enum';
import { Coord, Coordinate } from '../../../../../scripts/DataStructure';
import { DataGetter, Sound } from '../../../../../start/DataGetter';
import { SoundConfig } from '../../../../../start/SoundConfig';
import { tgxAudioMgr } from '../../../../../core_tgx/tgx';

@ccclass('Tile')
export default class Tile extends Component {

    @property(Sprite)
    private sprite: Sprite | null = null; // 显示图片的组件

    private _type: TileType = null; // 类型

    isFalling: boolean = true;

    tween = null;

    /**
     * 获取该方块的类型
     */
    public get type() { return this._type; }

    private _coord: Coordinate = null; // 坐标

    /**
     * 获取该方块的坐标
     */
    public get coord() { return this._coord; }

    protected onLoad() {
        this.bindTouchEvents();
    }

    protected start(): void {
        EliminateState.inst.cbGameOverEvent.push(() => {
            warn(`Tile Un Bind Touch Events`);
            this.unbindTouchEvents();
        })
    }

    protected onDestroy() {
        this.unbindTouchEvents();
    }

    /**
     * 节点池复用回调
     */
    public reuse() {
        this.bindTouchEvents();
    }

    /**
     * 节点池回收回调
     */
    public unuse() {
        this.unbindTouchEvents();
    }

    /**
     * touchstart 回调
     * @param e 参数
     */
    private onTouchStart(e: EventTouch) {
        if (e.getID() === 0) {
            GameEvent.emit(TileEvent.TouchStart, this._coord.copy(), e.getLocation());
        }
    }

    /**
     * touchend 回调
     */
    private onTouchEnd() {
        GameEvent.emit(TileEvent.TouchEnd);
    }

    /**
     * touchcancel 回调
     * @param e 参数
     */
    private onTouchCancel(e: EventTouch) {
        GameEvent.emit(TileEvent.TouchCancel, this._coord.copy(), e.getLocation());
    }

    /**
     * touchmove 回调
     * @param e 参数
     */
    private onTouchMove(e: EventTouch) {
        GameEvent.emit(TileEvent.TouchMove, this._coord.copy(), e.getLocation());
    }

    /**
     * 绑定点击事件
     */
    private bindTouchEvents() {
        this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(NodeEventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.node.on(NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd, this);
    }

    /**
     * 解绑点击事件
     */
    private unbindTouchEvents() {
        this.node.off(NodeEventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(NodeEventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.node.off(NodeEventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(NodeEventType.TOUCH_END, this.onTouchEnd, this);
    }

    /**
     * 初始化
     */
    public init() {
        this._type = null;
        this.sprite.spriteFrame = null;
        if (!this._coord) this._coord = Coord();
        this.node.setScale(v3(0));
    }

    /**
     * 设置类型
     * @param type 类型
     */
    public setType(type: TileType) {
        this._type = type;
        this.updateDisplay();
    }

    /**
     * 更新方块图片
     */
    private updateDisplay() {
        this.sprite.spriteFrame = ResManager.getTileSpriteFrame(this._type);
    }
    /**
     * 设置坐标
     * @param x 横坐标
     * @param y 纵坐标
     */
    public setCoord(x: number | Coordinate, y?: number) {
        if (!this._coord) this._coord = Coord();
        this._coord.set(x, y);
    }
    /**
     * 显示方块
     */
    public appear() {
        tween(this.node)
            .to(0.075, { scale: v3(1.1, 1.1, 1) })
            .to(0.025, { scale: v3(1, 1, 1) })
            .start();
    }
    /**
     * 消失并回收
     */
    public disappear() {
        // this.scheduleOnce(() => {
            let sound: Sound = DataGetter.inst.sound.get(SoundConfig.eliminate_normal);
            tgxAudioMgr.inst.playOneShot(sound.audio, sound.volumn);
        // }, math.randomRange(0, 0.1))
        tween(this.node)
            .to(0.1, { scale: v3(0) })
            .call(() => PoolManager.put(this.node))
            .start();
    }
}