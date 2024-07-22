// 例如在一个GameManager脚本中处理TouchEnd事件
import { _decorator, Component, Label, log, Node } from 'cc';
import { Coord, Coordinate } from '../module_eliminate/scripts/game/type/DataStructure';
import { Building } from './DataGetter';
import { SlotConfig } from './SlotConfig';
import { BuildGame } from '../module_build/script/BuildGame';
const { ccclass, property } = _decorator;

export class PlayerState {
    playerCoord: Coordinate = null;
    hasBuilding: number[] = [];
    gold: number = 0;
    mapCol: number = 22;
    mapRow: number = 22;
    prosperous: number = 0;
    building: SaveBuilding[] = [];
}

class SaveBuilding {
    id: number = 0;
    coord: Coordinate = null;

    constructor(id: number, coord: Coordinate) {
        this.id = id;
        this.coord = coord.copy();
    }
}

@ccclass('GameManager')
export class GameManager extends Component {
    public static inst: GameManager = null;

    private ps: PlayerState = new PlayerState();

    get playerState() {
        return this.ps;
    }

    protected onLoad(): void {
        GameManager.inst = this;
    }

    start() {
        this.loadGame();
    }

    loadGame() {
        this.loadMap();
        this.loadBuildSlot();
        this.loadPSCoordSlot();
        this.loadHasBuilding();
        this.loadGold();
    }

    loadMap() {
        if (localStorage.getItem(SlotConfig.slot_row) === SlotConfig.slot_noSlot) return;

        let row: number = parseInt(localStorage.getItem(SlotConfig.slot_row));
        let col: number = parseInt(localStorage.getItem(SlotConfig.slot_col));

        if (row) this.ps.mapRow = row;
        if (col) this.ps.mapCol = col;
    }

    loadBuildSlot() {
        try {
            let buildingStr: string = localStorage.getItem(SlotConfig.slot_building);
            if (!buildingStr) return;
            buildingStr.split(';').forEach(str => {
                let info: string[] = str.split(',');
                this.playerState.building.push(
                    new SaveBuilding(
                        parseInt(info[0]),
                        Coord(parseInt(info[1]), parseInt(info[2]))
                    )
                )
            })
        } catch (error) {

        }
    }

    loadPSCoordSlot() {
        try {
            let coordStr: string = localStorage.getItem(SlotConfig.slot_psCoord);
            let info: string[] = coordStr.split(',');
            this.playerState.playerCoord = Coord(parseInt(info[0]), parseInt(info[1]))
        } catch (error) {

        }
    }

    loadHasBuilding() {
        try {
            let hasBuildingStr: string = localStorage.getItem(SlotConfig.slot_hasBuilding);
            let info: string[] = hasBuildingStr.split(',');
            info.forEach(val => {
                this.playerState.hasBuilding.push(parseInt(val));
            })
        } catch (error) {

        }
    }

    loadGold() {
        try {
            let goldgStr: string = localStorage.getItem(SlotConfig.slot_gold);
            if (goldgStr) {
                this.playerState.gold = parseInt(goldgStr);
            }
        } catch (error) {

        }
    }

    onGoldChange(changeval: number) {
        this.playerState.gold += changeval;
    }

    changeMap(data: Building, coord: Coordinate, isBuild: boolean) {
        if (isBuild) {
            this.build(data, coord);
        }
        else {
            this.remove(data, coord);
        }
    }

    build(data: Building, coord: Coordinate) {
        this.saveBuilding(data.id, coord);
        this.onProsperousChange(data.proserity);
    }

    remove(data: Building, coord: Coordinate) {
        let index = this.playerState.building.findIndex(building => {
            return building.id === data.id && coord.compare(building.coord);
        })

        this.playerState.building.splice(index, 1);

        this.onProsperousChange(-data.proserity);
    }

    saveBuilding(id: number, coord: Coordinate) {
        this.playerState.building.push(new SaveBuilding(id, coord));
    }

    onProsperousChange(changeVal: number) {
        this.playerState.prosperous += changeVal;
    }

    setPlayerCoord(coord: Coordinate) {
        this.playerState.playerCoord = coord.copy();
    }

    onRowChange(changval: number) {
        this.ps.mapRow += changval;
    }

    onColChange(changval: number) {
        this.ps.mapCol += changval;
    }
}
