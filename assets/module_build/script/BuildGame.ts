import { _decorator, Component, Contact2DType, director, Input, input, instantiate, Label, log, Node, PhysicsSystem2D, Prefab, v3 } from 'cc';
import { tgxAudioMgr, tgxUIEditAlert, tgxUIMgr } from '../../core_tgx/tgx';
import BuildGameUtil from './BuildGameUtil';
import { Builder } from './manager/Builder';
import { GameManager } from '../../start/GameManager';
import { Layout_Normal } from '../ui/ui_normal/Layout_Normal';
import { Layout_BuildFrame } from '../ui/ui_buildFrame/Layout_BuildFrame';
import { DataGetter, Sound } from '../../start/DataGetter';
import { SoundConfig } from '../../start/SoundConfig';
import { UI_BuildFrame, UI_MapGrid, UI_Normal } from '../../scripts/UIDef';
import BuildMapManager from './manager/BuildMapManager';
import BuildGameConfig_Impl from './data/BuildGameConfig';
import BuildingPool from '../../scripts/BuildingPool';
import { Layout_MapGrid } from '../ui/map/Layout_MapGrid';
const { ccclass, property } = _decorator;

@ccclass('game')
export class BuildGame extends Component {

    public static inst: BuildGame = null;

    @property(Label)
    gold: Label = null;

    @property(Prefab)
    building: Prefab = null;

    isBuild: boolean = false;

    protected onLoad(): void {
        BuildGame.inst = this;
        for (let index = 0; index < 3000; index++) {
            BuildingPool.put(instantiate(this.building));
        }
    }

    stateInit() {
        BuildGameUtil.loadGame();
    }

    start() {
        // BuildGameUtil.initWallMap();
        this.stateInit();
        tgxUIMgr.inst.showUI(UI_MapGrid, () => {
            Layout_MapGrid.inst.node.scale = v3(0.5, 0.5, 1);
            this.loadMap();
        });
        BuildMapManager.init();
        tgxUIMgr.inst.showUI(UI_BuildFrame, () => {
            tgxUIMgr.inst.showUI(UI_Normal, () => {
                this.changeGold(0);
                Layout_Normal.inst.node.active = false;
            })
        });

        tgxAudioMgr.inst.stop();
        let buildBG: Sound = DataGetter.inst.sound.get(SoundConfig.buildBg);
        tgxAudioMgr.inst.play(buildBG.audio, buildBG.volumn, true);
    }

    loadMap() {
        BuildGameConfig_Impl.currentIndex = 0;
        Builder.inst.loadMap();
    }

    changeGold(changeval: number) {
        GameManager.inst.onGoldChange(changeval);
        Layout_Normal.inst.onGoldChange(GameManager.inst.playerState.gold);
        Layout_BuildFrame.inst.onGoldChange(GameManager.inst.playerState.gold);
        BuildGameUtil.saveGold();
    }
}


