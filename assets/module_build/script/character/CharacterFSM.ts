import { _decorator, Component, Animation, sp, Sprite, animation, log } from 'cc';
import { CharacterState } from './CharacterState';
import { RoleAnim } from './RoleAnim';
const { ccclass, property } = _decorator;

export enum Direction {
    Up,
    Down,
    Left,
    Right,
    None,
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
        if (this.node.getComponent(CharacterState).isMoving) return;
        let animation: RoleAnim = this.node.getComponent(RoleAnim);
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
        animation.playAnimForDire(direction);
    }

    protected start(): void {
        this.playAnimationForDirection(Direction.None);
    }
}
