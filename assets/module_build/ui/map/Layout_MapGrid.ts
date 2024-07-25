import { _decorator, Component, Layout, log, Node, NodeEventType, Prefab, UITransform, Vec2, Vec3 } from 'cc';
import { UI_Building } from '../ui_building/UI_Building';
import BuildGameConfig from '../../script/data/BuildGameConfig';
import { BuildingState } from '../../script/building/BuildingState';
const { ccclass, property } = _decorator;

@ccclass('Layout_Map')
export class Layout_MapGrid extends Component {

    @property(Layout)
    grid: Layout = null;

    @property(Prefab)
    cell: Prefab = null;

    @property(Prefab)
    layer: Prefab = null;

    @property(Node)
    bg: Node = null;

    @property(Node)
    layerNode: Node[] = [];
    @property(Node)
    topLayer: Node = null;

    initFinish: boolean = false;

    public static inst: Layout_MapGrid = null;

    public buildUI: UI_Building = null;

    public cbOnChangeScale: Function;

    public cbOnFollow: Function;

    public cbOnBuild: Function;

    touchStartDis: number = 0;

    preTouchDis: number = 0;

    isTouch: boolean = false;

    touchTime: number = 0;

    touchDis: number = 0;

    protected onLoad(): void {
        Layout_MapGrid.inst = this;
    }

    public onChangeScale(event: boolean) {
        if (this.cbOnChangeScale) {
            this.cbOnChangeScale(event);
        }
    }

    public onFollow(moveTime: number, targetPoint: Vec2) {
        if (this.cbOnFollow) {
            this.cbOnFollow(moveTime, targetPoint)
        }
    }

    private onBuild() {
        if (this.cbOnBuild && this.buildUI) {
            this.cbOnBuild(this.buildUI);
        }
    }
    protected start(): void {
        this.node.setPosition(0, 0, 0);
    }

    update(dt) {
        if (this.initFinish) {
            for (let index = BuildGameConfig.buttomLayer; index < BuildGameConfig.layers; index++) {
                this.node.getChildByName(index.toString()).children.sort((a, b) => b.position.y - a.position.y);

                for (let i = 0; i < this.node.getChildByName(index.toString()).children.length; i++) {
                    this.node.getChildByName(index.toString()).children[i].setSiblingIndex(i);
                }
            }
        }
    }
}


