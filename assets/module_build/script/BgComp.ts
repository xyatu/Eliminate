import { _decorator, assetManager, Component, director, Node } from 'cc';
import { GameManager, PlayerState } from '../../start/GameManager';
import { tgxUIAlert, tgxUIController } from '../../core_tgx/tgx';
import BuildGameUtil from './BuildGameUtil';
import { ModuleDef } from '../../scripts/ModuleDef';
import { SceneDef } from '../../scripts/SceneDef';
import BuildMapManager from './manager/BuildMapManager';
const { ccclass, property } = _decorator;

@ccclass('BgComp')
export class BgComp extends Component {
    buyLand() {

        let ps: PlayerState = GameManager.inst.playerState;

        let row: number = ps.mapRow;
        let col: number = ps.mapCol;
        let gold: number = (row + col + 1) * 15;

        let str: string = `要花费${gold}金币购买一层地块吗？`

        tgxUIAlert.show(str, true).onClick(isOK => {
            if (isOK) {
                if (ps.gold < gold) {
                    tgxUIAlert.show(`金币不足`);
                    return;
                }
                GameManager.inst.onGoldChange(-gold);
                GameManager.inst.onRowChange(1);
                GameManager.inst.onColChange(1);
                BuildGameUtil.saveMap();
                BuildGameUtil.saveGold();

                tgxUIAlert.show(`刷新地图`).onClick(isOK => {
                    let bundle = assetManager.getBundle(ModuleDef.GAME_BUILD);
                    bundle.preloadScene(SceneDef.BUILD_GAME, () => {
                        tgxUIController.hideAll();
                        director.loadScene(SceneDef.BUILD_GAME);
                    });
                })

            }
        })
    }
}


