import { EditBox, log } from "cc";
import { UIController } from "../UIController";
import { UIMgr } from "../UIMgr";
import { Layout_UIEditAlert } from "./Layout_UIEditAlert";

export class UIAlertOptions {
    private _title?: string;
    private _content?: string;
    private _showCancel?: boolean;
    private _cbClick?: Function;
    private _cbClickThisArg?: Function;
    private _X: EditBox;
    private _Y: EditBox;

    setTitle(title: string): UIAlertOptions {
        this._title = title;
        return this;
    }

    set X(editBox: EditBox) {
        this._X = editBox;
    }

    set Y(editBox: EditBox) {
        this._Y = editBox;
    }

    get X() {
        return this._X;
    }

    get Y() {
        return this._Y;
    }

    onClick(cb: (isOK: boolean) => void, thisArg?: any): UIAlertOptions {
        this._cbClick = cb;
        this._cbClickThisArg = thisArg;
        return this;
    }
}

export class UIEditAlert extends UIController {
    private _options: UIAlertOptions;

    public static show(content: string, showCancel?: boolean): UIAlertOptions {
        let opts = new UIAlertOptions() as any;
        opts._content = content;
        opts._showCancel = showCancel;
        UIMgr.inst.showUI(UIEditAlert, (alert: UIEditAlert) => {
            alert.init(opts);
        }) as UIEditAlert;
        return opts;
    }

    private init(opts: UIAlertOptions) {
        this._options = opts;
        let options = this._options as any as { _title: string, _content: string, _showCancel: boolean, X: EditBox, Y: EditBox };
        let layout = this.layout as Layout_UIEditAlert;

        options.X = layout.X;
        options.Y = layout.Y;

        if (options.hasOwnProperty('title')) {
            layout.title.string = options._title || '';
        }

        layout.content.string = options._content || '';
        layout.btnCancel.node.active = options._showCancel;
        if (!options._showCancel) {
            let pos = layout.btnOK.node.position;
            layout.btnOK.node.setPosition(0, pos.y, pos.z);
        }
    }

    protected onCreated(): void {
        let layout = this.layout as Layout_UIEditAlert;
        this.onButtonEvent(layout.btnOK, () => {
            this.hide();
            let options = this._options as any as { _cbClick: Function, _cbClickThisArg: any };
            if (options._cbClick) {
                options._cbClick.call(options._cbClickThisArg, true);
            }
        });

        this.onButtonEvent(layout.btnCancel, () => {
            this.hide();
            let options = this._options as any as { _cbClick: Function, _cbClickThisArg: any };
            if (options._cbClick) {
                options._cbClick.call(options._cbClickThisArg, false);
            }
        });
    }
}