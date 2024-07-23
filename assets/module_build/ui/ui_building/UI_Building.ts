import { _decorator, Color, Component, EventTouch, instantiate, log, Node, Prefab, Sprite, UITransform, v3, Vec2, Vec3, view } from 'cc';
import { Building, DataGetter, Sound } from '../../../start/DataGetter';
import { BuildingState } from '../../script/building/BuildingState';
import { BuilderComp } from '../../script/manager/BuilderComp';
import { Layout_MapGrid } from '../map/Layout_MapGrid';
import BuildGameConfig from '../../script/data/BuildGameConfig';
import { tgxAudioMgr, tgxUIAlert } from '../../../core_tgx/tgx';
import { GameManager } from '../../../start/GameManager';
import BuildGameUtil from '../../script/BuildGameUtil';
import { Builder } from '../../script/manager/Builder';
import { BuildGame } from '../../script/BuildGame';
import { SoundConfig } from '../../../start/SoundConfig';
const { ccclass, property } = _decorator;

@ccclass('UI_Building')
export class UI_Building extends Component {

    @property(Prefab)
    building: Prefab = null;

    building_data: Building = null;

    isLock: boolean = true;
    originPos: Vec2 = new Vec2();

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart(event: EventTouch) {
        this.originPos = event.getLocation();
    }

    onTouchEnd(event: EventTouch) {
        if (this.originPos.subtract(event.getLocation()).length() > 50) return;
        let sound: Sound = DataGetter.inst.sound.get(SoundConfig.build_select);
        tgxAudioMgr.inst.playOneShot(sound.audio, sound.volumn);
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
            this.node.getChildByName('Sprite').getComponent(Sprite).color = new Color(180, 180, 180, 255);
            this.node.getChildByName('Lock').active = true;
        }
    }

    unlockBuilding(data: Building) {
        let ps_gold: number = GameManager.inst.playerState.gold;
        if (ps_gold >= data.price) {
            BuildGame.inst.changeGold(-data.price)
            this.node.getChildByName('Lock').active = false;

            this.node.getChildByName('Sprite').getComponent(Sprite).color = Color.WHITE;
        }
        else {
            tgxUIAlert.show(`金币不足`);
            return;
        }

        GameManager.inst.playerState.hasBuilding.push(data.id);

        BuildGameUtil.saveHasBuilding();
    }
}
