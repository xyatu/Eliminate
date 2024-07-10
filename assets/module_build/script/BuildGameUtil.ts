import { Node, UITransform, Vec2 } from "cc";
import BuildGameConfig from "./data/BuildGameConfig";

export default class BuildGameUtil {
    
    public static locationToSprite: { [key: string]: number } = {};

    public static initWallMap(){
        this.locationToSprite['D'] = 1;
        this.locationToSprite['R'] = 11;
        this.locationToSprite['RUE'] = 15;
        this.locationToSprite['RDE'] = 26;
        this.locationToSprite['L'] = 13;
        this.locationToSprite['LUE'] = 14;
        this.locationToSprite['LDE'] = 25;
        this.locationToSprite['U'] = 23;


        this.locationToSprite['SLU'] = 24;
        this.locationToSprite['BLU'] = 21;

        this.locationToSprite['SLD'] = 2;
        this.locationToSprite['BLD'] = 10;

        this.locationToSprite['SRD'] = 0;
        this.locationToSprite['BRD'] = 9;

        this.locationToSprite['SRU'] = 22;
        this.locationToSprite['BRU'] = 20;
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
}