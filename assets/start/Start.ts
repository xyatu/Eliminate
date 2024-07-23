import { _decorator, assetManager, Component, director, game, Label, Prefab, Node, log, SpriteAtlas, warn, AudioClip, NodeEventType, input, Input, SpriteFrame } from 'cc';
import { tgxAudioMgr, tgxModuleContext, tgxUIMgr } from '../core_tgx/tgx';
import { GameUILayers, GameUILayerNames } from '../scripts/GameUILayers';

import { ModuleDef } from '../scripts/ModuleDef';
import { SceneDef } from '../scripts/SceneDef';
import { Res } from './Res';
import { DataGetter, Sound } from './DataGetter';
import { SoundConfig } from './SoundConfig';
const { ccclass, property } = _decorator;

const _preloadBundles = [ModuleDef.BASIC, ModuleDef.GAME_BUILD, ModuleDef.GAME_ELIMINATE];

const _preloadRes = [
    { bundle: ModuleDef.BASIC, url: 'ui_alert/UI_Alert', type: 'prefab' },
    { bundle: ModuleDef.BASIC, url: 'ui_waiting/UI_Waiting', type: 'prefab' },
];

const _loadingText = ['Loading.', 'Loading..', 'Loading...'];
const _totalNum = _preloadBundles.length + _preloadRes.length + 1;

@ccclass('Start')
export class Start extends Component {
    @property(Label)
    txtLoading: Label

    @property(Prefab)
    uiCanvasPrefab: Prefab;

    @property(Node)
    loadingBar: Node;

    loadSequence: boolean[] = [false, false, false];

    isDone: boolean = false;

    isLoadScene: boolean = false;

    private _percent: string = '';
    private _numCurrentLoaded = 0;
    start() {
        tgxModuleContext.setDefaultModule(ModuleDef.BASIC);

        game.frameRate = 61;
        tgxUIMgr.inst.setup(this.uiCanvasPrefab, GameUILayers.NUM, GameUILayerNames);

        director.addPersistRootNode(this.node);

        this.preloadBundle(0);
    }

    onResLoaded() {
        this._numCurrentLoaded++;
        this._percent = ~~(this._numCurrentLoaded / _totalNum * 100) + '%';
    }

    preloadBundle(idx: number) {
        assetManager.loadBundle(_preloadBundles[idx], null, (err, bundle) => {
            console.log('module:<' + _preloadBundles[idx] + '>loaded.');
            idx++;
            this.onResLoaded();
            if (idx < _preloadBundles.length) {
                this.preloadBundle(idx);
            }
            else {
                this.preloadRes(0);
            }
        });
    }

    preloadRes(idx: number) {
        let res = _preloadRes[idx];
        let bundle = assetManager.getBundle(res.bundle);

        let onComplete = () => {
            idx++;
            this.onResLoaded();
            if (idx < _preloadRes.length) {
                this.preloadRes(idx);
            }
            else {
                if (!this.isDone) {
                    this.isDone = true;
                    let bundleName = ModuleDef.GAME_BUILD;
                    if (bundleName) {
                        let bundle = assetManager.getBundle(bundleName);
                        if (bundle) {
                            bundle.loadDir<SpriteAtlas>('res', SpriteAtlas, (err, data) => {
                                data.forEach(spriteAtlas => {
                                    Res.spriteAtlas[spriteAtlas.name] = spriteAtlas;
                                })

                                warn(`Resources All loaded`);
                                this.loadSequence[0] = true;
                                this.onPreloadingComplete();
                            })

                            bundle.loadDir<SpriteFrame>('res/spriteFrames', SpriteFrame, (err, data) => {
                                data.forEach(spriteFrame => {
                                    Res.spriteFrame[spriteFrame.name] = spriteFrame;
                                })

                                warn(`Resources All loaded`);
                                this.loadSequence[2] = true;
                                this.onPreloadingComplete();
                            })

                            bundle.loadDir<AudioClip>('Sound', AudioClip, (err, data) => {
                                data.forEach(audio => {
                                    Res.audio[audio.name] = audio;
                                })

                                warn(`Resources All loaded`);

                                this.node.getComponent(DataGetter).loadSound();
                                this.loadSequence[1] = true;
                                this.onPreloadingComplete();
                            })
                        }
                    }
                }
            }
        }
        if (bundle) {
            if (res.type == 'prefab') {
                bundle.preload(res.url, Prefab, onComplete);
            }
        }
    }

    onPreloadingComplete() {
        if (this.loadSequence.filter(val => !val).length > 0) return;

        this.node.getComponent(DataGetter).loadRes();
        let bundle = assetManager.getBundle(ModuleDef.GAME_BUILD);
        bundle.preloadScene(SceneDef.BUILD_GAME, () => {
            this.onResLoaded();
            this.isLoadScene = true;
            director.loadScene(SceneDef.BUILD_GAME, () => {

            });
        });
    }

    update(deltaTime: number) {
        if (this.isLoadScene) return;
        if (this._percent) {
            this.txtLoading.string = 'Loading...' + this._percent;
        }
        else {
            let idx = Math.floor(game.totalTime / 1000) % 3;
            this.txtLoading.string = _loadingText[idx];
        }
        this.loadingBar.setScale(this._numCurrentLoaded / _totalNum, 1, 1);
    }
}
