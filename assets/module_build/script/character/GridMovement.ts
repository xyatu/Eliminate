import { _decorator, Component, log, tween, v2, v3 } from 'cc';
import { CharacterFSM, Direction } from './CharacterFSM';
import { Coord, Coordinate } from '../../../scripts/DataStructure';
import BuildGameConfig from '../data/BuildGameConfig';
import { AIController } from './NPC/AIController';
import { CharacterState } from './CharacterState';
import { Layout_MapGrid } from '../../ui/map/Layout_MapGrid';
import { GameManager } from '../../../start/GameManager';
import BuildGameUtil from '../BuildGameUtil';
import BuildMapManager from '../manager/BuildMapManager';
import { Builder } from '../manager/Builder';
const { ccclass, property } = _decorator;


@ccclass('GridMovement')
export class GridMovement extends Component {

    willStop: boolean = false;

    CharacterMove(direction: Direction) {
        if (!this.node.getComponent(CharacterState).isMoving) {
            this.willStop = false;
            let target: Coordinate = this.node.getComponent(CharacterState).characterCoord.copy();
            switch (direction) {
                case Direction.Up:
                    target = Coord(target.x, target.y + 1);
                    break;
                case Direction.Down:
                    target = Coord(target.x, target.y - 1);
                    break;
                case Direction.Left:
                    target = Coord(target.x - 1, target.y);
                    break;
                case Direction.Right:
                    target = Coord(target.x + 1, target.y);
                    break;
            }

            if (target.x < 0 || target.x >= GameManager.inst.playerState.mapCol || target.y < 0 || target.y >= GameManager.inst.playerState.mapRow) return;

            for (let index = 0; index < BuildGameConfig.layers - 1; index++) {
                if (BuildMapManager.collisionMapDit[index][target.y][target.x] == BuildGameConfig.noPassVal) {
                    return;
                }
            }

            if (BuildMapManager.collisionMapDit[BuildGameConfig.characterType][target.y][target.x] == BuildGameConfig.NPCNum) return;

            this.node.getComponent(CharacterState).isMoving = true;

            this.resetData(this.node.getComponent(CharacterState).characterCoord, target);
            this.node.getComponent(CharacterState).characterCoord = target.copy();

            if (direction !== Direction.None) {
                BuildGameUtil.saveplayerCoord(target);
                log('movement' + target.toString());
            }

            this.resetLayer();
            tween(this.node)
                .to(this.node.getComponent(CharacterState).role.moveTime, { position: v3(BuildMapManager.getPos(target).x, BuildMapManager.getPos(target).y - BuildGameConfig.size / 2, 0) })
                .then(tween().call(() => {
                    this.node.getComponent(CharacterState).isMoving = false;
                    if (this.willStop) this.node.getComponent(CharacterFSM).playAnimationForDirection(Direction.None);
                }))
                .start();

            Layout_MapGrid.inst.onFollow(this.node.getComponent(CharacterState).role.moveTime, v2(-BuildMapManager.getPos(target).x, -BuildMapManager.getPos(target).y - BuildGameConfig.size / 2));
        }
        else if (direction === Direction.None) {
            this.willStop = true;
        }
    }

    AIMove(dir: { direction: Direction; dx: number; dy: number; }, coord: Coordinate) {
        if (!this.node.getComponent(CharacterState).isMoving) {
            this.node.getComponent(CharacterFSM).playAnimationForDirection(dir.direction);
            this.node.getComponent(CharacterState).isMoving = true;
            let target = Coord(coord.x + dir.dx, coord.y + dir.dy);
            this.resetData(this.node.getComponent(CharacterState).characterCoord, target);
            this.node.getComponent(CharacterState).characterCoord = target.copy();
            this.resetLayer();
            tween(this.node)
                .to(this.node.getComponent(CharacterState).role.moveTime, { position: v3(BuildMapManager.getPos(target).x, BuildMapManager.getPos(target).y - BuildGameConfig.size / 2, 0) })
                .then(tween().call(() => {
                    this.node.getComponent(CharacterState).isMoving = false;
                    this.node.getComponent(AIController).resetMoveTarget();
                    this.node.getComponent(CharacterFSM).playAnimationForDirection(Direction.None);
                }))
                .start();
        }
    }

    resetData(oldCoord: Coordinate, newCoord: Coordinate) {
        BuildMapManager.buildMapDit[BuildGameConfig.characterType][oldCoord.y][oldCoord.x] = 0;
        BuildMapManager.buildMapDit[BuildGameConfig.characterType][newCoord.y][newCoord.x] =
            this.node.getComponent(CharacterState).isPlayer ? BuildGameConfig.playerNum : BuildGameConfig.NPCNum;


        BuildMapManager.collisionMapDit[BuildGameConfig.characterType][oldCoord.y][oldCoord.x] = 0;
        BuildMapManager.collisionMapDit[BuildGameConfig.characterType][newCoord.y][newCoord.x] =
            this.node.getComponent(CharacterState).isPlayer ? BuildGameConfig.playerNum : BuildGameConfig.NPCNum;
    }

    resetLayer() {
        let coord = this.node.getComponent(CharacterState).characterCoord;
        let b: boolean = false;
        for (let index = 0; index < BuildGameConfig.layers; index++) {
            if (BuildMapManager.collisionMapDit[index][coord.y][coord.x] !== 0) {
                Layout_MapGrid.inst.node.getChildByName(index < BuildGameConfig.buttomRole ? BuildGameConfig.buttomRole.toString() : index.toString()).addChild(this.node);
                b = true;
                break;
            }
        }
        if (!b) {
            Layout_MapGrid.inst.node.getChildByName('11').addChild(this.node);
        }
    }
}


