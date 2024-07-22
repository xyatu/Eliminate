export var anim_data = {
  "70001": {
    "ID": 70001,
    "name": "主角",
    "pList": "hero",
    "loop": 70002,
    "rate": "主角",
    "frames": 70003
  }
};
export function getanim_dataById(id) {
    return anim_data[id] || null;
}
