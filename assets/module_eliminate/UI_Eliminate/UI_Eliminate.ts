import { _decorator, AssetManager, assetManager, Component, director, game, Game, instantiate, Layout, log, Node, Sprite } from 'cc';
import { tgxAudioMgr, tgxUIAlert, tgxUIController, tgxUIMgr } from '../../core_tgx/tgx';
import { GameUILayers } from '../../scripts/GameUILayers';
import { Layout_Eliminate } from './Layout_Eliminate';
import { ModuleDef } from '../../scripts/ModuleDef';
import { SceneDef } from '../../scripts/SceneDef';
import { DataGetter, Sound } from '../../start/DataGetter';
import { SoundConfig } from '../../start/SoundConfig';
import { GameManager } from '../../start/GameManager';
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

        layout.cbChangeScoreEvent = (score) => {
            // layout.score.string = `得分: ${score}`;
            // DataGetter.inst.numSprite

            if (score.toString().length > 6) {
                layout.scoreBox.getComponent(Layout).resizeMode = 1;
                for (let index = 0; index < score.toString().length - 6; index++) {
                    layout.scoreBox.addChild(instantiate(layout.scorePrefab));
                }
            }
            for (let index = 0; index < score.toString().length; index++) {
                layout.scoreBox.children[index].active = true;
            }
            for (let index = 0; index < score.toString().length; index++) {
                layout.scoreBox.children[score.toString().length - 1 - index].getComponent(Sprite).spriteFrame =
                    DataGetter.inst.numSprite.jsNum[parseInt(score.toString()[index])]
            }
        }

        this.onButtonEvent('Back', () => {
            GameManager.inst.playClick();
            tgxUIAlert.show('要返回主界面吗', true).onClick(isOK => {
                if (isOK) {
                    assetManager.loadBundle(ModuleDef.GAME_BUILD, (err, bundle: AssetManager.Bundle) => {
                        if (bundle) {
                            director.loadScene(SceneDef.BUILD_GAME, () => {
                                tgxUIMgr.inst.hideAll();
                            });
                        }
                    });
                }
            })
        })

        layout.onChangeScoreEvent(0);
    }
}


