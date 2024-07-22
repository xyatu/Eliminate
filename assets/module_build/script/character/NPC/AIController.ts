import { _decorator, Component, log, math, Node } from 'cc';
import { Coord, Coordinate } from '../../../../module_eliminate/scripts/game/type/DataStructure';
import BuildGameConfig from '../../data/BuildGameConfig';
import { GridMovement } from '../GridMovement';
import { Direction } from '../CharacterFSM';
import { CharacterState } from '../CharacterState';
import BuildMapManager from '../../manager/BuildMapManager';
import { CharacterManager } from '../../manager/CharacterManager';
import { GameManager } from '../../../../start/GameManager';
const { ccclass, property } = _decorator;

const direction = [
    { direction: Direction.Up, dx: 0, dy: 1 },
    { direction: Direction.Down, dx: 0, dy: -1 },
    { direction: Direction.Left, dx: -1, dy: 0 },
    { direction: Direction.Right, dx: 1, dy: 0 },
]

@ccclass('ALController')
export class AIController extends Component {

    targetPoint: Coordinate = new Coordinate();

    prosperous: number = 0;

    setMoveTarget() {
        if (this.node.getComponent(CharacterState).isMoving) return;

        if (!AIController.checkCanMove(this.node.getComponent(CharacterState).characterCoord)) {
            this.scheduleOnce(this.setMoveTarget, 2);
            return;
        }
        else {
            this.unschedule(this.setMoveTarget);
        }

        let dir: { direction: Direction; dx: number; dy: number; } = direction[Math.floor(math.randomRange(0, direction.length))];

        this.targetPoint = Coord(this.node.getComponent(CharacterState).characterCoord.x + dir.dx, this.node.getComponent(CharacterState).characterCoord.y + dir.dy).copy();

        while (!AIController.checkInMap(this.targetPoint) || AIController.checkBuildingData(this.targetPoint) || AIController.checkCharacter(this.targetPoint)) {

            dir = direction[Math.floor(math.randomRange(0, direction.length))];

            this.targetPoint = Coord(this.node.getComponent(CharacterState).characterCoord.x + dir.dx, this.node.getComponent(CharacterState).characterCoord.y + dir.dy).copy();
        }

        this.move(dir);
    }

    static checkCanMove(coord: Coordinate) {
        for (const iterator of direction) {
            const newX = iterator.dx + coord.x;
            const newY = iterator.dy + coord.y;

            if (this.checkInMap(Coord(newX, newY)) && !this.checkBuildingData(Coord(newX, newY))) {
                return true;
            }
        }

        return false;
    }

    static checkInMap(coord: Coordinate) {
        return coord.x >= 0 && coord.y >= 0 && coord.x < GameManager.inst.playerState.mapCol && coord.y < GameManager.inst.playerState.mapRow;
    }

    static checkBuildingData(coord: Coordinate) {
        for (let index = 0; index < BuildGameConfig.layers - 1; index++) {
            if (BuildMapManager.collisionMapDit[index][coord.y][coord.x] == BuildGameConfig.noPassVal) {
                return true;
            }
        }
        return false;
    }

    static checkCharacter(coord: Coordinate) {
        return BuildMapManager.buildMapDit[BuildGameConfig.characterType][coord.y][coord.x] != 0;
    }

    move(dir: { direction: Direction; dx: number; dy: number; }) {
        this.node.getComponent(GridMovement).AIMove(dir, this.node.getComponent(CharacterState).characterCoord);
    }

    protected start(): void {
        this.scheduleOnce(() => {
            this.setMoveTarget();
        }, 1)
    }

    resetMoveTarget() {
        if (Math.random() >= 0.7) {
            this.scheduleOnce(this.setMoveTarget, Math.random() * 3);
        }
        else {
            this.setMoveTarget();
        }
    }

    protected update(dt: number): void {
        if (CharacterManager.inst.player && this.node.getComponent(CharacterState).characterCoord) {
            if (this.isAdjacent(CharacterManager.inst.player.getComponent(CharacterState).characterCoord, this.node.getComponent(CharacterState).characterCoord)) {
                this.node.getChildByName('Dialog').active = true;
            }
            else {
                this.node.getChildByName('Dialog').active = false;
            }
        }
    }

    isAdjacent(player: Coordinate, npc: Coordinate): boolean {
        return (Math.abs(player.x - npc.x) + Math.abs(player.y - npc.y)) <= 1;
    }


}


