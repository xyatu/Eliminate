import { _decorator, Component, log, Node, SpriteFrame } from 'cc';
import { FrameAnimation } from '../manager/FrameAnimation';
import { Direction } from './CharacterFSM';
import { CharacterState } from './CharacterState';
import { Anim } from '../../../start/DataGetter';
const { ccclass, property } = _decorator;

@ccclass('RoleAnim')
export class RoleAnim extends FrameAnimation {

    oldDir: Direction;
    oldAnimName: string = '';

    isRotateIdle: boolean = true;

    protected runAtStart: boolean = true;

    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    playAnimForDire(direction: Direction) {
        if (this.oldDir === direction) return;
        let animname: string = '';
        this.isRotateIdle = false;
        switch (direction) {
            case Direction.Up:
                animname = 'moveu'
                break;
            case Direction.Down:
                animname = 'moved'
                break;
            case Direction.Left:
                animname = 'movel'
                break;
            case Direction.Right:
                animname = 'mover'
                break;
            default:
                if (this.oldAnimName === '' || this.node.getComponent(CharacterState).role.anim.find(anim => anim.animname === 'idle').anim.anim.length > 1) {
                    animname = 'idle';
                } else {
                    animname = this.oldAnimName;
                    this.isRotateIdle = true;
                }
                break;
        }
        this.oldAnimName = animname;
        let anim: Anim = this.node.getComponent(CharacterState).role.anim.find(anim => anim.animname === animname).anim;
        let willUseAnim: SpriteFrame[] = [];
        if (this.isRotateIdle) {
            willUseAnim.push(anim.anim[0])
        } else {
            willUseAnim = [...anim.anim];
        }
        this.spriteFrame = willUseAnim;
        this.frameCount = willUseAnim.length;
        this.rate = anim.rate;
        this.loop = anim.isLoop;
        this.oldDir = direction;
    }
}


