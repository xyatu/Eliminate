import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Layout_GameManager')
export class Layout_GameManager extends Component {
    public static inst;

    protected onLoad(): void {
        Layout_GameManager.inst = this;
    }
}


