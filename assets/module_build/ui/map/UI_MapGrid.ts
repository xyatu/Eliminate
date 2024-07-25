import { _decorator, Camera, clamp, Component, director, EventMouse, EventTouch, find, instantiate, Layout, log, Node, NodeEventType, size, tween, UITransform, v2, v3, Vec2, Vec3, view } from 'cc';
import { tgxModuleContext, tgxUIAlert, tgxUIController } from '../../../core_tgx/tgx';
import { GameUILayers } from '../../../scripts/GameUILayers';
import { Layout_MapGrid } from './Layout_MapGrid';
import BuildGameConfig from '../../script/data/BuildGameConfig';
import { Coord, Coordinate } from '../../../scripts/DataStructure';
import BuildGameUtil from '../../script/BuildGameUtil';
import { UI_Building } from '../ui_building/UI_Building';
import { BuilderComp } from '../../script/manager/BuilderComp';
import { CharacterManager } from '../../script/manager/CharacterManager';
import { GameManager, PlayerState } from '../../../start/GameManager';
import { UI_MapGrid } from '../../../scripts/UIDef';
import BuildMapManager from '../../script/manager/BuildMapManager';
import { Builder } from '../../script/manager/Builder';
import { BuildGame, GameState } from '../../script/BuildGame';
const { ccclass, property } = _decorator;

@ccclass('Map')
export class UI_MapGrid_Impl extends UI_MapGrid {

    originalTouchDistance: number = -1;

    originalNodeScale: Vec3 = null;

    constructor() {
        super('ui/map/UI_MapGrid', GameUILayers.GAME, Layout_MapGrid);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        let layout = this.layout as Layout_MapGrid;

        layout.node.getComponent(UITransform).setContentSize(size(GameManager.inst.playerState.mapRow * BuildGameConfig.size, GameManager.inst.playerState.mapCol * BuildGameConfig.size));
        layout.grid.node.getComponent(UITransform).setContentSize(size(GameManager.inst.playerState.mapRow * BuildGameConfig.size, GameManager.inst.playerState.mapCol * BuildGameConfig.size));

        for (let index = 0; index < GameManager.inst.playerState.mapRow * GameManager.inst.playerState.mapCol; index++) {
            instantiate(layout.cell).setParent(layout.grid.node);
        }

        this.node.getChildByName('grid').setSiblingIndex(this.node.children.length - 2)

        let land = layout.land.getComponent(UITransform);
        let ps = GameManager.inst.playerState;
        land.width = ps.mapCol * BuildGameConfig.size;
        land.height = ps.mapRow * BuildGameConfig.size;

        layout.initFinish = true;

        layout.cbOnChangeScale = this.onChangeScale;

        layout.cbOnFollow = this.onFollow;

        layout.cbOnBuild = this.onBuild;

        layout.cbResetMap = this.resetMap;

        this.node.on(NodeEventType.TOUCH_MOVE, this.touchMove, this, false);
        // this.node.on(NodeEventType.MOUSE_WHEEL, this.mouseWheel, this, false);
    }

    resetMap(target: Layout_MapGrid) {
        let pos = target.grid.node.position
        target.grid.node.setPosition(pos.x + BuildGameConfig.size / 2, pos.y + BuildGameConfig.size / 2, pos.z)
        target.node.getComponent(UITransform).setContentSize(size(GameManager.inst.playerState.mapRow * BuildGameConfig.size, GameManager.inst.playerState.mapCol * BuildGameConfig.size));
        target.grid.node.getComponent(UITransform).setContentSize(size(GameManager.inst.playerState.mapRow * BuildGameConfig.size, GameManager.inst.playerState.mapCol * BuildGameConfig.size));

        target.grid.node.children.forEach(node => node.destroy());

        for (let index = 0; index < GameManager.inst.playerState.mapRow * GameManager.inst.playerState.mapCol; index++) {
            instantiate(target.cell).setParent(target.grid.node);
        }

        this.node.getChildByName('grid').setSiblingIndex(this.node.children.length - 2)

        let land = target.land.getComponent(UITransform);
        let landPos = target.land.position;
        target.land.setPosition(landPos.x + BuildGameConfig.size / 2, landPos.y + BuildGameConfig.size / 2, landPos.z)
        let ps = GameManager.inst.playerState;
        land.width = ps.mapCol * BuildGameConfig.size;
        land.height = ps.mapRow * BuildGameConfig.size;
    }

