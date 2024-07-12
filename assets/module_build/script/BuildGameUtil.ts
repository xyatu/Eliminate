import { Node, UITransform, Vec2 } from "cc";
import BuildGameConfig from "./data/BuildGameConfig";

export default class BuildGameUtil {
    
    public static locationToSprite: { [key: string]: number } = {};

    public static initWallMap(){
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
}