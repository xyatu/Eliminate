import { tgxModuleContext, tgxUIController } from "../core_tgx/tgx";
import { ModuleDef } from "./ModuleDef";

//define UI classes which are not in the basic bundle but be called by other bundles.

export class UI_AboutMe extends tgxUIController { }
tgxModuleContext.attachModule(UI_AboutMe, ModuleDef.EXTRA);

export class UI_Eliminate extends tgxUIController { }
tgxModuleContext.attachModule(UI_Eliminate, ModuleDef.GAME_BUILD);

export class UI_OverComp extends tgxUIController {
    initUI(gold: number) { }
}
tgxModuleContext.attachModule(UI_OverComp, ModuleDef.GAME_BUILD);

export class UI_MapGrid extends tgxUIController { }
tgxModuleContext.attachModule(UI_MapGrid, ModuleDef.GAME_BUILD);

export class UI_BuildFrame extends tgxUIController { }
tgxModuleContext.attachModule(UI_BuildFrame, ModuleDef.GAME_BUILD);

export class UI_Normal extends tgxUIController { }
tgxModuleContext.attachModule(UI_Normal, ModuleDef.GAME_BUILD);

export class BuildGameConfig {
    public static autoTileWidth: number = 48;
    public static autoTileHeight: number = 64;
    public static autoTileSize: number = 8;
}

export function measure(target: any, name: any, descriptor: any) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
        const startTime = Date.now();
        const result = await originalMethod.apply(this, args);
        const endTime = Date.now();
        console.log(`执行时间为 ${endTime - startTime} ms`);
        return result;
    }

    return descriptor;
}