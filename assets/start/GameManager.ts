// 例如在一个GameManager脚本中处理TouchEnd事件
import { _decorator, Component, Label, log, math, Node } from 'cc';
import { Building, DataGetter, Sound } from './DataGetter';
import { SlotConfig } from './SlotConfig';
import { BuildGame } from '../module_build/script/BuildGame';
import { SoundConfig } from './SoundConfig';
import { tgxAudioMgr } from '../core_tgx/tgx';
import { Coord, Coordinate } from '../scripts/DataStructure';
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

export class SaveBuilding {
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
        this.initMap();
        this.loadMap();
        this.loadBuildSlot();
        this.loadPSCoordSlot();
        this.loadHasBuilding();
        this.loadGold();

        this.ps.building = this.mergeSort(this.ps.building);
    }

    initMap() {
        if (localStorage.getItem(SlotConfig.slot_haveSlot) === SlotConfig.slot_hasSlot) return;

        for (let i = 0; i < this.playerState.mapRow; i++) {
            for (let j = 0; j < this.playerState.mapCol; j++) {
                this.saveBuilding(10002, Coord(i, j));
                if (!((i >= 10 && i <= 14 && j >= 6 && j <= 12) ||
                    (i >= 15 && i <= 18 && j >= 6 && j <= 8) ||
                    (i >= 12 && i <= 14 && j >= 13 && j <= 15) ||
                    (i >= 8 && i <= 9 && j >= 7 && j <= 10) ||
                    (i >= 5 && i <= 7 && j >= 7 && j <= 11))) {
                    this.saveBuilding(20001, Coord(i, j));
                }

                if ((i >= 5 && i <= 5 && j >= 14 && j <= 17) ||
                    (i >= 5 && i <= 9 && j >= 18 && j <= 18) ||
                    (i >= 9 && i <= 9 && j >= 14 && j <= 17) ||
                    (i >= 5 && i <= 9 && j >= 14 && j <= 14)) {
                    this.saveBuilding(40101, Coord(i, j));
                }
            }
        }

        this.saveBuilding(40201, Coord(4, 12));
        this.saveBuilding(40201, Coord(11, 16));

        this.saveBuilding(62301, Coord(4, 19));
        this.saveBuilding(62301, Coord(7, 19));
        this.saveBuilding(62301, Coord(10, 18));
        this.saveBuilding(62301, Coord(14, 18));
        this.saveBuilding(62301, Coord(15, 11));
        this.saveBuilding(62301, Coord(6, 3));
        this.saveBuilding(62301, Coord(7, 1));
        this.saveBuilding(62301, Coord(10, 3));
        this.saveBuilding(62301, Coord(11, 1));
        this.saveBuilding(62301, Coord(13, 3));

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
        let coordStr: string = localStorage.getItem(SlotConfig.slot_psCoord);
        if (coordStr) {
            let info: string[] = coordStr.split(',');
            this.playerState.playerCoord = Coord(parseInt(info[0]), parseInt(info[1]))
        }
        else {
            this.playerState.playerCoord = Coord(Math.ceil(this.playerState.mapRow / 2), Math.ceil(this.playerState.mapCol / 2));
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
        Math.ceil(this.playerState.gold)
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

    playClick() {
        let sound: Sound = DataGetter.inst.sound.get(SoundConfig.click);
        tgxAudioMgr.inst.playOneShot(sound.audio, sound.volumn);
    }

    mergeSort(buildings: SaveBuilding[]): SaveBuilding[] {
        if (buildings.length <= 1) {
            return buildings;
        }
    
        const mid = Math.floor(buildings.length / 2);
        const left = this.mergeSort(buildings.slice(0, mid));
        const right = this.mergeSort(buildings.slice(mid));
    
        return this.merge(left, right);
    }
    
    merge(left: SaveBuilding[], right: SaveBuilding[]): SaveBuilding[] {
        const sortedArray: SaveBuilding[] = [];
        let i = 0, j = 0;
    
        while (i < left.length && j < right.length) {
            if (left[i].id <= right[j].id) {
                sortedArray.push(left[i]);
                i++;
            } else {
                sortedArray.push(right[j]);
                j++;
            }
        }
    
        return sortedArray.concat(left.slice(i)).concat(right.slice(j));
    }
}

