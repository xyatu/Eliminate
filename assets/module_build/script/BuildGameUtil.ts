import { EventTouch, Label, log, Node, UITransform, v3, Vec2 } from "cc";
import BuildGameConfig from "./data/BuildGameConfig";
import { BuildGame } from "./BuildGame";
import { Layout_MapGrid } from "../ui/map/Layout_MapGrid";
import { GameManager } from "../../start/GameManager";
import { CharacterManager } from "./manager/CharacterManager";
import { CharacterState } from "./character/CharacterState";
import { Coord, Coordinate } from "../../scripts/DataStructure";
import { SlotConfig } from "../../start/SlotConfig";
import BuildMapManager from "./manager/BuildMapManager";

export class Slot {

}

export default class BuildGameUtil {

    public static locationToSprite: { [key: string]: number } = {};

    public static initWallMap() {
        this.locationToSprite['Default'] = 0;
        this.locationToSprite['Full'] = 1;

        this.locationToSprite['U'] = 2;
        this.locationToSprite['D'] = 3;
        this.locationToSprite['L'] = 4;
        this.locationToSprite['R'] = 5;

        this.locationToSprite['LU'] = 6;
        this.locationToSprite['RU'] = 7;
        this.locationToSprite['LD'] = 8;
        this.locationToSprite['RD'] = 9;

    }

    public static nodeIsInsideTargetArea(node: Node, targetArea: Node): boolean {
        const nodeBox = node.getComponent(UITransform).getBoundingBoxToWorld();
        const targetBox = targetArea.getComponent(UITransform).getBoundingBoxToWorld();
        return targetBox.intersects(nodeBox);
    }

    public static pointIsInsideTargetArea(point: Vec2, targetCellPos: Vec2): boolean {
        return point.x >= targetCellPos.x - BuildGameConfig.size / 2 && point.x <= targetCellPos.x + BuildGameConfig.size / 2 &&
            point.y >= targetCellPos.y - BuildGameConfig.size / 2 && point.y <= targetCellPos.y + BuildGameConfig.size / 2
    }

    public static getAllChildren(node: Node): Node[] {
        let children: Node[] = [node]; // 将当前节点加入结果数组

        // 递归获取所有子节点
        node.children.forEach(child => {
            children = children.concat(this.getAllChildren(child));
        });

        return children;
    }

    public static dragShow(event: EventTouch) {
        const delta = event.getDelta();

        let newPos = v3(Layout_MapGrid.inst.node.getPosition().x + delta.x, Layout_MapGrid.inst.node.getPosition().y + delta.y, Layout_MapGrid.inst.node.getPosition().z)

        let minx = BuildMapManager.getPos(0, 0).x - BuildGameConfig.size / 2;
        let miny = BuildMapManager.getPos(0, 0).y - BuildGameConfig.size / 2;
        let maxx = BuildMapManager.getPos(GameManager.inst.playerState.mapCol - 1, GameManager.inst.playerState.mapRow - 1).x + BuildGameConfig.size / 2;
        let maxy = BuildMapManager.getPos(GameManager.inst.playerState.mapCol - 1, GameManager.inst.playerState.mapRow - 1).y + BuildGameConfig.size / 2;

        if (newPos.x <= minx || newPos.x >= maxx || newPos.y <= miny || newPos.y >= maxy) return;


        Layout_MapGrid.inst.node.setPosition(newPos);

        if (event.getTouches().length === 2) {
            const touches = event.getTouches();
            const touch1 = touches[0].getLocation();
            const touch2 = touches[1].getLocation();
            const preTouch1 = touches[0].getPreviousLocation();
            const preTouch2 = touches[1].getPreviousLocation();
            const currentDistance = Vec2.distance(touch1, touch2);
            const preDistance = Vec2.distance(preTouch1, preTouch2);

            if (currentDistance > preDistance) {
                Layout_MapGrid.inst.onChangeScale(true);
            }
            else if (currentDistance < preDistance) {
                Layout_MapGrid.inst.onChangeScale(false);
            }
        }
    }

    public static saveGame() {
        localStorage.setItem(SlotConfig.slot_haveSlot, SlotConfig.slot_hasSlot);
        let role_ps: CharacterState = CharacterManager.inst.player.getComponent(CharacterState);

        this.saveplayerCoord(role_ps.characterCoord);

        this.saveBuilding();

        this.saveHasBuilding();

        this.saveGold();

        this.saveMap();
    }

    public static loadGame() {
        if (localStorage.getItem(SlotConfig.slot_haveSlot) !== SlotConfig.slot_hasSlot) {
            this.createSlot();
        }
    }

    public static createSlot() {
        localStorage.setItem(SlotConfig.slot_haveSlot, SlotConfig.slot_hasSlot);
        localStorage.setItem(SlotConfig.slot_gold, GameManager.inst.playerState.gold.toString());
    }

    public static removeSlot() {
        localStorage.removeItem(SlotConfig.slot_psCoord);
        localStorage.removeItem(SlotConfig.slot_gold);
        localStorage.removeItem(SlotConfig.slot_building);
    }

    public static saveplayerCoord(val: Coordinate) {
        let coord = val.copy();
        GameManager.inst.setPlayerCoord(coord);
        localStorage.setItem(SlotConfig.slot_psCoord, `${coord.x},${coord.y}`);
    }

    public static saveBuilding() {
        let buildingStr: string = '';
        GameManager.inst.playerState.building.forEach(building => {
            let str: string = `${building.id},${building.coord.x},${building.coord.y}`;
            buildingStr += buildingStr !== '' ? `;${str}` : str;
        })

        localStorage.setItem(SlotConfig.slot_building, buildingStr);
    }

    public static saveHasBuilding() {
        let hasBuilding: string = '';

        GameManager.inst.playerState.hasBuilding.forEach(has => {
            hasBuilding += hasBuilding !== '' ? `;${has}` : `${has}`;
        })

        localStorage.setItem(SlotConfig.slot_hasBuilding, hasBuilding);
    }

    public static saveGold() {
        localStorage.setItem(SlotConfig.slot_gold, GameManager.inst.playerState.gold.toString());
    }

    public static saveMap() {
        localStorage.setItem(SlotConfig.slot_row, GameManager.inst.playerState.mapRow.toString());
        localStorage.setItem(SlotConfig.slot_col, GameManager.inst.playerState.mapCol.toString());
    }

    public static loadSlot(){
        return localStorage.getItem(SlotConfig.slot_haveSlot) === SlotConfig.slot_hasSlot;
    }
}