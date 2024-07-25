import { _decorator, Component, Contact2DType, director, Input, input, instantiate, Label, log, Node, PhysicsSystem2D, Prefab, v2, v3 } from 'cc';
import { tgxAudioMgr, tgxUIEditAlert, tgxUIMgr } from '../../core_tgx/tgx';
import BuildGameUtil from './BuildGameUtil';
import { Builder } from './manager/Builder';
import { GameManager } from '../../start/GameManager';
import { Layout_Normal } from '../ui/ui_normal/Layout_Normal';
import { Layout_BuildFrame } from '../ui/ui_buildFrame/Layout_BuildFrame';
import { DataGetter, Sound } from '../../start/DataGetter';
import { SoundConfig } from '../../start/SoundConfig';
import { BuildGameConfig, measure, UI_BuildFrame, UI_MapGrid, UI_Normal } from '../../scripts/UIDef';
import BuildMapManager from './manager/BuildMapManager';
import BuildGameConfig_Impl from './data/BuildGameConfig';
import BuildingPool from '../../scripts/BuildingPool';
import { Layout_MapGrid } from '../ui/map/Layout_MapGrid';
import { Coordinate } from '../../scripts/DataStructure';
import { CharacterManager } from './manager/CharacterManager';
const { ccclass, property } = _decorator;

export enum GameState {
    normal,
    build,
    eliminate,
}

export enum BuildState {
    notBuild,
    haveSelect,
    noSelect,
}

@ccclass('game')
export class BuildGame extends Component {

    public static GS: GameState = GameState.normal;

    public static BS: BuildState = BuildState.notBuild;

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
        tgxUIMgr.inst.showUI(UI_MapGrid);
        BuildMapManager.init();
        tgxUIMgr.inst.showUI(UI_BuildFrame, () => {
            tgxUIMgr.inst.showUI(UI_Normal, () => {
                this.changeGold(0);
                Layout_Normal.inst.node.active = false;
                Layout_MapGrid.inst.node.scale = v3(1.2, 1.2, 1);

                let coord: Coordinate = GameManager.inst.playerState.playerCoord;
                if (!coord) {
                    coord = new Coordinate(Math.floor(GameManager.inst.playerState.mapCol / 2), Math.floor(GameManager.inst.playerState.mapRow / 2));
                }
                CharacterManager.createCharacter(true, coord);

                Layout_MapGrid.inst.onFollow(0.01, v2(-BuildMapManager.getPos(coord).x + BuildGameConfig_Impl.size / 2, -BuildMapManager.getPos(coord).y));

                this.loadMap();
            })
        });

        tgxAudioMgr.inst.stop();
        let buildBG: Sound = DataGetter.inst.sound.get(SoundConfig.buildBg);
        tgxAudioMgr.inst.play(buildBG.audio, buildBG.volumn, true);
        BuildGame.GS = GameState.normal;
        BuildGame.BS = BuildState.notBuild;
    }

    // @measure
    loadMap() {
        // log(GameManager.inst.playerState.building);
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


