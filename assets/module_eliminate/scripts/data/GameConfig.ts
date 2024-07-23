import { _decorator } from 'cc';
import { TileType } from "../game/type/Enum";

export default class GameConfig {
    public static row: number = 14; // 行数
    public static col: number = 9; // 列数
    public static size: number = 68; // 方块的尺寸
    public static spacing: number = 8; // 间隔
    public static padding: number = 4; // 边距
    public static types: TileType[] = [1, 2, 3, 4, 5, 6, 7, 8]; // 方格类型集合
    public static tileTypeWeight = {
        [TileType.A]: 30,
        [TileType.B]: 30,
        [TileType.C]: 30,
        [TileType.D]: 30,
        [TileType.E]: 30,
        [TileType.F]: 30,
        [TileType.G]: 30,
        [TileType.H]: 30,
        [TileType.I]: 30,
        [TileType.J]: 30,
        [TileType.Ver]: 1,
        [TileType.Hori]: 1,
        [TileType.Matrix]: 1,
        [TileType.Z]: 0
    };
    public static eliminateScore: number = 10;

    public static autoFallInterval: number = 1;

    public static changeFallIntervalval: number = 10;

    public static initialRow: number = 0;
}