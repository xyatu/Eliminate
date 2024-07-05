import { _decorator, Component, log } from 'cc';
const { ccclass, property } = _decorator;

import MapManager from "./manager/MapManager";
import TileManager from "./manager/TileManager";
import { tgxUIController, tgxUIMgr } from '../../../core_tgx/tgx';
import { UI_Eliminate } from '../../UI_Eliminate/UI_Eliminate';
import { EliminateState } from './manager/EliminateState';

@ccclass('Game')
export default class Game extends Component {
    protected start() {
        tgxUIMgr.inst.showUI(UI_Eliminate);
        MapManager.init();
        TileManager.init();
    }
}