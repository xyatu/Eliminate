import { _decorator, Component, Node, Prefab } from 'cc';
import { BuildingState } from '../building/BuildingState';
import BuildingPool from '../../../scripts/BuildingPool';
const { ccclass, property } = _decorator;

@ccclass('BuilderComp')
export class BuilderComp extends Component {

    public static inst: BuilderComp = null;

    selectedBuilding: Node = null;

    @property(Prefab)
    building: Prefab = null;

    protected onLoad(): void {
        BuilderComp.inst = this;
    }

    setSelect(building: Node) {
        let old = this.selectedBuilding;

        this.selectedBuilding = building;
        if (old) {
            let oldBs = old.getComponent(BuildingState);
            if (oldBs.coord) {
                oldBs.unSelect();
            }
            else {
                BuildingPool.put(old);
            }
        }
    }
}


