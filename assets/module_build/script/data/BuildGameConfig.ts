import { _decorator } from 'cc';

export default class BuildGameConfig {
    public static row: number = 10; // 行数
    public static col: number = 10; // 列数
    public static size: number = 64; // 方块的尺寸
    public static spacing: number = 0; // 间隔
    public static padding: number = 0; // 边距
    public static buttomLayer: number = 1; // 最底层
    public static layers: number = 10 + 2; //层数
    public static characterType: number = 7; // 玩家层

    public static playerNum: number = 2;
    public static NPCNum: number = 1;

    public static empty: number = 0; // 传送门
    public static accessible: number = 1; // 可通行
    public static noPassVal: number = 2; // 不可通行

    public static canBuild: number = 0; // 可建造
    public static cantBuild: number = 1; // 不可建造

    public static eliminateScore: number = 100;

    public static autoFallInterval: number = 0.5;

    public static initialRow: number = 0;

    public static autoTileWidth: number = 48;
    public static autoTileHeight: number = 64;
    public static autoTileSize: number = 8;

    public static mapMinScale: number = 0.5;
    public static mapMaxScale: number = 2;

    public static scaleVal: number = 0.02;

    public static canvasW: number = 750;
    public static canvasH: number = 1334;

    public static NPCSpawnInterval: number = 5;

    public static SaveGameInterval: number = 1;

    public static buttomRole: number = 4;
}