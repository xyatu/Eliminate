import { _decorator, Component, Node } from 'cc';
import { tgxUIController } from '../../../../core_tgx/tgx';
import { UILayers } from '../../../../core_tgx/easy_ui_framework/UILayers';
import { Layout_GameManager } from './Layout_GameManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends tgxUIController {
    constructor(){
        super('script/manager/GameManager/GameManager',UILayers.GAME,Layout_GameManager)
    }
}


