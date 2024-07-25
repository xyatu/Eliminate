import { _decorator, Component, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Layout_Over')
export class Layout_Over extends Component {

    @property(Node)
    scoreBox: Node = null;

    @property(Prefab)
    scorePrefab: Prefab = null;
}


