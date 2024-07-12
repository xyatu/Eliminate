import { _decorator, Component, log, Node } from 'cc';
import { tgxUIEditAlert, tgxUIMgr } from '../../core_tgx/tgx';
import { UI_MapGrid } from '../ui/map/UI_MapGrid';
import { UI_BuildFrame } from '../ui/ui_buildFrame/UI_BuildFrame';
import BuildMapManager from './manager/BuildMapManager';
import BuildGameUtil from './BuildGameUtil';
import { UI_Normal } from '../ui/ui_normal/UI_Normal';
import { CharacterManager } from './manager/CharacterManager/CharacterManager';
import { GameManager } from './manager/GameManager/GameManager';
const { ccclass, property } = _decorator;

@ccclass('game')
export class BuildGame extends Component {
    start() {
        BuildGameUtil.initWallMap();
        tgxUIMgr.inst.showUI(UI_MapGrid);
        tgxUIMgr.inst.showUI(UI_Normal);
        tgxUIMgr.inst.showUI(GameManager);
        tgxUIMgr.inst.showUI(CharacterManager);
        BuildMapManager.init();
    }
}


