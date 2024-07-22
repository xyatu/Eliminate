import { _decorator, Component, log, tween, v2, v3 } from 'cc';
import { CharacterFSM, Direction } from './CharacterFSM';
import { Coord, Coordinate } from '../../../module_eliminate/scripts/game/type/DataStructure';
import BuildMapManager from '../manager/BuildMapManager';
import BuildGameConfig from '../data/BuildGameConfig';
import { AIController } from './NPC/AIController';
import { CharacterState } from './CharacterState';
import { Layout_MapGrid } from '../../ui/map/Layout_MapGrid';
import { GameManager } from '../../../start/GameManager';
import BuildGameUtil from '../BuildGameUtil';
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
                log('movement'+target.toString());
            }

            this.resetLayer();
            tween(this.node)
                .to(this.node.getComponent(CharacterState).moveTime, { position: v3(BuildMapManager.getPos(target).x + BuildGameConfig.size / 2, BuildMapManager.getPos(target).y, 0) })
                .then(tween().call(() => {
                    this.node.getComponent(CharacterState).isMoving = false;
                    if (this.willStop) this.node.getComponent(CharacterFSM).playAnimationForDirection(Direction.None);
                }))
                .start();

            Layout_MapGrid.inst.onFollow(this.node.getComponent(CharacterState).moveTime, v2(-BuildMapManager.getPos(target).x + BuildGameConfig.size / 2, -BuildMapManager.getPos(target).y));
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
                .to(this.node.getComponent(CharacterState).moveTime, { position: v3(BuildMapManager.getPos(target).x + BuildGameConfig.size / 2, BuildMapManager.getPos(target).y, 0) })
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
        for (let index = 0; index < BuildGameConfig.layers; index++) {
            if (BuildMapManager.buildMapDit[index][this.node.getComponent(CharacterState).characterCoord.y][this.node.getComponent(CharacterState).characterCoord.x] !== 0) {
                Layout_MapGrid.inst.node.getChildByName(index < 3 ? '3' : index.toString()).addChild(this.node);
                break;
            }
        }
    }
}


