import { _decorator, Component, director, instantiate, Node, Sprite } from 'cc';
import { tgxModuleContext, tgxUIMgr } from '../../../../../core_tgx/tgx';
import { GameUILayers } from '../../../../../scripts/GameUILayers';
import { UI_Eliminate, UI_OverComp } from '../../../../../scripts/UIDef';
import { Layout_Over } from './Layout_Over';
import { SceneDef } from '../../../../../scripts/SceneDef';
import { DataGetter } from '../../../../../start/DataGetter';
import { Layout_Normal } from '../../../../ui/ui_normal/Layout_Normal';
import { BuildGame, GameState } from '../../../../script/BuildGame';
const { ccclass, property } = _decorator;

@ccclass('UI_OverComp')
export class UI_OverComp_Impl extends UI_OverComp {

    constructor() {
        super('eliminate/prefabs/gameOver', GameUILayers.ALERT, Layout_Over);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        this.onButtonEvent('Continue', () => {
            tgxUIMgr.inst.showUI(UI_Eliminate);
            this.hide()
            // director.loadScene(SceneDef.ELIMINATE_GAME);
        })


        this.onButtonEvent('Back', () => {
            Layout_Normal.inst.node.active = true;
            BuildGame.GS = GameState.normal;
            this.hide();
            // director.loadScene(SceneDef.BUILD_GAME);
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

tgxModuleContext.attachImplClass(UI_OverComp, UI_OverComp_Impl);
