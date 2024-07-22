import { _decorator, Button, Component, Label, Node, NodeEventType, Prefab, Slider, Vec2 } from 'cc';
import { Builder } from '../../script/manager/Builder';
const { ccclass, property } = _decorator;

@ccclass('Layout_Build')
export class Layout_BuildFrame extends Component {

    @property(Node)
    buildingBox: Node = null;

    @property(Slider)
    slider: Slider = null;

    @property(Prefab)
    building_ui: Prefab = null;

    @property(Prefab)
    goldNum: Prefab = null;

    @property(Node)
    gold: Node = null;

    @property(Button)
    back: Button = null;

    @property(Button)
    clearAll: Button = null;

    public cbOnGoldChange: Function;

    defaultSliderVal = 0.5;
    preSliderVal = this.defaultSliderVal;

    public static inst: Layout_BuildFrame = null;

    public cbOnSliderChange: Function;

    preTouchDis: number = 0;

    public onSliderChange(event: number) {
        if (this.cbOnSliderChange) {
            this.cbOnSliderChange(event);
        }
    }

    public onGoldChange(gold: number) {
        if (this.cbOnGoldChange) {
            this.cbOnGoldChange(gold);
        }
    }

    protected onLoad(): void {
        Layout_BuildFrame.inst = this;
    }

    show() {
        this.node.active = true;
        Builder.isBuilding = true;
    }

    hide() {
        this.node.active = false
        Builder.isBuilding = false;
    }

}


