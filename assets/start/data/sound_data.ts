export var sound_data = {
    "20001": {"ID":20001,"path":"bdm1","volumn":1,"des":"消消乐BDM"},
    "20002": {"ID":20002,"path":"dianji","volumn":1,"des":"点击按钮"},
    "20003": {"ID":20003,"path":"xiaochuputong","volumn":1,"des":"普通消除"},
    "20004": {"ID":20004,"path":"xiaochuhengxiang","volumn":1,"des":"横向消除"},
    "20005": {"ID":20005,"path":"xiaochuzongxiang","volumn":1,"des":"纵向消除"},
    "20006": {"ID":20006,"path":"xiaochuboom","volumn":1,"des":"炸弹消除"},
    "20007": {"ID":20007,"path":"jiesuan","volumn":1,"des":"消消乐结算"},
    "20008": {"ID":20008,"path":"bdm2","volumn":1,"des":"建造界面BDM"},
    "20009": {"ID":20009,"path":"put","volumn":1,"des":"建造-确定按钮"},
    "20010": {"ID":20010,"path":"get","volumn":1,"des":"建造-选中效果"},
    "20011": {"ID":20011,"path":"del","volumn":1,"des":"建造-删除按钮"},
};
export function getsound_dataById(id) {
    return sound_data[id] || null;
}
