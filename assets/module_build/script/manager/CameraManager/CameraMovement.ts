import { _decorator, Component, Vec3, tween, log, Vec2, v3, math, Layout, size, UITransform, view } from 'cc';
import BuildMapManager from '../BuildMapManager';
import BuildGameConfig from '../../data/BuildGameConfig';
const { ccclass, property } = _decorator;

@ccclass('CameraMovement')
export class CameraMovement extends Component {
    public static inst: CameraMovement = null;

    protected onLoad(): void {
        CameraMovement.inst = this;
    }

    cameraMove(moveTime: number, pos: Vec2) {
        let minx = BuildMapManager.getPos(0, 0).x - BuildGameConfig.size / 2;
        let miny = BuildMapManager.getPos(0, 0).y - BuildGameConfig.size / 2;
        let maxx = BuildMapManager.getPos(BuildGameConfig.col - 1, BuildGameConfig.row - 1).x + BuildGameConfig.size / 2;
        let maxy = BuildMapManager.getPos(BuildGameConfig.col - 1, BuildGameConfig.row - 1).y + BuildGameConfig.size / 2;

        let cameraW = this.node.getComponent(UITransform).contentSize.width * view.getScaleX();
        let cameraH = this.node.getComponent(UITransform).contentSize.height * view.getScaleY();

        let cameraminx = minx + cameraW / 2;
        let cameraminy = miny + cameraH / 2;
        let cameramaxx = maxx - cameraW / 2;
        let cameramaxy = maxy - cameraH / 2;

        log(`pos: ${pos}, minx: ${cameraminx}, miny: ${cameraminy}, maxx: ${cameramaxx}, maxy: ${cameramaxy}, judge: ${pos.x <= cameraminx || pos.x >= cameramaxx || pos.y <= cameraminy || pos.y >= cameramaxy}`)

        if (pos.x <= cameraminx || pos.x >= cameramaxx) {
            tween(this.node)
                .to(moveTime, { position: v3(this.node.position.x, pos.y, this.node.position.z) })
                .start();
        }
        else if (pos.y <= cameraminy || pos.y >= cameramaxy) {
            tween(this.node)
                .to(moveTime, { position: v3(pos.x, this.node.position.y, this.node.position.z) })
                .start();
        } else {
            tween(this.node)
                .to(moveTime, { position: v3(pos.x, pos.y, this.node.position.z) })
                .start();
        }
    }
}