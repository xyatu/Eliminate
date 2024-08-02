import { _decorator, Component, EventMouse, EventTouch, instantiate, log, math, Node, NodeEventType, Rect, Sprite, SpriteFrame, v2, v3 } from 'cc';
import { UILayers } from '../../../core_tgx/easy_ui_framework/UILayers';
import { Layout_BuildFrame } from './Layout_BuildFrame';
import { tgxModuleContext, tgxUIAlert, tgxUIController, tgxUIMgr } from '../../../core_tgx/tgx';
import { UI_Building } from '../ui_building/UI_Building';
import { Layout_MapGrid } from '../map/Layout_MapGrid';
import BuildGameConfig from '../../script/data/BuildGameConfig'
import { Layout_Normal } from '../ui_normal/Layout_Normal';
import BuildGameUtil from '../../script/BuildGameUtil';
import { DataGetter } from '../../../start/DataGetter';
import { Builder } from '../../script/manager/Builder';
import { BuildGame, GameState } from '../../script/BuildGame';
import { GameManager } from '../../../start/GameManager';
import { BuilderComp } from '../../script/manager/BuilderComp';
import { BuildingState } from '../../script/building/BuildingState';
import { CharacterManager } from '../../script/manager/CharacterManager';
import { CharacterState } from '../../script/character/CharacterState';
import { Coordinate } from '../../../scripts/DataStructure';
import { UI_BuildFrame, UI_Normal } from '../../../scripts/UIDef';
import BuildMapManager from '../../script/manager/BuildMapManager';
const { ccclass, property } = _decorator;

@ccclass('UI_Build')
export class UI_BuildFrame_Impl extends UI_BuildFrame {
    constructor() {
        super('ui/ui_buildFrame/UI_BuildFrame', UILayers.POPUP1, Layout_BuildFrame)
    }

    public getRes(): [] {
        return
    }

    protected onCreated(): void {
        let layout = this.layout as Layout_BuildFrame;
        DataGetter.inst.buildingdata.forEach(data => {
            let ui: Node = instantiate(layout.building_ui);
            ui.getComponent(UI_Building).building_data = data;
            if (data.autoTile === 1) {
                ui.getChildByName('tile').children[0].getComponent(Sprite).spriteFrame = data.anim.anim[0];
                ui.getChildByName('tile').children[1].getComponent(Sprite).spriteFrame = data.anim.anim[1];
                ui.getChildByName('tile').children[2].getComponent(Sprite).spriteFrame = data.anim.anim[6];
                ui.getChildByName('tile').children[3].getComponent(Sprite).spriteFrame = data.anim.anim[7];
            }
            else {
                ui.getChildByName('Sprite').getComponent(Sprite).spriteFrame = data.anim.anim[0];
            }
            layout.buildingBox.getChildByName(data.type.toString()).children[1].children[0].addChild(ui);
            ui.setPosition(v3(0, 0, 0))
            ui.getComponent(UI_Building).setLock((data.price > 0 && GameManager.inst.playerState.hasBuilding.findIndex(has => has === data.id) === -1));
            this.node.active = false;
            Layout_MapGrid.inst.node.getChildByName('grid').active = false;
        })

        this.onButtonEvent('Base/BuildingSetting/Remove', () => {
            BuildMapManager.RemoveSelectNode();
        }, this);

        this.onButtonEvent('Base/BuildingSetting/PutDown', () => {
            BuildMapManager.ClearSelectNode();
        }, this);

        this.onButtonEvent(layout.clearAll, () => {
            tgxUIAlert.show('你确定要移除全部建筑吗', true).onClick(isok => {
                if (isok) {
                    BuildMapManager.ClearAll();
                }
            })
        }, this);

        this.onButtonEvent('Base/ScaleSetting/Amplify', () => {
            Layout_MapGrid.inst.onChangeScale(true);
        }, this)

        this.onButtonEvent('Base/ScaleSetting/Reduce', () => {
            Layout_MapGrid.inst.onChangeScale(false);
        }, this)

        this.onButtonEvent(layout.back, () => {
            if (BuilderComp.inst.selectedBuilding) BuilderComp.inst.selectedBuilding.getComponent(BuildingState).unSelect();
            if (Layout_Normal.inst) {
                Layout_Normal.inst.node.active = true;
            }
            else {
                tgxUIMgr.inst.showUI(UI_Normal);
            }
            Layout_MapGrid.inst.node.setScale(v3(1, 1, 1));
            BuildMapManager.ClearSelectNode();
            BuildGame.inst.isBuild = false;
            Layout_MapGrid.inst.node.getChildByName('grid').active = false;

            layout.hide();

            let coord: Coordinate = CharacterManager.inst.player.getComponent(CharacterState).characterCoord;

            Layout_MapGrid.inst.onFollow(CharacterManager.inst.player.getComponent(CharacterState).role.moveTime,
                v2(-BuildMapManager.getPos(coord).x + BuildGameConfig.size / 2, -BuildMapManager.getPos(coord).y));

            BuildGame.GS = GameState.normal;
        })

        layout.cbOnSliderChange = () => {
            if (Math.abs(layout.slider.progress - layout.preSliderVal) > 0.001) {
                Layout_MapGrid.inst.onChangeScale(layout.slider.progress > layout.preSliderVal);
                layout.preSliderVal = layout.slider.progress;
            }
        }

        layout.cbOnGoldChange = this.onGoldChange;
    }

