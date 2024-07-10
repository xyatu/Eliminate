import { _decorator, Component, log, Node } from 'cc';
import { tgxUIMgr } from '../../core_tgx/tgx';
import { UI_MapGrid } from '../ui/map/UI_MapGrid';
import { UI_BuildFrame } from '../ui/ui_buildFrame/UI_BuildFrame';
import BuildMapManager from './manager/BuildMapManager';
import BuildGameUtil from './BuildGameUtil';
const { ccclass, property } = _decorator;

@ccclass('game')
export class BuildGame extends Component {
    start() {
        BuildGameUtil.initWallMap();
        tgxUIMgr.inst.showUI(UI_MapGrid);
        tgxUIMgr.inst.showUI(UI_BuildFrame);
        BuildMapManager.init();
    }

    update(deltaTime: number) {
        
    }
}


