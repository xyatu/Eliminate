import { Component, error, EventHandler, Sprite, SpriteAtlas, _decorator, SpriteFrame, log } from "cc";


const { ccclass, property } = _decorator;

@ccclass
export class FrameAnimation extends Component {

    protected spriteFrame: SpriteFrame[] = [];

    protected rate: number = 0.05;

    protected loop: boolean = false;

    protected runAtStart: boolean = false;

    protected completeCallback: Array<EventHandler> = [];

    protected endCallback: Array<EventHandler> = [];

    /**是否在播放中 */
    private running: boolean = false;

    /**当前展示的图片索引*/
    private currentIndex: number = 0;

    private frameStep = 0;

    /**是否循环播放*/
    public get Loop(): boolean { return this.loop; }

    /**是否在播放中 */
    public get Running(): boolean { return this.running; }

    protected frameCount: number = 0;

    //名字头
    private frameNamHead: string = "";

    protected onLoad(): void {
    }

    protected start(): void {
        if (this.runAtStart) {
            this.Play(this.Loop);
        }
    }

    protected update(dt: number): void {
        if (!this.running) {
            return;
        }
        this.frameStep += dt;
        if (this.frameStep >= 1 / this.rate) {
            this.frameStep -= 1 / this.rate;
            this.ChangeFrame();
        }
    }

    /**
     * 改变帧动画的图片
     */
    private ChangeFrame(): void {
        let isIndexEnd = this.currentIndex >= this.frameCount;

        if (!this.loop && isIndexEnd) {
            this.completeCallback.forEach(callback => { callback.emit([]); });
            this.endCallback.forEach(callback => { callback.emit([]); });
            this.running = false;
            return;
        }

        if (isIndexEnd) {
            this.completeCallback.forEach(callback => { callback.emit([]); });
            this.currentIndex = 0;
        }
        if (!this.spriteFrame) {
            error("atlas not exist!")
            return;
        }
        let sprite = this.node.getChildByName('Sprite').getComponent(Sprite);
        sprite.spriteFrame = this.spriteFrame[this.currentIndex];
        ++this.currentIndex;
    }

    /**
     * 执行帧动画,执行时会从第一张图开始
     * @param loop 是否循环播放
     */
    public Play(loop: boolean = false): void {

        this.loop = loop;
        this.running = true;

        this.currentIndex = 0;

        //调用一次，马上生效
        this.ChangeFrame();
    }

    /**
     * 恢复执行帧动画，会从当前帧继续执行
     */
    public Resume(loop: boolean = false): void {
        this.loop = loop;
        this.running = true;
        //调用一次，马上生效
        this.ChangeFrame();
    }

    public Pause(): void {
        this.running = false;
    }

    /**
     * 停止
     */
    public Stop(): void {
        this.running = false;
        this.runAtStart = false;
    }
}
