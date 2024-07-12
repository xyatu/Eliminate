import { _decorator, AssetManager, assetManager, Component, director, log, math, Node, profiler } from 'cc';
import { tgxUIAlert, tgxUIController, tgxUIEditAlert, tgxUIMgr } from '../../../core_tgx/tgx';
import { UILayers } from '../../../core_tgx/easy_ui_framework/UILayers';
import { Layout_Normal } from './Layout_Normal';
import { UI_BuildFrame } from '../ui_buildFrame/UI_BuildFrame';
import { SceneDef } from '../../../scripts/SceneDef';
import { ModuleDef } from '../../../scripts/ModuleDef';
import { Layout_CharacterManager } from '../../script/manager/CharacterManager/Layout_CharacterManager';
import { Coord } from '../../../module_eliminate/scripts/game/type/DataStructure';
import BuildGameConfig from '../../script/data/BuildGameConfig';
const { ccclass, property } = _decorator;

@ccclass('UI_Normal')
export class UI_Normal extends tgxUIController {
    constructor() {
        super('ui/ui_normal/UI_Normal', UILayers.HUD, Layout_Normal);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        let layout = this.layout as Layout_Normal;
        profiler.hideStats();
        this.onButtonEvent('Menu/Build', () => {
            tgxUIMgr.inst.showUI(UI_BuildFrame);
            this.hide();
        })

        this.onButtonEvent('Menu/Eliminate', () => {
            assetManager.loadBundle(ModuleDef.GAME_ELIMINATE, (err, bundle: AssetManager.Bundle) => {
                if (bundle) {
                    director.loadScene(SceneDef.ELIMINATE_GAME, () => {
                        tgxUIMgr.inst.hideAll();
                    });
                }
            });
        })

        this.onButtonEvent('Create/CreatePlayer', () => {
            // this.showEditAlert('请输入玩家目标坐标', true);
            Layout_CharacterManager.createCharacter(true, Coord(Math.floor(BuildGameConfig.col / 2), Math.floor(BuildGameConfig.row / 2)));
        })

        this.onButtonEvent('Create/CreateNPC', () => {
            // this.showEditAlert('请输入NPC目标坐标', false);
            tgxUIAlert.show('敬请期待', false);
        })
    }

    showEditAlert(content: string, isPlayer: boolean) {
        let opt = tgxUIEditAlert.show(content, true);
        opt.onClick((isOK: Boolean) => {
            if (isOK) {
                Layout_CharacterManager.createCharacter(isPlayer, Coord(parseInt(opt.X.string), parseInt(opt.Y.string)));
            }
        });
    }
}


