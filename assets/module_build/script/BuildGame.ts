import { _decorator, Component, Contact2DType, director, Input, input, Label, log, Node, PhysicsSystem2D } from 'cc';
import { tgxAudioMgr, tgxUIEditAlert, tgxUIMgr } from '../../core_tgx/tgx';
import { UI_MapGrid } from '../ui/map/UI_MapGrid';
import { UI_BuildFrame } from '../ui/ui_buildFrame/UI_BuildFrame';
import BuildMapManager from './manager/BuildMapManager';
import BuildGameUtil from './BuildGameUtil';
import { UI_Normal } from '../ui/ui_normal/UI_Normal';
import { Builder } from './manager/Builder';
import { GameManager } from '../../start/GameManager';
import { Layout_Normal } from '../ui/ui_normal/Layout_Normal';
import { Layout_BuildFrame } from '../ui/ui_buildFrame/Layout_BuildFrame';
import { DataGetter, Sound } from '../../start/DataGetter';
import { SoundConfig } from '../../start/SoundConfig';
const { ccclass, property } = _decorator;

@ccclass('game')
export class BuildGame extends Component {

    public static inst: BuildGame = null;

    @property(Label)
    gold: Label = null;

    isBuild: boolean = false;

    protected onLoad(): void {
        BuildGame.inst = this;
    }

    stateInit() {
        BuildGameUtil.loadGame();
    }

    start() {
        // BuildGameUtil.initWallMap();
        this.stateInit();
        BuildMapManager.init();
        tgxUIMgr.inst.showUI(UI_MapGrid, () => {
            this.loadMap();
        });
        ;
        tgxUIMgr.inst.showUI(UI_BuildFrame, () => {
            tgxUIMgr.inst.showUI(UI_Normal, () => {
                this.changeGold(0);
            })
        });

        tgxAudioMgr.inst.stop();
        let buildBG: Sound = DataGetter.inst.sound.get(SoundConfig.buildBg);
        tgxAudioMgr.inst.play(buildBG.audio, buildBG.volumn, true);
    }

    loadMap() {
        Builder.inst.loadMap();
    }

    changeGold(changeval: number) {
        GameManager.inst.onGoldChange(changeval);
        Layout_Normal.inst.onGoldChange(GameManager.inst.playerState.gold);
        Layout_BuildFrame.inst.onGoldChange(GameManager.inst.playerState.gold);
        BuildGameUtil.saveGold();
    }
}


