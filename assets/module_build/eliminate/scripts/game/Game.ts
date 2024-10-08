import { _decorator, Component, director, log, NodeEventType } from 'cc';
const { ccclass, property } = _decorator;

import MapManager from "./manager/MapManager";
import TileManager from "./manager/TileManager";
import { UI_Eliminate } from '../../../../scripts/UIDef';
import { tgxAudioMgr, tgxUIMgr } from '../../../../core_tgx/tgx';
import { DataGetter, Sound } from '../../../../start/DataGetter';
import { SoundConfig } from '../../../../start/SoundConfig';

@ccclass('Game')
export default class Game extends Component {
    protected start() {
        // tgxUIMgr.inst.showUI(UI_Eliminate);
        MapManager.init();
        TileManager.init();
        tgxAudioMgr.inst.stop();
        let eliminateBG: Sound = DataGetter.inst.sound.get(SoundConfig.eliminateBg);
        tgxAudioMgr.inst.play(eliminateBG.audio,eliminateBG.volumn,true);
    }
}