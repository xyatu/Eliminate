import { _decorator, Component, Layout, log, Node, Prefab, UITransform, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Layout_Map')
export class Layout_MapGrid extends Component {

    @property(Layout)
    grid: Layout = null;

    @property(Prefab)
    cell: Prefab = null;

    @property(Prefab)
    layer: Prefab = null;

    public static inst: Layout_MapGrid = null;

    private static _posMap: Vec2[][] = null;

    private static width: number = null;

    private static height: number = null;

    private static beginX: number = null;

    private static beginY: number = null;

    protected onLoad(): void {
        Layout_MapGrid.inst = this;
    }

    protected start(): void {
        this.node.setPosition(0,0,0);
    }
}


