import { _decorator, Component, log } from 'cc';
const { ccclass, property } = _decorator;

import MapManager from "./manager/MapManager";
import TileManager from "./manager/TileManager";

@ccclass('Game')
export default class Game extends Component {
    protected start() {
        MapManager.init();
        TileManager.init();
    }
}