    onGoldChange(gold: number) {
        let self = this as unknown as Layout_Normal;
        // log(gold.toString().length)
        if (self.gold.children.length < gold.toString().length) {
            let len: number = self.gold.children.length;
            for (let index = 0; index < gold.toString().length - len; index++) {
                let goldNum: Node = instantiate(self.goldNum);
                self.gold.addChild(goldNum);
            }
        }
        else if (self.gold.children.length > gold.toString().length) {
            for (let index = 0; index < self.gold.children.length - gold.toString().length; index++) {
                self.gold.children[self.gold.children.length - 1 - index].destroy();
            }
        }

        for (let index = 0; index < gold.toString().length; index++) {
            self.gold.children[index].getComponent(Sprite).spriteFrame = DataGetter.inst.numSprite.jsNum[parseInt(gold.toString()[gold.toString().length - 1 - index])];
        }
    }

    onBuildModeChange(event: boolean) {
        Builder.isBuilding = event;
        if (event) {
            // this.node.on(NodeEventType.TOUCH_START, this.touchStart, this, true);
            // this.node.on(NodeEventType.TOUCH_MOVE, this.touchMove, this, true);
            // this.node.on(NodeEventType.TOUCH_END, this.touchEnd, this, true);
            this.node.on(NodeEventType.MOUSE_WHEEL, this.mouseWheel, this, true);
        }
        else {
            // this.node.off(NodeEventType.TOUCH_MOVE, this.touchMove, this, true);
            this.node.off(NodeEventType.MOUSE_WHEEL, this.mouseWheel, this, true);
        }
    }

    touchStart(event: EventTouch) {
        if (event.getTouches().length === 2) {
            const touches = event.getTouches();
            const touch1 = touches[0].getLocation();
            const touch2 = touches[1].getLocation();

            event.target.parent.parent.getComponent(Layout_BuildFrame).preTouchDis = touch1.subtract(touch2).length();
        }
    }

    touchMove(event: EventTouch) {
        if (event.getTouches().length === 2) {
            const touches = event.getTouches();
            const touch1 = touches[0].getLocation();
            const touch2 = touches[1].getLocation();
            log(event.target.parent)

            Layout_MapGrid.inst.onChangeScale(event.target.parent.parent.getComponent(Layout_BuildFrame).preTouchDis < touch1.subtract(touch2).length());
            event.target.parent.parent.getComponent(Layout_BuildFrame).preTouchDis = touch1.subtract(touch2).length();
        } else if (event.getTouches().length === 1) {
            BuildGameUtil.dragShow(event);
        }
    }

    touchEnd(event: EventTouch) {
        event.target.parent.parent.getComponent(Layout_BuildFrame).preTouchDis = 0;
    }

    mouseWheel(event: EventMouse) {
        Layout_MapGrid.inst.onChangeScale(event.getScrollY() > 0);
    }
}

tgxModuleContext.attachImplClass(UI_BuildFrame, UI_BuildFrame_Impl)
