import { _decorator, Component, Node, Prefab } from 'cc';
import BuildMapManager from './BuildMapManager';
import { BuildingState } from '../building/BuildingState';
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
        if (building) {
            if (this.selectedBuilding) {
                if (building.getComponent(BuildingState).coord) {
                    this.selectedBuilding.getComponent(BuildingState).unSelect();
                }
                else {
                    this.selectedBuilding.destroy();
                }
            }
        }
        this.selectedBuilding = building;
    }
}


