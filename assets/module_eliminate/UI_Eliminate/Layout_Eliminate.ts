import { _decorator, Component, Label, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Layout_Eliminate')
export class Layout_Eliminate extends Component {
    @property(Prefab)
    scorePrefab: Prefab = null;

    @property(Node)
    scoreBox: Node = null;

    private static instance: Layout_Eliminate = null;

    public cbChangeScoreEvent: Function = null;

    protected onLoad(): void {
        Layout_Eliminate.instance = this;

    }

    public static changeScore(score: number) {
        Layout_Eliminate.instance.onChangeScoreEvent(score);
    }

    public onChangeScoreEvent(score: any) {
        if (this.cbChangeScoreEvent) {
            this.cbChangeScoreEvent(score);
        }
    }
}


