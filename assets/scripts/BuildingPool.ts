import { _decorator, Node, NodePool } from 'cc';
export default class BuildingPool {

    private buildingPool: NodePool = null;
    private capacity: number = 3000;

    private static inst: BuildingPool = null;

    constructor() {
        BuildingPool.inst = this;
        this.buildingPool = new NodePool();
    }

    /**
     * 获取节点
     */
    public static get() {
        return this.inst.buildingPool.get();
    }

    /**
     * 存入节点
     * @param node 
     */
    public static put(node: Node) {
        if (BuildingPool.inst.buildingPool.size() > BuildingPool.inst.capacity) return;
        this.inst.buildingPool.put(node);
    }
}