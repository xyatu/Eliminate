import { _decorator, Color, Component, EventTouch, instantiate, log, Node, Prefab, Sprite, UITransform, v3, Vec3, view } from 'cc';
import { Building } from '../../../start/DataGetter';
import { BuildingState } from '../../script/building/BuildingState';
import { BuilderComp } from '../../script/manager/BuilderComp';
import { Layout_MapGrid } from '../map/Layout_MapGrid';
import BuildGameConfig from '../../script/data/BuildGameConfig';
import { tgxUIAlert } from '../../../core_tgx/tgx';
import { GameManager } from '../../../start/GameManager';
import BuildGameUtil from '../../script/BuildGameUtil';
import { Builder } from '../../script/manager/Builder';
import { BuildGame } from '../../script/BuildGame';
const { ccclass, property } = _decorator;

@ccclass('UI_Building')
export class UI_Building extends Component {

    @property(Prefab)
    building: Prefab = null;

    building_data: Building = null;

    isLock: boolean = true;

    start() {
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchEnd(event: EventTouch) {
        if (this.isLock) {
            tgxUIAlert.show(`是否花费 ${this.building_data.price} 解锁此建筑`, true).onClick(isOk => {
                if (isOk) {
                    this.isLock = false;
                    this.unlockBuilding(this.building_data);
                }
            })
            return;
        }

        Builder.inst.createBuilding(this.building_data);
    }

    setLock(isLock: boolean) {
        this.isLock = isLock;

        if (this.isLock) {
            this.node.getChildByName('Sprite').getComponent(Sprite).color = Color.BLACK;
        }
    }

    unlockBuilding(data: Building) {
        let ps_gold: number = GameManager.inst.playerState.gold;
        if (ps_gold >= data.price) {
            BuildGame.inst.changeGold(-data.price)
        }
        else {
            tgxUIAlert.show(`金币不足`);
            return;
        }

        GameManager.inst.playerState.hasBuilding.push(data.id);

        BuildGameUtil.saveHasBuilding();

        this.node.getChildByName('Sprite').getComponent(Sprite).color = Color.WHITE;
    }
}
