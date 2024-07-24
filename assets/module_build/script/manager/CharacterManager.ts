import { _decorator, Component, Node, Prefab, instantiate, Sprite, SpriteFrame, Vec3, Vec2, v3, log, math, BoxCollider2D, v2, size, UITransform } from 'cc';
import { Coord, Coordinate } from '../../../scripts/DataStructure';
import { Layout_MapGrid } from '../../ui/map/Layout_MapGrid';
import { CharacterMovement2D } from '../character/CharacterMovement2D';
import { AIController } from '../character/NPC/AIController';
import { CharacterState } from '../character/CharacterState';
import BuildGameConfig from '../data/BuildGameConfig';
import { DataGetter } from '../../../start/DataGetter';
import { GameManager } from '../../../start/GameManager';
import { BuildGame } from '../BuildGame';
import BuildGameUtil from '../BuildGameUtil';
import { GridMovement } from '../character/GridMovement';
import BuildMapManager from './BuildMapManager';
const { ccclass, property } = _decorator;

@ccclass('CharacterManager')
export class CharacterManager extends Component {
    @property(Prefab)
    characterPrefab: Prefab = null;

    public NPCArray: Node[] = [];

    public player: Node = null;

    public cbOnCreateCharacter: Function;

    public static inst: CharacterManager;

    accumulate: number = 0;

    timeTick: number = 0;

    protected onLoad(): void {
        CharacterManager.inst = this;
    }

    public static createCharacter(isPlayer: boolean, coord: Coordinate) {
        if (isPlayer && this.inst.player) {
            log(`有且只能有一个玩家`);
            return;
        }
        if (this.inst.cbOnCreateCharacter) {
            console.log(coord.toString());
            this.inst.cbOnCreateCharacter(isPlayer, coord);
        }
    }

    public getRes(): [] {
        return [];
    }

    protected start(): void {
        try {
            this.cbOnCreateCharacter = (isPlayer: boolean, coord: Coordinate) => {
                let npcCoord = isPlayer ? coord : this.randomCoord();
                const character = this.createCharacter(isPlayer ? coord : npcCoord);
                if (isPlayer) {
                    this.createPlayer(character, coord);
                }
                else {
                    this.createNPC(character, npcCoord);
                }
            }
        } catch (error) {
            error(`create character error: ${error}`);
        }
    }

    protected update(dt: number): void {
        if (BuildGame.inst.isBuild) return;
        if (GameManager.inst.playerState.prosperous >= this.accumulate) {
            this.timeTick += dt;
            if (this.timeTick >= BuildGameConfig.NPCSpawnInterval) {
                this.timeTick = 0;
                this.accumulate += Math.ceil(math.randomRange(this.accumulate + 200, this.accumulate + 300));

                CharacterManager.createCharacter(false, Coord());
            }
        }
    }

    createPlayer(character: Node, coord: Coordinate) {
        character.addComponent(CharacterMovement2D).moveSpeed = 500; // 添加虚拟摇杆控制器
        this.player = character;
        this.player.getComponent(CharacterState).characterCoord = coord;
        this.player.getComponent(CharacterState).isPlayer = true;
        BuildMapManager.buildMapDit[BuildGameConfig.characterType][coord.y][coord.x] = BuildGameConfig.playerNum;
        character.getComponent(CharacterState).role = DataGetter.inst.roledata[0];
        Layout_MapGrid.inst.node.getChildByName(BuildGameConfig.characterType.toString()).addChild(character);
        return;
    }

    createNPC(character: Node, coord: Coordinate) {
        const aiController = character.addComponent(AIController); // 添加AI控制器
        character.getComponent(CharacterState).characterCoord = coord.copy();
        this.NPCArray.push(character);
        character.getComponent(CharacterState).characterCoord = coord.copy();
        BuildMapManager.buildMapDit[BuildGameConfig.characterType][coord.y][coord.x] = BuildGameConfig.NPCNum;
        let index = Math.floor(math.randomRange(1, DataGetter.inst.roledata.length));
        let role = DataGetter.inst.roledata[index];
        character.getComponent(CharacterState).role = DataGetter.inst.roledata[index];
        Layout_MapGrid.inst.node.getChildByName(BuildGameConfig.characterType.toString()).addChild(character);
        return;
    }

    private createCharacter(coord: Coordinate): Node {
        const character = instantiate(this.characterPrefab);
        let position = BuildMapManager.getPos(coord);
        // character.setPosition(character.position.x + BuildGameConfig.size / 2, character.position.y, GameManager.inst.playerState.mapRow - coord.y)
        character.setPosition(v3(position.x, position.y - BuildGameConfig.size / 2, 0));
        return character;
    }

    randomCoord(): Coordinate {
        let result: Coordinate = new Coordinate();
        do {
            result = Coord(Math.floor(Math.random() * GameManager.inst.playerState.mapCol), Math.floor(Math.random() * GameManager.inst.playerState.mapRow));
        } while (!AIController.checkCanMove(result) || AIController.checkBuildingData(result) || AIController.checkCharacter(result));
        return result;
    }
}
