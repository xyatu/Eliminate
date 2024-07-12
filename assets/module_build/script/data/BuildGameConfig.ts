import { _decorator } from 'cc';

export default class BuildGameConfig {
    public static row: number = 50; // 行数
    public static col: number = 50; // 列数
    public static size: number = 64; // 方块的尺寸
    public static spacing: number = 0; // 间隔
    public static padding: number = 0; // 边距
    public static layers: number = 5; //层数

    public static eliminateScore: number = 100;

    public static autoFallInterval: number = 0.5;

    public static initialRow: number = 0;

    public static autoTileWidth: number = 48;
    public static autoTileHeight: number = 64;
    public static autoTileSize: number = 8;
}