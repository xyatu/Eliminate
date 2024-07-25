import { _decorator, Component, Node, tween, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HoriEffComp')
export class HoriEffComp extends Component {

    timeTick: number = 0;

    protected start(): void {
        this.node.setScale(0, 1, 1);
    }

    protected update(dt: number): void {
        this.timeTick += dt;
        if (this.timeTick > 0.2) this.node.destroy();
        let scale: Vec3 = this.node.scale.clone();
        this.node.setScale(scale.x + 50 * dt, scale.y, scale.z);
    }
}


