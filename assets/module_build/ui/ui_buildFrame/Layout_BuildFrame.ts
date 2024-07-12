import { _decorator, Button, Component, Node, Slider } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Layout_Build')
export class Layout_BuildFrame extends Component {

    @property(Node)
    buildingBox: Node = null;

    @property(Node)
    buildingSetting: Node = null;

    @property(Slider)
    slider: Slider = null;

    defaultSliderVal = 0.5;
    preSliderVal = this.defaultSliderVal;

    public static inst: Layout_BuildFrame = null;

    public cbOnSelectBuilding: Function;

    public cbOnSliderChange: Function;

    public onSelectBuilding(event: boolean){
        if(this.cbOnSelectBuilding){
            this.cbOnSelectBuilding(event);
        }
    }

    public onSliderChange(event: number){
        if(this.cbOnSliderChange){
            this.cbOnSliderChange(event);
        }
    }

    protected start(): void {
        Layout_BuildFrame.inst = this;
    }
}


