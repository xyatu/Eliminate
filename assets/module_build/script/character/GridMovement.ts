import { _decorator, Component, Node, tween, v2, v3, Vec3 } from 'cc';
import { CharacterFSM, Direction } from './CharacterFSM';
import { Coord, Coordinate } from '../../../module_eliminate/scripts/game/type/DataStructure';
import { Layout_CharacterManager } from '../manager/CharacterManager/Layout_CharacterManager';
import BuildMapManager from '../manager/BuildMapManager';
import BuildGameConfig from '../data/BuildGameConfig';
import { Layout_MapGrid } from '../../ui/map/Layout_MapGrid';
import { CameraMovement } from '../manager/CameraManager/CameraMovement';
const { ccclass, property } = _decorator;

@ccclass('GridMovement')
export class GridMovement extends Component {

    CharacterMove(direction: Direction) {
        if (!Layout_CharacterManager.isMoving) {
            let target: Coordinate = Layout_CharacterManager.playerCoord.copy();
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

            if (target.x < 0 || target.x >= BuildGameConfig.col || target.y < 0 || target.y >= BuildGameConfig.row) return;

            Layout_CharacterManager.isMoving = true;
            tween(this.node)
                .to(Layout_CharacterManager.moveTime, { position: v3(BuildMapManager.getPos(target).x, BuildMapManager.getPos(target).y, 0) })
                .then(tween().call(() => {
                    Layout_CharacterManager.playerCoord = target.copy();
                    Layout_CharacterManager.isMoving = false;
                    this.node.getComponent(CharacterFSM).playAnimationForDirection(Direction.None);
                }))
                .start();

            CameraMovement.inst.cameraMove(Layout_CharacterManager.moveTime, v2(BuildMapManager.getPos(target).x, BuildMapManager.getPos(target).y));
        }
    }
}


