import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Layout_Eliminate')
export class Layout_Eliminate extends Component {
    @property(Label)
    score: Label = null;

    private static instance: Layout_Eliminate = null;

    public cbChangeScoreEvent: Function = null;

    protected onLoad(): void {
        Layout_Eliminate.instance = this;
        this.score.string = `得分： ${0}`
    }

    public static changeScore(score: number){
        Layout_Eliminate.instance.onChangeScoreEvent(score);
    }

    public onChangeScoreEvent(score: any) {
        if (this.cbChangeScoreEvent) {
            this.cbChangeScoreEvent(score);
        }
    }
}


