'use strict';
import { ImporterBase } from "../common/base";

export const PLANECOLLIDER = {
    "__type__": "cc.PlaneCollider",
    "_name": "",
    "_objFlags": 0,
    "node": null,
    "_enabled": true,
    "__prefab": null,
    "_material": null,
    "_isTrigger": false,
    "_center": {
        "__type__": "cc.Vec3",
        "x": 0,
        "y": 0,
        "z": 0,
    },
    "_normal": {
        "__type__": "cc.Vec3",
        "x": 0,
        "y": 1,
        "z": 0,
    },
    "_constant": 0,
};

export class PlaneCollider {

    static create() {
        return JSON.parse(JSON.stringify(PLANECOLLIDER));
    }

    static async migrate(json2D: any) {
        const source = JSON.parse(JSON.stringify(PLANECOLLIDER));
        for (const key in json2D) {
            const value = json2D[key];
            if (key === '__type__' || value === undefined || value === null) { continue; }
            if (key === '_materials') {
                source._materials = [];
                for (let i = 0; i < value.length; ++i) {
                    let material = value[0];
                    if (material) {
                        material = {
                            __uuid__: await ImporterBase.getUuid(material.__uuid__),
                        };
                        source._materials.push(material);
                    }
                }
            }
            else {
                source[key] = value;
            }
        }
        return source;
    }

    static async apply(index: number, json2D: any, json3D: any) {
        const source = await PlaneCollider.migrate(json2D[index]);
        json3D.splice(index, 1, source);
        return source;
    }
}
