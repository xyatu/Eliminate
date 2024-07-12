import { tgxModuleContext, tgxUIController } from "../core_tgx/tgx";
import { CharacterManager } from "../module_build/script/manager/CharacterManager/CharacterManager";
import { GameManager } from "../module_build/script/manager/GameManager/GameManager";
import { UI_MapGrid } from "../module_build/ui/map/UI_MapGrid";
import { UI_BuildFrame } from "../module_build/ui/ui_buildFrame/UI_BuildFrame";
import { UI_Building } from "../module_build/ui/ui_building/UI_Building";
import { UI_Normal } from "../module_build/ui/ui_normal/UI_Normal";
import { UI_Eliminate } from "../module_eliminate/ui_eliminate/UI_Eliminate";
import { ModuleDef } from "./ModuleDef";

//define UI classes which are not in the basic bundle but be called by other bundles.

export class UI_AboutMe extends tgxUIController { }
tgxModuleContext.attachModule(UI_AboutMe, ModuleDef.EXTRA);
tgxModuleContext.attachModule(UI_Eliminate, ModuleDef.GAME_ELIMINATE);
tgxModuleContext.attachModule(UI_MapGrid, ModuleDef.GAME_BUILD);
tgxModuleContext.attachModule(UI_BuildFrame, ModuleDef.GAME_BUILD);
tgxModuleContext.attachModule(UI_Building, ModuleDef.GAME_BUILD);
tgxModuleContext.attachModule(UI_Normal, ModuleDef.GAME_BUILD);
tgxModuleContext.attachModule(GameManager, ModuleDef.GAME_BUILD);
tgxModuleContext.attachModule(CharacterManager, ModuleDef.GAME_BUILD);