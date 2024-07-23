import { _decorator, Button, Component, EventTouch, log, Node, NodeEventType, Sprite, UITransform, v3, Vec2, Vec3 } from 'cc';
import { Layout_MapGrid } from '../../ui/map/Layout_MapGrid';
import BuildMapManager from '../manager/BuildMapManager';
import BuildGameUtil from '../BuildGameUtil';
import { Building, DataGetter, Sound } from '../../../start/DataGetter';
import { Builder } from '../manager/Builder';
import { BuilderComp } from '../manager/BuilderComp';
import { Coordinate } from '../../../module_eliminate/scripts/game/type/DataStructure';
import BuildGameConfig from '../data/BuildGameConfig';
import { GPDrag } from '../drag/GPDrag';
import { SoundConfig } from '../../../start/SoundConfig';
import { tgxAudioMgr } from '../../../core_tgx/tgx';
const { ccclass, property } = _decorator;

@ccclass('buildingState')
export class BuildingState extends Component {

    @property(Button)
    move: Button = null;

    @property(Button)
    putDown: Button = null;

    @property(Button)
    Del: Button = null;

    @property(Node)
    bg: Node = null;

    isSelect: boolean = true;

    data: Building = null;

    initialPosition: Vec3 = new Vec3();
    offset: Vec3 = new Vec3();

    coord: Coordinate = null;

    origin: Vec2 = new Vec2();

    protected start(): void {
        this.node.on(NodeEventType.TOUCH_START, this.touchStart, this, true);
        this.node.on(NodeEventType.TOUCH_END, this.touchEnd, this, true);
    }

    select() {
        this.bg.active = true;
        this.isSelect = true;
        this.move.node.active = true;
        this.putDown.node.active = true;
        this.Del.node.active = true;
        this.node.parent = this.node.parent.parent.children[this.node.parent.parent.children.length - 5];
    }

    unSelect() {
        this.bg.active = false;
        this.isSelect = false;
        BuilderComp.inst.setSelect(null);
        this.move.node.active = false;
        this.putDown.node.active = false;
        this.Del.node.active = false;
        if (this.coord) {
            let loc: Vec2 = BuildMapManager.getPos(this.coord);
            this.node.setPosition(loc.x, loc.y - BuildGameConfig.size / 2, this.node.position.z);
            this.node.parent = this.node.parent.parent.getChildByName(this.data.layer.toString());
        }
    }

    doPutDown() {
        let sound: Sound = DataGetter.inst.sound.get(SoundConfig.build_determine);
        tgxAudioMgr.inst.playOneShot(sound.audio, sound.volumn);
        if (BuildGameUtil.nodeIsInsideTargetArea(this.node, Layout_MapGrid.inst.node)) {
            if (Builder.inst.tryBuild(this.node, this.data, false)) {
                this.unSelect();
            }
        }
    }

    remove() {
        let sound: Sound = DataGetter.inst.sound.get(SoundConfig.build_delete);
        tgxAudioMgr.inst.playOneShot(sound.audio, sound.volumn);
        this.unSelect();
        if (this.coord) {
            Builder.inst.remove(this.node, this.data, this.coord);
        }
        else {
            this.node.destroy();
        }
    }

    touchStart(event: EventTouch) {
        this.origin = event.getLocation();
    }

    touchEnd(event: EventTouch) {
        if (this.origin.subtract(event.getLocation()).length() > 50) return
        if (!this.isSelect) {
            let sound: Sound = DataGetter.inst.sound.get(SoundConfig.build_select);
            tgxAudioMgr.inst.playOneShot(sound.audio, sound.volumn);
            this.select();
            BuilderComp.inst.setSelect(this.node);
        }
    }

    moveEnd(e: EventTouch): EventTouch {
        let btnComp: GPDrag = e.target.getComponent(GPDrag);
        Builder.inst.adsorption(btnComp.moveNode);
        let sound: Sound = DataGetter.inst.sound.get(SoundConfig.build_select);
        tgxAudioMgr.inst.playOneShot(sound.audio, sound.volumn);
        return e;
    }

    check(e: EventTouch): boolean {
        let btnComp: GPDrag = e.target.getComponent(GPDrag);
        return Builder.inst.moveEndCheck(btnComp.moveNode.getComponent(BuildingState).data, btnComp.moveNode);
    }
}


