import { _decorator, Component, director, instantiate, log, Node, Prefab, view } from 'cc';
import GameUtil from '../util/GameUtil';
import { tgxAudioMgr, tgxUIAlert, tgxUIController, tgxUIMgr, tgxUIWaiting } from '../../../../core_tgx/tgx';
import { SceneDef } from '../../../../scripts/SceneDef';
import { GameManager } from '../../../../start/GameManager';
import { SlotConfig } from '../../../../start/SlotConfig';
import { DataGetter, Sound } from '../../../../start/DataGetter';
import { SoundConfig } from '../../../../start/SoundConfig';
import { UI_OverComp } from '../../../../scripts/UIDef';
const { ccclass, property } = _decorator;

@ccclass('EliminateState')
export class EliminateState extends Component {

    public static inst: EliminateState = null;

    public isGameOver: boolean = false;

    public cbGameOverEvent: Function[] = [];

    public score: number = 0;

    protected onLoad(): void {
        EliminateState.inst = this;
    }

    protected start(): void {
        this.cbGameOverEvent.push(this.gameOver);
    }

    public static changeScore(interval: number) {
        EliminateState.inst.score += interval;
    }

    public static getScore(): number {
        return EliminateState.inst.score;
    }

    private gameOver() {
        EliminateState.inst.isGameOver = true;
        let gold = Math.floor(EliminateState.inst.score / 100);

        GameManager.inst.onGoldChange(gold);
        EliminateState.inst.saveGold();

        let over: UI_OverComp = tgxUIMgr.inst.showUI(UI_OverComp, () => {
            over.initUI(gold);
        });
    }

    public static onGameOverEvent(event?: any) {

        let sound: Sound = DataGetter.inst.sound.get(SoundConfig.eliminate_over);
        tgxAudioMgr.inst.playOneShot(sound.audio, sound.volumn);

        if (EliminateState.inst.cbGameOverEvent.length > 0) {
            EliminateState.inst.cbGameOverEvent.forEach(cbGameOverEvent => cbGameOverEvent(event));
        }
    }

    saveGold() {
        localStorage.setItem(SlotConfig.slot_gold, GameManager.inst.playerState.gold.toString());
    }
}


