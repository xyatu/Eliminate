import { _decorator, Component, Animation, sp, Sprite, animation, log } from 'cc';
import { AnimationController } from './AnimationController';
import { Layout_CharacterManager } from '../manager/CharacterManager/Layout_CharacterManager';
const { ccclass, property } = _decorator;

export enum Direction {
    None,
    Up,
    Down,
    Left,
    Right,
}

@ccclass('CharacterFSM')
export class CharacterFSM extends Component {

    private currentDirection: Direction = Direction.None;

    changeDirection(direction: Direction) {
        if (direction !== this.currentDirection) {
            this.currentDirection = direction;
            this.playAnimationForDirection(direction);
        }
    }

    playAnimationForDirection(direction: Direction) {
        if (Layout_CharacterManager.isMoving) return;
        let animation: AnimationController = this.node.getComponent(AnimationController);
        switch (direction) {
            case Direction.Up:
                break;
            case Direction.Down:
                break;
            case Direction.Left:
                break;
            case Direction.Right:
                break;
            default:
                break;
        }
        animation.playAnimationForDirection(direction);
    }

    protected start(): void {
        this.playAnimationForDirection(Direction.None);
    }
}
