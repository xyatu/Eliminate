import { _decorator, Button, Canvas, Component, EventHandler, Layout, log, Node, ScrollView, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('tabView')
export class tabView extends Component {
    @property(Node)
    tabButton: Node = null;

    @property(Node)
    tabview: Node = null;

    @property(Node)
    defaultSelect: Node = null;

    @property(SpriteFrame)
    unSelected: SpriteFrame = null;

    @property(SpriteFrame)
    selected: SpriteFrame = null;

    selectedTab: Node = null;

    protected start(): void {
        this.tabButton.children.forEach(tabButton => {

            let handler = new EventHandler();
            handler.target = this.node;
            handler.component = 'tabView';
            handler.handler = 'switchTab';

            tabButton.getComponent(Button).clickEvents.push(handler);
        })

        this.setTab(this.defaultSelect);
    }

    switchTab(e: any) {
        this.setTab(e.currentTarget)
    }

    setTab(currentTarget){
        if (this.selectedTab) this.selectedTab.getComponent(Sprite).spriteFrame = this.unSelected;
        this.selectedTab = currentTarget;
        this.selectedTab.getComponent(Sprite).spriteFrame = this.selected;
        this.tabview.children.forEach(view => {
            view.active = false;
        })
        this.tabview.getChildByName(this.selectedTab.name).active = true;
    }
}


