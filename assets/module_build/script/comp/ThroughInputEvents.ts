import { _decorator, Component, EventTouch, Node, NodeEventType } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ThroughInputEvents')
export class ThroughInputEvents extends Component {
    start(): void {
        this.node.on(NodeEventType.TOUCH_START, (event: EventTouch) => {
            event.propagationStopped = true;
        }, this, true);
        (this.node as any)._touchListener.setSwallowTouches(false);
    }

}
