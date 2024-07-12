import { _decorator, Button, Component, EditBox, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('tgxLayout_UIAlert')
export class Layout_UIEditAlert extends Component {

    @property(Label)
    title: Label;

    @property(Label)
    content: Label;

    @property(Button)
    btnOK: Button;

    @property(Button)
    btnCancel: Button;

    @property(EditBox)
    X: EditBox = null;

    @property(EditBox)
    Y: EditBox = null;
}

