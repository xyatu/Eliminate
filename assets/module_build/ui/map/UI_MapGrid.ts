import { _decorator, Camera, Component, EventMouse, EventTouch, find, instantiate, Layout, log, Node, NodeEventType, size, UITransform, v3, Vec2 } from 'cc';
import { tgxUIController } from '../../../core_tgx/tgx';
import { GameUILayers } from '../../../scripts/GameUILayers';
import { Layout_MapGrid } from './Layout_MapGrid';
import BuildGameConfig from '../../script/data/BuildGameConfig';
import { Coordinate } from '../../../module_eliminate/scripts/game/type/DataStructure';
const { ccclass, property } = _decorator;

@ccclass('Map')
export class UI_MapGrid extends tgxUIController {

    constructor() {
        super('ui/map/UI_MapGrid', GameUILayers.GAME, Layout_MapGrid);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        let layout = this.layout as Layout_MapGrid;

        layout.node.getComponent(UITransform).setContentSize(size(BuildGameConfig.row * BuildGameConfig.size, BuildGameConfig.col * BuildGameConfig.size));
        layout.grid.node.getComponent(UITransform).setContentSize(size(BuildGameConfig.row * BuildGameConfig.size, BuildGameConfig.col * BuildGameConfig.size));

        for (let index = 0; index < BuildGameConfig.row * BuildGameConfig.col; index++) {
            instantiate(layout.cell).setParent(layout.grid.node);
        }

        for (let index = 0; index < BuildGameConfig.layers; index++) {
            let layer: Node = instantiate(layout.layer);
            this.node.addChild(layer);
            layer.setPosition(0, 0, index);
            layer.name = index.toString();
        }

        layout.cbOnChangeScale = (event: boolean) => {
            let scaleVal = event ? 0.01 : -0.01
            let newX = layout.node.scale.x + scaleVal;
            if (newX < 0.3) newX = 0.3;
            else if (newX > 2) newX = 2;
            let newY = layout.node.scale.y + scaleVal;
            if (newY < 0.3) newY = 0.3;
            else if (newY > 2) newY = 2;
            layout.node.setWorldScale(newX, newY, layout.node.scale.z);
        }

        layout.cbOnBuildModeChange = (event: boolean) => {
            if (event) {
                find('Canvas').on(NodeEventType.TOUCH_MOVE, this.touchMove, this, true);
                find('Canvas').on(NodeEventType.MOUSE_WHEEL, this.mouseWheel, this, true);
            }
            else {
                find('Canvas').off(NodeEventType.TOUCH_MOVE, this.touchMove, this, true);
                find('Canvas').off(NodeEventType.MOUSE_WHEEL, this.mouseWheel, this, true);
            }
        }
    }

    touchMove(event: EventTouch) {
        this.dragShow(event);
    }

    mouseWheel(event: EventMouse) {
        this.layout.onChangeScale(event.getScrollY() > 0);
    }

    dragShow(event: EventTouch) {
        let layout = this.layout as Layout_MapGrid;
        const delta = event.getDelta();
        let newPos = v3(layout.node.getPosition().x + delta.x, layout.node.getPosition().y + delta.y, layout.node.getPosition().z)
        layout.node.setPosition(newPos);

        if (event.getTouches().length === 2) {
            const touches = event.getTouches();
            const touch1 = touches[0].getLocation();
            const touch2 = touches[1].getLocation();
            const preTouch1 = touches[0].getPreviousLocation();
            const preTouch2 = touches[1].getPreviousLocation();
            const currentDistance = Vec2.distance(touch1, touch2);
            const preDistance = Vec2.distance(preTouch1, preTouch2);

            if (currentDistance > preDistance) {
                layout.onChangeScale(true);
            }
            else if (currentDistance < preDistance) {
                layout.onChangeScale(false);
            }
        }
    }
}


