import { _decorator, Component, math, Node, v3 } from 'cc';
import { UILayers } from '../../../core_tgx/easy_ui_framework/UILayers';
import { Layout_BuildFrame } from './Layout_BuildFrame';
import { tgxEasyController, tgxUIAlert, tgxUIController, tgxUIMgr } from '../../../core_tgx/tgx';
import { UI_Building } from '../ui_building/UI_Building';
import { Layout_Building } from '../ui_building/Layout_Building';
import BuildMapManager from '../../script/manager/BuildMapManager';
import { Layout_MapGrid } from '../map/Layout_MapGrid';
import { UI_Normal } from '../ui_normal/UI_Normal';
const { ccclass, property } = _decorator;

@ccclass('UI_Build')
export class UI_BuildFrame extends tgxUIController {
    constructor() {
        super('ui/ui_buildFrame/UI_BuildFrame', UILayers.POPUP1, Layout_BuildFrame)
    }

    public getRes(): [] {
        return
    }

    protected onCreated(): void {
        let layout = this.layout as Layout_BuildFrame;

        Layout_MapGrid.inst.cbOnBuildModeChange(true);
        tgxUIMgr.inst.showUI(UI_Building, (ui: UI_Building) => {
            ui.setParent(layout.buildingBox.getChildByName(ui.getBuildingType().toString()).children[0]);
        });

        layout.cbOnSelectBuilding = (event: boolean) => {
            layout.buildingSetting.active = event;
        }

        this.onButtonEvent('Base/BuildingSetting/Remove', () => {
            BuildMapManager.RemoveSelectNode();
        }, this);

        this.onButtonEvent('Base/BuildingSetting/PutDown', () => {
            BuildMapManager.ClearSelectNode();
        }, this);

        this.onButtonEvent('Base/Permanent/RemoveAll', () => {
            tgxUIAlert.show('你确定要移除全部建筑吗', true).onClick(isok => {
                if (isok) {
                    BuildMapManager.ClearAll();
                }
            })
        }, this);

        this.onButtonEvent('Base/ScaleSetting/Amplify', () => {
            Layout_MapGrid.inst.onChangeScale(true);
        }, this)

        this.onButtonEvent('Base/ScaleSetting/Reduce', () => {
            Layout_MapGrid.inst.onChangeScale(false);
        }, this)

        this.onButtonEvent('Base/Permanent/Back', () => {
            Layout_MapGrid.inst.cbOnBuildModeChange(false);
            tgxUIMgr.inst.showUI(UI_Normal);
            Layout_MapGrid.inst.node.setScale(v3(1, 1, 1));
            this.hide();
        })

        layout.cbOnSliderChange = () => {
            if (Math.abs(layout.slider.progress - layout.preSliderVal) > 0.001) {
                Layout_MapGrid.inst.onChangeScale(layout.slider.progress > layout.preSliderVal);
                layout.preSliderVal = layout.slider.progress;
            }
        }
    }
}


