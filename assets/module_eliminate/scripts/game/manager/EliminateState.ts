import { _decorator, Component, director, Node, view } from 'cc';
import GameUtil from '../util/GameUtil';
import { tgxUIAlert, tgxUIMgr, tgxUIWaiting } from '../../../../core_tgx/tgx';
import { SceneDef } from '../../../../scripts/SceneDef';
const { ccclass, property } = _decorator;

@ccclass('EliminateState')
export class EliminateState extends Component {

    public static inst: EliminateState = null;

    public isGameOver: boolean = false;

    public cbGameOverEvent: Function[] = [];

    private score: number = 0;

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
        tgxUIAlert.show('游戏结束', false).onClick((isok: Boolean)=>{
            if(isok){
                director.loadScene(SceneDef.BUILD_GAME);
            }
        })
    }

    public static onGameOverEvent(event?: any) {
        if (EliminateState.inst.cbGameOverEvent.length > 0) {
            EliminateState.inst.cbGameOverEvent.forEach(cbGameOverEvent => cbGameOverEvent(event));
        }
    }
}


