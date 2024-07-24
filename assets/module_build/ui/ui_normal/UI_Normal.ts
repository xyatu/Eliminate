import { _decorator, AssetManager, assetManager, Component, director, instantiate, log, math, Node, profiler, Sprite, v3, Vec3 } from 'cc';
import { tgxModuleContext, tgxUIAlert, tgxUIController, tgxUIEditAlert, tgxUIMgr } from '../../../core_tgx/tgx';
import { UILayers } from '../../../core_tgx/easy_ui_framework/UILayers';
import { Layout_Normal } from './Layout_Normal';
import { SceneDef } from '../../../scripts/SceneDef';
import { ModuleDef } from '../../../scripts/ModuleDef';
import { Coord, Coordinate } from '../../../scripts/DataStructure';
import BuildGameConfig from '../../script/data/BuildGameConfig';
import { Layout_BuildFrame } from '../ui_buildFrame/Layout_BuildFrame';
import { CharacterManager } from '../../script/manager/CharacterManager';
import { CharacterState } from '../../script/character/CharacterState';
import { GameManager } from '../../../start/GameManager';
import { BuildGame } from '../../script/BuildGame';
import BuildGameUtil from '../../script/BuildGameUtil';
import { SlotConfig } from '../../../start/SlotConfig';
import { Layout_MapGrid } from '../map/Layout_MapGrid';
import { DataGetter } from '../../../start/DataGetter';
import { UI_BuildFrame, UI_Normal } from '../../../scripts/UIDef';
import BuildMapManager from '../../script/manager/BuildMapManager';
const { ccclass, property } = _decorator;

@ccclass('UI_Normal')
export class UI_Normal_Impl extends UI_Normal {
    constructor() {
        super('ui/ui_normal/UI_Normal', UILayers.HUD, Layout_Normal);
    }

    public getRes(): [] {
        return [];
    }

    protected onCreated(): void {
        let layout = this.layout as Layout_Normal;
        // profiler.hideStats();
        this.onButtonEvent(layout.build, () => {
            GameManager.inst.playClick();
            if (Layout_BuildFrame.inst) {
                Layout_BuildFrame.inst.show();
            }
            else {
                tgxUIMgr.inst.showUI(UI_BuildFrame);
            }
            // Layout_MapGrid.inst.node.getChildByName(BuildGameConfig.characterType.toString()).active = false;
            this.removeNPC();
            this.node.active = false;
            BuildGame.inst.isBuild = true;
            Layout_MapGrid.inst.node.getChildByName('grid').active = true;
        })

        this.onButtonEvent(layout.eliminate, () => {
            GameManager.inst.playClick();
            assetManager.loadBundle(ModuleDef.GAME_ELIMINATE, (err, bundle: AssetManager.Bundle) => {
                if (bundle) {
                    director.loadScene(SceneDef.ELIMINATE_GAME, () => {
                        tgxUIMgr.inst.hideAll();
                    });
                }
            });
        })

        this.onButtonEvent('Create/CreatePlayer', () => {
            // this.showEditAlert('请输入玩家目标坐标', true);
            CharacterManager.createCharacter(true, Coord(Math.floor(GameManager.inst.playerState.mapCol / 2), Math.floor(GameManager.inst.playerState.mapRow / 2)));
        })

        this.onButtonEvent('Create/CreateNPC', () => {
            // this.showEditAlert('请输入NPC目标坐标', false);
            CharacterManager.createCharacter(false, Coord(Math.floor(GameManager.inst.playerState.mapCol / 2), Math.floor(GameManager.inst.playerState.mapRow / 2)));
        })

        this.onButtonEvent('RemoveSlot', () => {
            tgxUIAlert.show('确定删档吗', true).onClick(isOK => {
                BuildGameUtil.removeSlot();
            })
        })

        this.onButtonEvent('ShowSlot', () => {
            // log(localStorage.getItem(SlotConfig.slot_hasBuilding));
            log(GameManager.inst.playerState.prosperous);
        })

        layout.cbOnGoldChange = this.onGoldChange;
    }

    onGoldChange(gold: number) {
        let self = this as unknown as Layout_Normal;
        if (self.gold.children.length < gold.toString().length) {
            let len: number = self.gold.children.length;
            for (let index = 0; index < gold.toString().length - len; index++) {
                let goldNum: Node = instantiate(self.goldNum);
                self.gold.addChild(goldNum);
            }
        }
        else if (self.gold.children.length > gold.toString().length) {
            for (let index = 0; index < self.gold.children.length - gold.toString().length; index++) {
                self.gold.children[self.gold.children.length - 1 - index].destroy();
            }
        }

        for (let index = 0; index < self.gold.children.length; index++) {
            self.gold.children[index].getComponent(Sprite).spriteFrame = DataGetter.inst.numSprite.jsNum[parseInt(gold.toString()[self.gold.children.length - 1 - index])];
        }
    }

    showEditAlert(content: string, isPlayer: boolean) {
        let opt = tgxUIEditAlert.show(content, true);
        opt.onClick((isOK: Boolean) => {
            if (isOK) {
                CharacterManager.createCharacter(isPlayer, Coord(parseInt(opt.X.string), parseInt(opt.Y.string)));
            }
        });
    }

    removeNPC() {
        CharacterManager.inst.NPCArray.forEach(npc => {
            let layer: number = BuildGameConfig.characterType;
            let coord: Coordinate = npc.getComponent(CharacterState).characterCoord.copy();
            BuildMapManager.buildMapDit[layer][coord.y][coord.x] = 0;
            BuildMapManager.collisionMapDit[layer][coord.y][coord.x] = 0;
            npc.destroy();
        })

        CharacterManager.inst.NPCArray = [];
        CharacterManager.inst.accumulate = 0;
    }
}

tgxModuleContext.attachImplClass(UI_Normal, UI_Normal_Impl);
