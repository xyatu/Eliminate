import { _decorator, AssetManager, assetManager, Component, director, game, Game, log, Node } from 'cc';
import { tgxUIController, tgxUIMgr } from '../../core_tgx/tgx';
import { GameUILayers } from '../../scripts/GameUILayers';
import { Layout_Eliminate } from './Layout_Eliminate';
import { ModuleDef } from '../../scripts/ModuleDef';
import { SceneDef } from '../../scripts/SceneDef';
const { ccclass, property } = _decorator;

const BundleName = ModuleDef.GAME_ELIMINATE;

@ccclass('UI_Eliminate')
export class UI_Eliminate extends tgxUIController {

    constructor() {
        super('ui_eliminate/UI_Eliminate', GameUILayers.HUD, Layout_Eliminate);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        let layout = this.layout as Layout_Eliminate;
        
        layout.cbChangeScoreEvent = (score)=>{
            layout.score.string = `得分: ${score}`;
        }

        this.onButtonEvent('Back',()=>{
            assetManager.loadBundle(ModuleDef.GAME_BUILD, (err, bundle: AssetManager.Bundle) => {
                if (bundle) {
                    director.loadScene(SceneDef.BUILD_GAME, () => {
                        tgxUIMgr.inst.hideAll();
                    });
                }
            });
        })
    }
}


 