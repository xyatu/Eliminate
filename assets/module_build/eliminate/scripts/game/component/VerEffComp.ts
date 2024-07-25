import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('VerEffComp')
export class VerEffComp extends Component {
    timeTick: number = 0;

    protected start(): void {
        this.node.setScale(1, 0, 1);
    }

    protected update(dt: number): void {
        this.timeTick += dt;
        if (this.timeTick > 0.2) this.node.destroy();
        let scale: Vec3 = this.node.scale.clone();
        this.node.setScale(scale.x, scale.y + 80 * dt, scale.z);
    }
}


