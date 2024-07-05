import { _decorator, Component, game, Game, log, Node } from 'cc';
import { tgxUIController } from '../../core_tgx/tgx';
import { GameUILayers } from '../../scripts/GameUILayers';
import { Layout_Eliminate } from './Layout_Eliminate';
import { ModuleDef } from '../../scripts/ModuleDef';
const { ccclass, property } = _decorator;

const BundleName = ModuleDef.GAME_ELIMINATE;

@ccclass('UI_Eliminate')
export class UI_Eliminate extends tgxUIController {

    constructor() {
        super('UI_Eliminate/UI_Eliminate', GameUILayers.HUD, Layout_Eliminate);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        let layout = this.layout as Layout_Eliminate;
        
        layout.cbChangeScoreEvent = (score)=>{
            layout.score.string = `得分: ${score}`;
        }
    }
}


