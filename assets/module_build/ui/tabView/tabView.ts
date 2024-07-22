import { _decorator, Button, Canvas, Component, EventHandler, Layout, log, Node, ScrollView, size, Size, Sprite, SpriteFrame, UITransform, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('tabView')
export class tabView extends Component {
    @property(Node)
    tabButton: Node = null;

    @property(Node)
    tabview: Node = null;

    @property(Node)
    defaultSelect: Node = null;

    selectedTab: Node = null;

    @property(SpriteFrame)
    selectBtn: SpriteFrame = null;

    selectSize: Size = new Size(128, 140);

    evenSpriteFrame: SpriteFrame = null;
    evenSize: Size = null;
    evenPos: Vec3 = null;

    protected start(): void {
        this.tabButton.children.forEach(tabButton => {

            let handler = new EventHandler();
            handler.target = this.node;
            handler.component = 'tabView';
            handler.handler = 'switchTab';

            tabButton.getComponent(Button).clickEvents.push(handler);
        })

        this.scheduleOnce(() => {
            this.setTab(this.defaultSelect)
        }, 0.01)
    }

    switchTab(e: any) {
        this.setTab(e.currentTarget)
    }

    setTab(currentTarget) {
        if (this.selectedTab) {
            this.select(this.selectedTab, false);
        }
        this.selectedTab = currentTarget;
        this.select(this.selectedTab, true);
        this.tabview.children.forEach(view => {
            view.active = false;
        })
        this.tabview.getChildByName(this.selectedTab.name).active = true;
    }

    select(target: Node, isSelect: boolean) {
        if (isSelect) {
            this.evenSpriteFrame = target.getChildByName('Sprite').getComponent(Sprite).spriteFrame;
            this.evenSize = target.getComponent(UITransform).contentSize.clone();
            this.evenPos = target.getChildByName('Sprite').getPosition().clone();
            target.getChildByName('Sprite').getComponent(Sprite).spriteFrame = this.selectBtn;
            target.getComponent(UITransform).setContentSize(this.selectSize);
            target.getChildByName('Sprite').getComponent(UITransform).setContentSize(this.selectSize);
            if (target.getSiblingIndex() === 0) {
                target.getChildByName('Sprite').setPosition(target.getChildByName('Sprite').position.x + 11, target.getChildByName('Sprite').position.y, target.getChildByName('Sprite').position.z);
            }
            else if (target.getSiblingIndex() === target.parent.children.length - 1) {
                target.getChildByName('Sprite').setPosition(target.getChildByName('Sprite').position.x + 8, target.getChildByName('Sprite').position.y, target.getChildByName('Sprite').position.z);
            }
            else {
                target.getChildByName('Sprite').setPosition(target.getChildByName('Sprite').position.x + 11, target.getChildByName('Sprite').position.y, target.getChildByName('Sprite').position.z);
            }
        } else {
            target.getChildByName('Sprite').getComponent(Sprite).spriteFrame = this.evenSpriteFrame;
            target.getComponent(UITransform).setContentSize(this.evenSize);
            target.getChildByName('Sprite').getComponent(UITransform).setContentSize(this.evenSize);
            target.getChildByName('Sprite').setPosition(this.evenPos);
        }
        target.children[1].setPosition(target.children[1].position.x, target.getComponent(UITransform).height / 2 - 6, target.children[1].position.z);
    }
}


