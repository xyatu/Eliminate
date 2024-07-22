import { _decorator, Component, director, instantiate, Node, Sprite } from 'cc';
import { tgxUIController, tgxUIMgr } from '../../../../core_tgx/tgx';
import { GameUILayers } from '../../../../scripts/GameUILayers';
import { Layout_Over } from './Layout_Over';
import { DataGetter } from '../../../../start/DataGetter';
import { SceneDef } from '../../../../scripts/SceneDef';
const { ccclass, property } = _decorator;

@ccclass('UI_OverComp')
export class UI_OverComp extends tgxUIController {

    constructor() {
        super('prefabs/gameOver', GameUILayers.POPUP, Layout_Over);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        this.onButtonEvent('Continue', () => {
            tgxUIMgr.inst.hideAll();
            director.loadScene(SceneDef.ELIMINATE_GAME);
        })


        this.onButtonEvent('Back', () => {
            tgxUIMgr.inst.hideAll();
            director.loadScene(SceneDef.BUILD_GAME);
        })

    }

    initUI(score: number) {
        let layout = this.layout as Layout_Over;

        for (let index = 0; index < score.toString().length; index++) {
            let scoreNode = instantiate(layout.scorePrefab);
            scoreNode.getComponent(Sprite).spriteFrame = DataGetter.inst.numSprite.num[parseInt(score.toString()[index])];
            layout.scoreBox.addChild(scoreNode);
        }
    }
}


