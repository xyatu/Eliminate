import { _decorator, Collider2D, Component, Contact2DType, director, game, IPhysics2DContact, Node, PhysicsSystem2D } from 'cc';
import { Coordinate } from '../../../module_eliminate/scripts/game/type/DataStructure';
import { Role } from '../../../start/DataGetter';
const { ccclass, property } = _decorator;

@ccclass('CharacterController')
export class CharacterState extends Component {

    public isPlayer: boolean = false;

    public characterCoord: Coordinate = null;

    public isMoving: boolean = false;

    public moveTime: number = 0.5;

    public role: Role = null;
}


