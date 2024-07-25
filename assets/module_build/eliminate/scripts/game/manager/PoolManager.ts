import { _decorator, Component, Prefab, NodePool, Node, instantiate, Tween } from 'cc';
const { ccclass, property } = _decorator;

import Tile from "../component/Tile";

@ccclass('PoolManager')
export default class PoolManager extends Component {
    @property(Prefab)
    private tilePrefab: Prefab | null = null;

    private tilePool: NodePool = new NodePool(Tile);

    private static instance: PoolManager = null;
    
    protected onLoad() {
        PoolManager.instance = this;
    }

   /**
    * 获取节点
    */
    public static get() {
        if (this.instance.tilePool.size() > 0) return this.instance.tilePool.get();
        else return instantiate(this.instance.tilePrefab);
    }

   /**
    * 存入节点
    * @param node 
    */
    public static put(node: Node) {
        Tween.stopAllByTarget(node);
        if (this.instance.tilePool.size() < 30) this.instance.tilePool.put(node);
        else node.destroy();
    }
}
