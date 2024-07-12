import { _decorator, Component, log, Sprite, SpriteFrame } from 'cc';
import { Direction } from './CharacterFSM';
import { Layout_CharacterManager } from '../manager/CharacterManager/Layout_CharacterManager';
const { ccclass, property } = _decorator;

@ccclass('Character')
export class AnimationController extends Component {

    @property(Sprite)
    sprite: Sprite = null;

    @property(SpriteFrame)
    moveUp: SpriteFrame[] = [];

    @property(SpriteFrame)
    moveDown: SpriteFrame[] = [];

    @property(SpriteFrame)
    moveLeft: SpriteFrame[] = [];

    @property(SpriteFrame)
    moveRight: SpriteFrame[] = [];

    // Animation Controller Property
    currentAnim: SpriteFrame[] = [];

    animRate: number = 7;

    currentFrame: number = 0;

    timeTick: number = 0;

    playAnimationForDirection(direction: Direction) {
        switch (direction) {
            case Direction.Up:
                log(`上`)
                this.currentAnim = this.moveUp;
                break;
            case Direction.Down:
                log(`下`)
                this.currentAnim = this.moveDown;
                break;
            case Direction.Left:
                log(`左`)
                this.currentAnim = this.moveLeft;
                break;
            case Direction.Right:
                log(`右`)
                this.currentAnim = this.moveRight;
                break;
            default:
                log(`未移动`)
                if (this.currentAnim && this.currentAnim.length > 0) {
                    this.sprite.spriteFrame = this.currentAnim[0];
                }
                else {
                    this.sprite.spriteFrame = this.moveDown[0];
                }
                break;
        }
    }

    protected update(dt: number): void {
        if (this.currentAnim && this.currentAnim.length > 0 && Layout_CharacterManager.isMoving) {
        // if (this.currentAnim && this.currentAnim.length > 0) {
            this.timeTick += dt;
            if (this.timeTick >= 1 / this.animRate) {
                this.timeTick -= 1 / this.animRate;
                this.sprite.spriteFrame = this.currentAnim[this.currentFrame++];
                if (this.currentFrame >= this.currentAnim.length-1) {
                    this.currentFrame = 0;
                }
            }
        }
    }
}


