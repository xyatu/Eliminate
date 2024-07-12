import { _decorator, Component, Node, Prefab, instantiate, Sprite, SpriteFrame, Vec3, Vec2, v3, log } from 'cc';
import { tgxUIController } from '../../../../core_tgx/tgx';
import { UILayers } from '../../../../core_tgx/easy_ui_framework/UILayers';
import { Layout_CharacterManager } from './Layout_CharacterManager';
import { Coordinate } from '../../../../module_eliminate/scripts/game/type/DataStructure';
import BuildMapManager from '../BuildMapManager';
import { Layout_MapGrid } from '../../../ui/map/Layout_MapGrid';
import { CharacterMovement2D } from '../../character/CharacterMovement2D';
const { ccclass, property } = _decorator;

@ccclass('CharacterManager')
export class CharacterManager extends tgxUIController {

    constructor() {
        super('script/manager/CharacterManager/CharacterManager', UILayers.GAME, Layout_CharacterManager)
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        let layout = this.layout as Layout_CharacterManager;
        try {
            layout.cbOnCreateCharacter = (isPlayer: boolean, coord: Coordinate) => {
                const character = this.createCharacter(layout, coord);
                if (isPlayer) {
                    this.createPlayer(layout, character, coord);
                }
                else {
                    this.createNPC(character);
                }
            }
        } catch (error) {
            log(layout);
        }
    }

    createPlayer(layout: Layout_CharacterManager, character: Node, coord: Coordinate) {
        // const player = this.createCharacter(this.playerSpriteFrame, position);
        character.addComponent(CharacterMovement2D).moveSpeed = 500; // 添加虚拟摇杆控制器
        // return player;
        layout.player = character;
        Layout_CharacterManager.playerCoord = coord;
        return;
    }

    createNPC(character: Node) {
        // const npc = this.createCharacter(this.npcSpriteFrame, position);
        // const aiController = npc.addComponent(AIController); // 添加AI控制器
        // aiController.setTargetPosition(new Vec3(10, 0, 0)); // 设置目标位置
        // return npc;
        log(`创建NPC`);
        return;
    }

    private createCharacter(layout: Layout_CharacterManager, coord: Coordinate): Node {
        const character = instantiate(layout.characterPrefab);
        let position = BuildMapManager.getPos(coord);
        Layout_MapGrid.inst.node.addChild(character);
        character.setPosition(v3(position.x, position.y, 0));
        return character;
    }
}