    touchMove(event: EventTouch) {
        if (BuilderComp.inst.selectedBuilding || !Builder.inst.isLoaded || BuildGame.GS !== GameState.build) return;

        BuildGameUtil.dragShow(event);

        // let touches = event.getTouches();
        // if (touches.length >= 2) {
        //     let temp = v2();
        //     Vec2.subtract(temp, touches[0].getLocation(), touches[1].getLocation());
        //     // 双指当前间距
        //     let distance = temp.length();
        //     if (this.originalTouchDistance == -1) {
        //         // 双指初始间距
        //         this.originalTouchDistance = distance;
        //         // 节点初始缩放
        //         this.originalNodeScale = this.node.scale.clone();

        //     }
        //     let targetScale = v3();
        //     // 双指当前间距 / 双指初始间距
        //     let scale = distance / this.originalTouchDistance;
        //     // 节点初始缩放 * (双指当前间距 / 双指初始间距)
        //     Vec3.multiplyScalar(targetScale, this.originalNodeScale, scale);
        //     scale = targetScale.x;
        //     // 属于节点缩放比
        //     scale = clamp(scale, BuildGameConfig.mapMinScale, BuildGameConfig.mapMaxScale);
        //     this.node.setScale(scale, scale, scale);
        // }
        //  else if (event.getTouches().length === 1) {
        //     BuildGameUtil.dragShow(event);
        // }
    }

    mouseWheel(event: EventMouse) {
        if (BuilderComp.inst.selectedBuilding || !BuildGame.inst.isBuild || !Builder.inst.isLoaded) return;
        Layout_MapGrid.inst.onChangeScale(event.getScrollY() > 0);
    }

    onChangeScale(event: boolean) {
        let scaleVal = event ? BuildGameConfig.scaleVal : -BuildGameConfig.scaleVal;
        let newX = this.node.scale.x + scaleVal;
        if (newX < BuildGameConfig.mapMinScale) newX = BuildGameConfig.mapMinScale;
        else if (newX > BuildGameConfig.mapMaxScale) newX = BuildGameConfig.mapMaxScale;
        let newY = this.node.scale.y + scaleVal;
        if (newY < BuildGameConfig.mapMinScale) newY = BuildGameConfig.mapMinScale;
        else if (newY > BuildGameConfig.mapMaxScale) newY = BuildGameConfig.mapMaxScale;
        this.node.setWorldScale(newX, newY, this.node.scale.z);

    }

    onFollow(moveTime: number, pos: Vec2) {
        let minx = BuildMapManager.getPos(0, 0).x - BuildGameConfig.size / 2;
        let miny = BuildMapManager.getPos(0, 0).y - BuildGameConfig.size / 2;
        let maxx = BuildMapManager.getPos(GameManager.inst.playerState.mapCol - 1, GameManager.inst.playerState.mapRow - 1).x + BuildGameConfig.size / 2;
        let maxy = BuildMapManager.getPos(GameManager.inst.playerState.mapCol - 1, GameManager.inst.playerState.mapRow - 1).y + BuildGameConfig.size / 2;

        // log(`pos: ${pos}, minx: ${cameraminx}, miny: ${cameraminy}, maxx: ${cameramaxx}, maxy: ${cameramaxy}, judge: ${pos.x <= cameraminx || pos.x >= cameramaxx || pos.y <= cameraminy || pos.y >= cameramaxy}`)

        if (pos.x <= minx || pos.x >= maxx) {
            tween(this.node)
                .to(moveTime, { position: v3(this.node.position.x, pos.y, this.node.position.z) })
                .start();
        }
        else if (pos.y <= miny || pos.y >= maxy) {
            tween(this.node)
                .to(moveTime, { position: v3(pos.x, this.node.position.y, this.node.position.z) })
                .start();
        } else {
            tween(this.node)
                .to(moveTime, { position: v3(pos.x, pos.y, this.node.position.z) })
                .start();
        }
    }

    onBuild(ui: UI_Building) {
        // let layout = ui.layout as Layout_Building;
        // if (BuildGameUtil.nodeIsInsideTargetArea(layout.buildingDrag, this.node)) {
        //     layout.builder.buildBuilding(layout);
        // }
    }
}
tgxModuleContext.attachImplClass(UI_MapGrid, UI_MapGrid_Impl);

