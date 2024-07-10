import { _decorator, Button, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Layout_Build')
export class Layout_BuildFrame extends Component {

    @property(Node)
    buildingBox: Node = null;

    @property(Node)
    buildingSetting: Node = null;

    public static inst: Layout_BuildFrame = null;

    public cbOnSelectBuilding: Function;

    public onSelectBuilding(event: boolean){
        if(this.cbOnSelectBuilding){
            this.cbOnSelectBuilding(event);
        }
    }

    protected start(): void {
        Layout_BuildFrame.inst = this;
    }
}


