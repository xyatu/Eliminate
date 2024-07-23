import { _decorator, Component, Node, Vec2, v2, Prefab, Vec3, log } from 'cc';
import { EasyController, EasyControllerEvent } from './EasyController';
import { CharacterFSM, Direction } from './CharacterFSM';
import { GridMovement } from './GridMovement';
import BuildGameConfig from '../data/BuildGameConfig';
import { CharacterState } from './CharacterState';
const { ccclass, property } = _decorator;

const tempV2 = v2();

const directions = [
    { name: Direction.Right, vector: new Vec2(1, 0) },
    { name: Direction.Left, vector: new Vec2(-1, 0) },
    { name: Direction.Up, vector: new Vec2(0, 1) },
    { name: Direction.Down, vector: new Vec2(0, -1) }
];

@ccclass('tgxCharacterMovement2D')
export class CharacterMovement2D extends Component {
    @property
    moveSpeed: number = 100;

    @property
    needRotation: boolean = false;

    start() {
        EasyController.on(EasyControllerEvent.MOVEMENT, this.onMovement, this);
        EasyController.on(EasyControllerEvent.MOVEMENT_STOP, this.onMovementStop, this);
    }

    private _moveFactor: number = 0;
    private _moveDir: Vec2 = v2(1, 0);

    public get moveDir(): Vec2 {
        return this._moveDir;
    }

    public get realSpeed(): number {
        return this.moveSpeed * this._moveFactor;
    }

    onMovement(degree, strengthen) {
        let angle = degree / 180 * Math.PI;
        if (this.needRotation) {
            this.node.setRotationFromEuler(0, 0, degree);
        }
        this._moveDir.set(Math.cos(angle), Math.sin(angle));
        this._moveDir.normalize();
        this._moveFactor = strengthen;
    }

    onMovementStop() {
        this._moveFactor = 0;
        this.node.getComponent(GridMovement).CharacterMove(Direction.None);
    }

    onDestroy() {
        EasyController.off(EasyControllerEvent.MOVEMENT, this.onMovement, this);
        EasyController.off(EasyControllerEvent.MOVEMENT_STOP, this.onMovementStop, this);
    }


    update(deltaTime: number) {
        if (this._moveFactor) {
            Vec2.multiplyScalar(tempV2, this._moveDir, this.realSpeed * deltaTime);
            // let pos = this.node.position;
            let direction: Direction = this.findClosestDirection(this._moveDir);
            this.node.getComponent(CharacterFSM).playAnimationForDirection(direction);
            // this.node.setPosition(pos.x + tempV2.x, pos.y + tempV2.y, pos.z);
            this.node.getComponent(GridMovement).CharacterMove(direction);
            log(111)
        }
        else {
            if (!this.node.getComponent(CharacterState).isMoving) {
                this.node.getComponent(CharacterFSM).playAnimationForDirection(Direction.None)
            }
        }
    }

    findClosestDirection(dir: Vec2): Direction {
        let maxDotProduct = -Infinity;
        let closestDirection = Direction.None;

        for (const direction of directions) {
            const dotProduct = dir.dot(direction.vector);
            if (dotProduct > maxDotProduct) {
                maxDotProduct = dotProduct;
                closestDirection = direction.name;
            } else if (dotProduct === maxDotProduct) {
                // 如果点积相同，默认选择 X 轴方向
                if (direction.name === Direction.Right || direction.name === Direction.Left) {
                    closestDirection = direction.name;
                }
            }
        }

        return closestDirection;
    }
}