import { instantiate, log, math, Node, NodeEventType, size, sp, Sprite, SpriteFrame, UITransform, v3, Vec3 } from "cc";
import { Layout_Building } from "./Layout_Building";
import { Layout_MapGrid } from "../map/Layout_MapGrid";
import { Coord, Coordinate } from "../../../module_eliminate/scripts/game/type/DataStructure";
import BuildMapManager from "../../script/manager/BuildMapManager";
import BuildGameConfig from "../../script/data/BuildGameConfig";
import { tgxUIAlert } from "../../../core_tgx/tgx";
import { UI_Building } from "./UI_Building";
import BuildGameUtil from "../../script/BuildGameUtil";

const directions = [
    { dx: 0, dy: 1 },  // 上
    { dx: 0, dy: -1 },   // 下
    { dx: -1, dy: 0 },  // 左
    { dx: 1, dy: 0 },   // 右
];

const visited = new Set<string>();

export class Builder {

    newCoord: Coordinate = new Coordinate();

    createDrag(layout: Layout_Building, spriteFrame: SpriteFrame, i: boolean): Node {
        layout.buildingDrag = instantiate(layout.buildingShow);
        let sprite = layout.buildingDrag.getComponent(Sprite);
        sprite.spriteFrame = spriteFrame;
        sprite.color = layout.node.getComponent(Sprite).color;
        if (i) this.setBuildingScale(layout, layout.buildingDrag, sprite);
        layout.buildingDrag.setPosition(v3(0));
        return layout.buildingDrag;
    }

    buildBuilding(layout: Layout_Building, ui: UI_Building): boolean {
        let building = instantiate(layout.building);

        let sprite = building.getChildByName('Sprite').getComponent(Sprite);
        sprite.spriteFrame = layout.sprite;
        sprite.color = layout.node.getComponent(Sprite).color;
        this.setBuildingScale(layout, building, sprite);

        // building.getComponent(UITransform).setContentSize(size(layout.shapeArray.reduce((previous, current) => {
        //     return previous.length > current.length ? previous : current;
        // }).length * BuildGameConfig.size, layout.shapeArray.length * BuildGameConfig.size));

        this.BuildingBindEvent(building, ui);

        return layout.builder.build(layout, building, layout.buildingDrag.getWorldPosition());
    }

    BuildingBindEvent(building: Node, ui: UI_Building) {
        building.on(NodeEventType.TOUCH_START, ui.buildingTouchStart, ui);
        building.on(NodeEventType.TOUCH_MOVE, ui.buildingTouchMove, ui);
        building.on(NodeEventType.TOUCH_END, ui.buildingTouchEnd, ui);
        building.on(NodeEventType.TOUCH_CANCEL, ui.buildingTouchCancel, ui);
    }

