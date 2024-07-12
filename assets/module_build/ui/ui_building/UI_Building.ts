import { _decorator, Canvas, Component, director, Event, EventTouch, find, instantiate, log, math, Node, NodeEventType, rect, ScrollView, size, sp, Sprite, SpriteFrame, UITransform, v2, v3, Vec3, view } from 'cc';
import { tgxUIAlert, tgxUIController, tgxUIMgr } from '../../../core_tgx/tgx';
import { UILayers } from '../../../core_tgx/easy_ui_framework/UILayers';
import { Layout_Building } from './Layout_Building';
import { Layout_MapGrid } from '../map/Layout_MapGrid';
import BuildMapManager from '../../script/manager/BuildMapManager';
import BuildGameConfig from '../../script/data/BuildGameConfig';
import { Coordinate } from '../../../module_eliminate/scripts/game/type/DataStructure';
import BuildGameUtil from '../../script/BuildGameUtil';
import { Layout_BuildFrame } from '../ui_buildFrame/Layout_BuildFrame';
import { Builder } from './Builder';
const { ccclass, property } = _decorator;

@ccclass('UI_Building')
export class UI_Building extends tgxUIController {
    constructor() {
        super('ui/ui_building/UI_Building', UILayers.POPUP1, Layout_Building);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        let layout = this.layout as Layout_Building;

        this.nodeSetting(layout);

        this.node.on(NodeEventType.TOUCH_START, this.touchStart, this, true);
        this.node.on(NodeEventType.TOUCH_MOVE, this.touchMove, this, true);
        this.node.on(NodeEventType.TOUCH_CANCEL, this.touchCancel, this, true);
    }

    getBuildingType(): number {
        let layout = this.layout as Layout_Building;
        return layout.buildingType;
    }

    setParent(parent: Node) {
        this.node.setParent(parent);
    }

    touchStart(e: EventTouch) {
        // log(`Start`);
        Layout_BuildFrame.inst.node.on(NodeEventType.TOUCH_END, this.touchEnd, this, true);
        let layout = this.layout as Layout_Building;
        BuildMapManager.ClearSelectNode();
        layout.dragNum = 0;
        this.node.addChild(layout.builder.createDrag(layout, layout.sprite, true))
        layout.initialPosition.set(this.node.position);

        // 记录鼠标点击位置与节点中心点的偏移量
        const touchLocation = e.getUILocation();
        const nodePosition = layout.buildingDrag.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
        layout.offset.set(touchLocation.x - nodePosition.x, touchLocation.y - nodePosition.y, 0);
    }

    touchMove(e: EventTouch) {
        // log(`move`);
        let layout = this.layout as Layout_Building;
        const touchLocation = e.getUILocation();
        const newPos = new Vec3(touchLocation.x - layout.offset.x, touchLocation.y - layout.offset.y, layout.initialPosition.z);
        layout.buildingDrag.setPosition(this.node.getComponent(UITransform).convertToNodeSpaceAR(newPos));
    }

    touchEnd() {
        // log(`End`);
        Layout_BuildFrame.inst.node.off(NodeEventType.TOUCH_END, this.touchEnd, this, true);
        let layout = this.layout as Layout_Building;
        layout.dragNum = 0;
        if (layout.buildingDrag && layout.buildingDrag.isValid) layout.buildingDrag.destroy();
    }

    touchCancel() {
        // log(`Cancel`);
        let layout = this.layout as Layout_Building;

        Layout_BuildFrame.inst.node.off(NodeEventType.TOUCH_END, this.touchEnd, this, true);
        layout.dragNum++;
        if (layout.dragNum >= 2) {
            layout.dragNum = 0;

            if (BuildGameUtil.nodeIsInsideTargetArea(layout.buildingDrag, Layout_MapGrid.inst.node)) {
                layout.builder.buildBuilding(layout, this);
            }

            if (layout.buildingDrag && layout.buildingDrag.isValid) layout.buildingDrag.destroy();
        }
    }

