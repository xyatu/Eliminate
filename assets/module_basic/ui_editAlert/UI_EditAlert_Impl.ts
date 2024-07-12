
import { tgxLayout_UIEditAlert, tgxModuleContext, tgxUIEditAlert } from "../../core_tgx/tgx";
import { GameUILayers } from "../../scripts/GameUILayers";

export class UIEditAlert_Impl extends tgxUIEditAlert {
    constructor() {
        super('ui_editAlert/UI_EditAlert', GameUILayers.ALERT, tgxLayout_UIEditAlert);
    }
}

tgxModuleContext.attachImplClass(tgxUIEditAlert, UIEditAlert_Impl);