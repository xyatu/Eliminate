import { _decorator, assetManager, Component, director, Node } from 'cc';
import { GameManager, PlayerState } from '../../start/GameManager';
import { tgxUIAlert, tgxUIController, tgxUIMgr } from '../../core_tgx/tgx';
import BuildGameUtil from './BuildGameUtil';
import { ModuleDef } from '../../scripts/ModuleDef';
import { SceneDef } from '../../scripts/SceneDef';
import { Builder } from './manager/Builder';
import { BuildGame, BuildState, GameState } from './BuildGame';
import BuildMapManager from './manager/BuildMapManager';
import { BuildGameConfig, UI_MapGrid } from '../../scripts/UIDef';
import { Layout_MapGrid } from '../ui/map/Layout_MapGrid';
const { ccclass, property } = _decorator;

@ccclass('BgComp')
export class BgComp extends Component {
    buyLand() {
        if (!Builder.isBuilding) return;

        let ps: PlayerState = GameManager.inst.playerState;

        let row: number = ps.mapRow;
        let gold: number = 15000 + (row - 22) * 5000;

        let str: string = `要花费${gold}金币购买一层地块吗？`

        tgxUIAlert.show(str, true).onClick(isOK => {
            if (isOK) {
                if (ps.gold < gold) {
                    tgxUIAlert.show(`金币不足`);
                    return;
                }
                BuildGame.inst.changeGold(-gold);
                GameManager.inst.onRowChange(1);
                GameManager.inst.onColChange(1);
                BuildGameUtil.saveMap();
                BuildGameUtil.saveGold();
                BuildMapManager.init(true);
                Layout_MapGrid.inst.resetMap();

            }
        })
    }
}


