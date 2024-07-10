import { _decorator, Component, instantiate, Layout, log, Node, size, UITransform, Vec2 } from 'cc';
import { tgxUIController } from '../../../core_tgx/tgx';
import { GameUILayers } from '../../../scripts/GameUILayers';
import { Layout_MapGrid } from './Layout_MapGrid';
import BuildGameConfig from '../../script/data/BuildGameConfig';
import { Coordinate } from '../../../module_eliminate/scripts/game/type/DataStructure';
const { ccclass, property } = _decorator;

@ccclass('Map')
export class UI_MapGrid extends tgxUIController {

    constructor() {
        super('ui/map/UI_MapGrid', GameUILayers.POPUP, Layout_MapGrid);
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
            layer.setPosition(0,0,index);
            layer.name = index.toString();
        }
    }
}


