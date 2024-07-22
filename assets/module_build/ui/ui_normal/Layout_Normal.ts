import { _decorator, Button, Component, Label, LabelAtlas, log, Node, Prefab, Sprite } from 'cc';
import { DataGetter, NumSprite } from '../../../start/DataGetter';
const { ccclass, property } = _decorator;

@ccclass('Layout_Normal')
export class Layout_Normal extends Component {
    public static inst: Layout_Normal;

    @property(Node)
    hour: Node = null;

    @property(Node)
    minute: Node = null;

    @property(Node)
    week: Node = null;

    @property(Node)
    day: Node = null;

    @property(Node)
    gold: Node = null;

    @property(Prefab)
    goldNum: Prefab = null;

    @property(Button)
    build: Button = null;

    @property(Button)
    eliminate: Button = null;

    resetTimeInterval: number = 10;
    timeTick: number = 0;

    public cbOnGoldChange: Function;

    protected onLoad(): void {
        Layout_Normal.inst = this;
    }

    public onGoldChange(gold: number) {
        if (this.cbOnGoldChange) {
            this.cbOnGoldChange(gold);
        }
    }

    protected start(): void {
        this.setDate();
    }

    protected update(dt: number): void {
        this.timeTick += dt;
        if (this.timeTick >= this.resetTimeInterval) {
            this.timeTick -= this.resetTimeInterval;
            this.setDate();
        }
    }

    setDate() {
        let numSprite: NumSprite = DataGetter.inst.numSprite;
        let date: Date = new Date();
        let week: number = date.getDay();
        this.week.children[0].getComponent(Sprite).spriteFrame = numSprite.week[week - 1];

        let day: number = date.getDate();
        this.day.children[0].getComponent(Sprite).spriteFrame = numSprite.timeNum[day >= 10 ? parseInt(day.toString()[0]) : 0];
        this.day.children[1].getComponent(Sprite).spriteFrame = numSprite.timeNum[day >= 10 ? parseInt(day.toString()[1]) : parseInt(day.toString()[0])];


        let hour: number = date.getHours();
        this.hour.children[0].getComponent(Sprite).spriteFrame = numSprite.timeNum[hour >= 10 ? parseInt(hour.toString()[0]) : 0];
        this.hour.children[1].getComponent(Sprite).spriteFrame = numSprite.timeNum[hour >= 10 ? parseInt(hour.toString()[1]) : parseInt(hour.toString()[0])];

        let minute: number = date.getMinutes();
        this.minute.children[0].getComponent(Sprite).spriteFrame = numSprite.timeNum[minute >= 10 ? parseInt(minute.toString()[0]) : 0];
        this.minute.children[1].getComponent(Sprite).spriteFrame = numSprite.timeNum[minute >= 10 ? parseInt(minute.toString()[1]) : parseInt(minute.toString()[0])];
    }
}