    buildCheckVoid(layout, coord) {
        for (let i = 0; i < layout.shapeArray.length; i++) {
            for (let j = 0; j < layout.shapeArray[i].length; j++) {
                if (layout.shapeArray[i][j] !== 0) {
                    try {
                        if (!BuildMapManager.checkVoid(layout.buildingType, coord.x + j, coord.y + i)) {
                            return false;
                        }
                    } catch (error) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    build(layout: Layout_Building, building: Node, pos: Vec3): boolean {
        Layout_MapGrid.inst.node.addChild(building);
        building.setPosition(building.parent.getComponent(UITransform).convertToNodeSpaceAR(pos));

        let coord: Coordinate = BuildMapManager.getCoord(building.position.x + BuildGameConfig.size / 2, building.position.y + BuildGameConfig.size / 2);

        if (this.buildCheckVoid(layout, coord)) {
            building.setPosition(BuildMapManager.getPos(coord).x - BuildGameConfig.size / 2, BuildMapManager.getPos(coord).y - BuildGameConfig.size / 2, 0);
            BuildMapManager.place(coord.copy(), layout.buildingType, layout.shapeArray, building);
            let maxDepth = 300;
            this.newCoord = coord.copy();
            visited.clear();
            this.changeWall(layout, coord, layout.buildingType, 0, maxDepth, true);
            visited.clear();
            this.changeWall(layout, coord, layout.buildingType, 0, maxDepth, true);
            return true;
        } else {
            building.destroy();
            tgxUIAlert.show('格子已被占用或未完全在格内', false).setTitle('放置错误');
            return false;
        }
    }

    changeWall(layout: Layout_Building, coord: Coordinate, type: number, depth: number, maxDepth: number, doRecursion: boolean) {

        if (doRecursion) {
            // 检查递归深度是否超过最大深度
            if (depth > maxDepth) {
                return;
            }

            // 生成唯一的键用于标记节点
            const key = `${coord.x},${coord.y}`;
            if (visited.has(key)) {
                return;
            }
            visited.add(key);
        }


        let direction: { dir: number, node: Node, coord: Coordinate }[] = [
            { dir: 0, node: null, coord: null },
            { dir: 1, node: null, coord: null },
            { dir: 1, node: null, coord: null },
            { dir: 1, node: null, coord: null },
        ]
        for (let index = 0; index < directions.length; index++) {
            const newX = coord.x + directions[index].dx;
            const newY = coord.y + directions[index].dy;
            let node = null;
            if (newX < BuildGameConfig.row && newX >= 0 && newY < BuildGameConfig.col && newY >= 0 &&
                BuildMapManager.dataMapDit[type][newY][newX] == BuildMapManager.dataMapDit[type][coord.y][coord.x]) {
                direction[index].node = Coord(newX, newY).getNode(type);
                direction[index].coord = Coord(newX, newY);
            }
        }

        // 记录有节点的方向
        let up = direction[0].node !== null;
        let down = direction[1].node !== null;
        let left = direction[2].node !== null;
        let right = direction[3].node !== null;

        // 输出所有可能的组合
        if (up && down && left && right) {
            console.log('updownleftright');
            coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
            coord.getNode(type).name = 'D';
        }
        else if (up && down && left) {
            console.log('updownleft');
            coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
            coord.getNode(type).name = 'D';
        }
        else if (up && down && right) {
            console.log('updownright');
            coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
            coord.getNode(type).name = 'D';
        }
        else if (up && left && right) {
            console.log('upleftright');
            coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
            coord.getNode(type).name = 'D';
        }
        else if (down && left && right) {
            console.log('downleftright');
            coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
            coord.getNode(type).name = 'D';
        }
        else if (up && left) {
            console.log('upleft');
            if (!direction[2].coord.compare(this.newCoord)) {
                if (direction[2].node.name.includes('D')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['BLU']];
                    coord.getNode(type).name = 'RD';
                }
                else if (direction[2].node.name.includes('U')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['SLU']];
                    coord.getNode(type).name = 'LU';
                }
                else {
                    if (direction[0].node.name.includes('R')) {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['BLU']];
                        coord.getNode(type).name = 'RD';
                    }
                    else if (direction[0].node.name.includes('L')) {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['SLU']];
                        coord.getNode(type).name = 'LU';
                    }
                    else {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                        coord.getNode(type).name = 'D';
                    }
                }
            }
            else if (!direction[0].coord.compare(this.newCoord)) {
                if (direction[0].node.name.includes('R')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['BLU']];
                    coord.getNode(type).name = 'RD';
                }
                else if (direction[0].node.name.includes('L')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['SLU']];
                    coord.getNode(type).name = 'LU';
                }
                else {
                    if (direction[2].node.name.includes('D')) {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['BLU']];
                        coord.getNode(type).name = 'RD';
                    }
                    else if (direction[2].node.name.includes('U')) {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['SLU']];
                        coord.getNode(type).name = 'LU';
                    }
                    else {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                        coord.getNode(type).name = 'D';
                    }
                }
            }
        }
        else if (up && right) {
            console.log('upright');
            if (!direction[3].coord.compare(this.newCoord)) {
                if (direction[3].node.name.includes('U')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['SRU']];
                    coord.getNode(type).name = 'RU';
                }
                else if (direction[3].node.name.includes('D')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['BRU']];
                    coord.getNode(type).name = 'LD';
                }
                else {
                    if (direction[0].node.name.includes('L')) {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['BRU']];
                        coord.getNode(type).name = 'LD';
                    }
                    else if (direction[0].node.name.includes('R')) {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['SRU']];
                        coord.getNode(type).name = 'RU';
                    }
                    else {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                        coord.getNode(type).name = 'D';
                    }
                }
            }
            else if (!direction[0].coord.compare(this.newCoord)) {
                if (direction[0].node.name.includes('L')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['BRU']];
                    coord.getNode(type).name = 'LD';
                }
                else if (direction[0].node.name.includes('R')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['SRU']];
                    coord.getNode(type).name = 'RU';
                }
                else {
                    if (direction[3].node.name.includes('U')) {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['SRU']];
                        coord.getNode(type).name = 'RU';
                    }
                    else if (direction[3].node.name.includes('D')) {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['BRU']];
                        coord.getNode(type).name = 'LD';
                    }
                    else {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                        coord.getNode(type).name = 'D';
                    }
                }
            }
        }
        else if (down && left) {
            console.log('downleft');
            if (!direction[2].coord.compare(this.newCoord)) {
                if (direction[2].node.name.includes('U')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['BLD']];
                    coord.getNode(type).name = 'RU';
                }
                else if (direction[2].node.name.includes('D')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['SLD']];
                    coord.getNode(type).name = 'LD';
                }
                else {
                    if (direction[1].node.name.includes('R')) {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['BLD']];
                        coord.getNode(type).name = 'RU';
                    }
                    else if (direction[1].node.name.includes('L')) {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['SLD']];
                        coord.getNode(type).name = 'LD';
                    }
                    else {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                        coord.getNode(type).name = 'D';
                    }
                }
            }
            else if (!direction[1].coord.compare(this.newCoord)) {
                if (direction[1].node.name.includes('R')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['BLD']];
                    coord.getNode(type).name = 'RU';
                }
                else if (direction[1].node.name.includes('L')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['SLD']];
                    coord.getNode(type).name = 'LD';
                }
                else {
                    if (direction[2].node.name.includes('U')) {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['BLD']];
                        coord.getNode(type).name = 'RU';
                    }
                    else if (direction[2].node.name.includes('D')) {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['SLD']];
                        coord.getNode(type).name = 'LD';
                    }
                    else {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                        coord.getNode(type).name = 'D';
                    }
                }
            }
        }
        else if (down && right) {
            console.log('downright');
            if (!direction[3].coord.compare(this.newCoord)) {
                if (direction[3].node.name.includes('U')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['BRD']];
                    coord.getNode(type).name = 'LU';
                }
                else if (direction[3].node.name.includes('D')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['SRD']];
                    coord.getNode(type).name = 'RD';
                }
                else {
                    if (direction[1].node.name.includes('L')) {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['BRD']];
                        coord.getNode(type).name = 'LU';
                    }
                    else if (direction[1].node.name.includes('R')) {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['SRD']];
                        coord.getNode(type).name = 'RD';
                    }
                    else {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                        coord.getNode(type).name = 'D';
                    }
                }
            }
            else if (!direction[1].coord.compare(this.newCoord)) {
                if (direction[1].node.name.includes('L')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['BRD']];
                    coord.getNode(type).name = 'LU';
                }
                else if (direction[1].node.name.includes('R')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['SRD']];
                    coord.getNode(type).name = 'RD';
                }
                else {
                    if (direction[3].node.name.includes('U')) {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['BRD']];
                        coord.getNode(type).name = 'LU';
                    }
                    else if (direction[3].node.name.includes('D')) {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['SRD']];
                        coord.getNode(type).name = 'RD';
                    }
                    else {
                        coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                        coord.getNode(type).name = 'D';
                    }
                }
            }
        }


        else if (up && down) {
            console.log('updown');
            if (direction[0].coord.compare(this.newCoord)) {
                if (direction[0].node.name.includes('L')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['L']];
                    coord.getNode(type).name = 'L';
                }
                else if (direction[0].node.name.includes('R')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['R']];
                    coord.getNode(type).name = 'R';
                }
                else {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['L']];
                    coord.getNode(type).name = 'L';
                }
            }
            else if (direction[1].coord.compare(this.newCoord)) {
                if (direction[1].node.name.includes('L')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['L']];
                    coord.getNode(type).name = 'L';
                }
                else if (direction[1].node.name.includes('R')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['R']];
                    coord.getNode(type).name = 'R';
                }
                else {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['L']];
                    coord.getNode(type).name = 'L';
                }
            }
            else {
                if (direction[0].node.name.includes('L')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['L']];
                    coord.getNode(type).name = 'L';
                }
                else if (direction[0].node.name.includes('R')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['R']];
                    coord.getNode(type).name = 'R';
                }
                else {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['L']];
                    coord.getNode(type).name = 'L';
                }

            }
        }
        else if (left && right) {
            console.log('leftright');
            if (direction[2].node.name.includes('U') || direction[2].node.name.includes('D')) {
                if (direction[2].node.name.includes('U')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['U']];
                    coord.getNode(type).name = 'U';
                }
                else if (direction[2].node.name.includes('D')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                    coord.getNode(type).name = 'D';
                }
                else {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                    coord.getNode(type).name = 'D';
                }
            }
            else if (direction[3].node.name.includes('U') || direction[3].node.name.includes('D')) {
                if (direction[3].node.name.includes('U')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['U']];
                    coord.getNode(type).name = 'U';
                }
                else if (direction[3].node.name.includes('D')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                    coord.getNode(type).name = 'D';
                }
                else {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                    coord.getNode(type).name = 'D';
                }
            }
            else {
                coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                coord.getNode(type).name = 'D';
            }
        }
        else if (up && !down) {
            console.log('up');
            if (direction[0].node) {
                if (direction[0].node.name.includes('L')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['LDE']];
                    coord.getNode(type).name = 'L';
                }
                else if (direction[0].node.name.includes('R')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['RDE']];
                    coord.getNode(type).name = 'R';
                }
                else if (direction[0].node.name.includes('LD') || direction[0].node.name.includes('RU')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['RDE']];
                    coord.getNode(type).name = 'R';
                }
                else if (direction[0].node.name.includes('RD') || direction[0].node.name.includes('LU')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['LDE']];
                    coord.getNode(type).name = 'L';
                }
                else {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                    coord.getNode(type).name = 'D';
                }
            }
        }
        else if (down && !up) {
            console.log('down');
            if (direction[1].node) {
                if (direction[1].node.name.includes('L')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['LUE']];
                    coord.getNode(type).name = 'L';
                }
                else if (direction[1].node.name.includes('R')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['RUE']];
                    coord.getNode(type).name = 'R';
                }
                else if (direction[1].node.name.includes('RD') || direction[1].node.name.includes('RU')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['RDE']];
                    coord.getNode(type).name = 'R';
                }
                else if (direction[1].node.name.includes('LD') || direction[1].node.name.includes('LU')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['LDE']];
                    coord.getNode(type).name = 'L';
                }
                else {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['LUE']];
                    coord.getNode(type).name = 'L';
                }
            } else {
                coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['LUE']];
                coord.getNode(type).name = 'L';
            }
        }
        else if (left) {
            console.log('left');
            if (direction[2].node) {
                if (direction[2].node.name.includes('U')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['U']];
                    coord.getNode(type).name = 'U';
                }
                else if (direction[2].node.name.includes('D')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                    coord.getNode(type).name = 'D';
                }
                else if (direction[2].node.name.includes('R')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                    coord.getNode(type).name = 'D';
                }
                else if (direction[2].node.name.includes('L')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['U']];
                    coord.getNode(type).name = 'U';
                }
                else {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                    coord.getNode(type).name = 'D';
                }
            } else {
                coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                coord.getNode(type).name = 'D';
            }
        }
        else if (right) {
            console.log('right');
            if (direction[3].node) {
                if (direction[3].node.name.includes('U')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['U']];
                    coord.getNode(type).name = 'U';
                } else if (direction[3].node.name.includes('D')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                    coord.getNode(type).name = 'D';
                } else if (direction[3].node.name.includes('L')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['U']];
                    coord.getNode(type).name = 'U';
                } else if (direction[3].node.name.includes('R')) {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['U']];
                    coord.getNode(type).name = 'U';
                }
                else {
                    coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                    coord.getNode(type).name = 'D';
                }
            }
            else {
                coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
                coord.getNode(type).name = 'D';
            }
        }
        else {
            console.log('没有节点');
            coord.getNode(type).getChildByName('Sprite').getComponent(Sprite).spriteFrame = layout.spriteAtlas.getSpriteFrames()[BuildGameUtil.locationToSprite['D']];
            coord.getNode(type).name = 'D';
        }

        if (doRecursion) {
            // 对每个方向调用同样的 changeWall 方法进行递归处理，深度+1
            direction.forEach(dir => {
                if (dir.node !== null) {
                    if (dir.coord !== null) {
                        this.changeWall(layout, dir.coord, layout.buildingType, depth + 1, maxDepth, doRecursion);
                    }
                }
            });
        }
    }

    setBuildingScale(layout: Layout_Building, node: Node, sprite: Sprite) {
        node.setScale(v3(1, 1, 1))
        node.setScale(v3(layout.size.x / sprite.spriteFrame.originalSize.x,
            layout.size.y / sprite.spriteFrame.originalSize.y, 1))
    }
}