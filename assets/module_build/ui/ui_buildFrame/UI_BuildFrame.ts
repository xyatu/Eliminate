import { _decorator, Component, Node } from 'cc';
import { UILayers } from '../../../core_tgx/easy_ui_framework/UILayers';
import { Layout_BuildFrame } from './Layout_BuildFrame';
import { tgxEasyController, tgxUIAlert, tgxUIController, tgxUIMgr } from '../../../core_tgx/tgx';
import { UI_Building } from '../ui_building/UI_Building';
import { Layout_Building } from '../ui_building/Layout_Building';
import BuildMapManager from '../../script/manager/BuildMapManager';
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

        // this.onButtonEvent('Base/Permanent/Revoke',()=>{
        //     BuildMapManager.Revoke();
        // },this);
    }
}


