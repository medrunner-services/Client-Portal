import type StarProperties from "@/components/adequateLogInScreen/stars/StarProperties";

export default class Star {
    public constructor(private x: number, private y: number, private z: number, private readonly properties: StarProperties) {}

    public get X(): number {
        return this.x;
    }

    public set X(value: number) {
        this.x = value;
    }

    public get Y(): number {
        return this.y;
    }

    public set Y(value: number) {
        this.y = value;
    }

    public get Z(): number {
        return this.z;
    }

    public set Z(value: number) {
        this.z = value;
    }

    public get Properties(): StarProperties {
        return this.properties;
    }
}
