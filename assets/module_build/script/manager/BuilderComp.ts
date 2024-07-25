import { _decorator, Component, Node, Prefab } from 'cc';
import { BuildingState } from '../building/BuildingState';
import BuildingPool from '../../../scripts/BuildingPool';
import { BuildGame, BuildState } from '../BuildGame';
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
        if (!building) {
            BuildGame.BS = BuildState.noSelect;
            this.selectedBuilding = null;
        }
        else {
            if (this.selectedBuilding) {
                this.selectedBuilding.getComponent(BuildingState).unSelect(true);
            }
            this.selectedBuilding = building;
        }
    }
}


