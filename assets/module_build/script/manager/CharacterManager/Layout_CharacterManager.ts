import { _decorator, Component, log, Node, Prefab, SpriteFrame, Vec2 } from 'cc';
import { Coord, Coordinate } from '../../../../module_eliminate/scripts/game/type/DataStructure';
import { AnimationController } from '../../character/AnimationController';
const { ccclass, property } = _decorator;

@ccclass('Layout_CharacterManager')
export class Layout_CharacterManager extends Component {
    @property(Prefab)
    characterPrefab: Prefab = null;

    @property(SpriteFrame)
    playerSpriteFrame: SpriteFrame = null;

    @property(SpriteFrame)
    npcSpriteFrame: SpriteFrame = null;

    public player: Node = null;

    public static playerCoord: Coordinate = null;

    public static isMoving: boolean = false;

    public static moveTime: number = 0.5;

    public cbOnCreateCharacter: Function;

    public static inst: Layout_CharacterManager;

    protected onLoad(): void {
        Layout_CharacterManager.inst = this;
    }

    public static createCharacter(isPlayer: boolean, coord: Coordinate) {
        if (isPlayer && this.inst.player) {
            log(`有且只能有一个玩家`);
            return;
        }
        if (this.inst.cbOnCreateCharacter) {
            this.inst.cbOnCreateCharacter(isPlayer, coord);
        }
    }
}


