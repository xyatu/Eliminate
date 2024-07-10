import { _decorator } from 'cc';
import { TileType } from "../game/type/Enum";

export default class GameConfig {
    public static row: number = 8; // 行数
    public static col: number = 8; // 列数
    public static size: number = 70; // 方块的尺寸
    public static spacing: number = 5; // 间隔
    public static padding: number = 5; // 边距
    public static types: TileType[] = [1, 2, 3, 4, 5, 6, 7, 8]; // 方格类型集合
    public static tileTypeWeight = {
        [TileType.A]: 30,
        [TileType.B]: 30,
        [TileType.C]: 30,
        [TileType.D]: 30,
        [TileType.E]: 30,
        [TileType.Ver]: 1,
        [TileType.Hori]: 1,
        [TileType.Matrix]: 1,
        [TileType.Z]: 0
    };
    public static eliminateScore: number = 100;

    public static autoFallInterval: number = 0.5;

    public static initialRow: number = 0;
}