    buildingTouchStart(e: EventTouch) {
        log(`buildingStart`);
        BuildMapManager.ClearSelectNode();
        let layout = this.layout as Layout_Building;
        layout.dragNum = 0;
        layout.buildingWasMove = false;
        e.target.addChild(layout.builder.createDrag(layout, e.target.getChildByName('Sprite').getComponent(Sprite).spriteFrame, false));
        layout.initialPosition.set(e.target.position);

        // 记录鼠标点击位置与节点中心点的偏移量
        const touchLocation = e.getUILocation();
        const nodePosition = layout.buildingDrag.getComponent(UITransform).convertToWorldSpaceAR(Vec3.ZERO);
        layout.offset.set(touchLocation.x - nodePosition.x, touchLocation.y - nodePosition.y, 0);
        BuildMapManager.hideBuilding(e.target);
    }

    buildingTouchMove(e: EventTouch) {
        log(`buildingmove`);
        let layout = this.layout as Layout_Building;
        layout.buildingWasMove = true;
        const touchLocation = e.getUILocation();
        const newPos = new Vec3(touchLocation.x - layout.offset.x, touchLocation.y - layout.offset.y, layout.initialPosition.z);
        layout.buildingDrag.setPosition(e.target.getComponent(UITransform).convertToNodeSpaceAR(newPos));
    }

    buildingTouchCancel(e: EventTouch) {
        log(`buildingCancel`);
        let layout = this.layout as Layout_Building;

        layout.dragNum++;
        if (layout.dragNum >= 1) {
            layout.dragNum = 0;

            if (BuildGameUtil.nodeIsInsideTargetArea(layout.buildingDrag, Layout_MapGrid.inst.node)) {
                if (!layout.builder.buildBuilding(layout, this)) {
                    e.target.getChildByName('Sprite').active = true;
                }
            }
            else {
                e.target.getChildByName('Sprite').active = true;
            }
            if (layout.buildingDrag && layout.buildingDrag.isValid) layout.buildingDrag.destroy();
        }
    }

    buildingTouchEnd(e: EventTouch) {
        log(`buildingEnd`);
        let layout = this.layout as Layout_Building;
        if (layout.buildingDrag && layout.buildingDrag.isValid) layout.buildingDrag.destroy();
        log(e.target)
        if (!layout.buildingWasMove) {
            e.target.getChildByName('Sprite').active = true;
            e.target.getChildByName('bg').active = true;
            BuildMapManager.SetSelectNode(e.target);
            if (layout.buildingDrag && layout.buildingDrag.isValid) layout.buildingDrag.destroy();
            layout.buildingWasMove = false;
        }
        else {
            if (BuildGameUtil.nodeIsInsideTargetArea(layout.buildingDrag, Layout_MapGrid.inst.node)) {
                if (!layout.builder.buildBuilding(layout, this)) {
                    e.target.getChildByName('Sprite').active = true;
                }
            }
            else {
                e.target.getChildByName('Sprite').active = true;
            }
        }
    }

    private nodeSetting(layout: Layout_Building) {

        for (let i = 0; i < BuildGameConfig.autoTileHeight / BuildGameConfig.autoTileSize; i++) {
            for (let j = 0; j < BuildGameConfig.autoTileWidth / BuildGameConfig.autoTileSize; j++) {
                layout.tileSet.push(Builder.cropSpriteFrame(layout.autoTileSet, rect(BuildGameConfig.autoTileSize * j, BuildGameConfig.autoTileSize * i, BuildGameConfig.autoTileSize, BuildGameConfig.autoTileSize)))
            }
        }

        // this.node.setScale(v3(5, 5, 1));

        // layout.showUI();

        layout.sprite = Builder.cropSpriteFrame(layout.autoTileSet, rect(0, 0, BuildGameConfig.autoTileSize * 2, BuildGameConfig.autoTileSize * 2))

        this.node.getComponent(Sprite).spriteFrame = layout.sprite;

        this.setShapeArray(layout);

        this.setSize(layout);

        this.node.getComponent(UITransform).setContentSize(layout.size);
    }

    private setShapeArray(layout: Layout_Building) {
        layout.shape.split(';').reverse().forEach(row => {
            let rowArr: number[] = [];
            for (let index = 0; index < row.length; index++) {
                const element = row[index];
                rowArr.push(parseInt(element));
            }

            layout.shapeArray.push(rowArr);
        })

        layout.shapeArray = layout.shapeArray.reverse();
    }

    private setSize(layout: Layout_Building) {
        layout.size = size(layout.shapeArray.reduce((previous, current) => {
            return previous.length > current.length ? previous : current;
        }).length * BuildGameConfig.size, layout.shapeArray.length * BuildGameConfig.size);
    }
}


