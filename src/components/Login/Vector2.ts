export default class Vector2 {
    public constructor(
        private readonly x: number,
        private readonly y: number,
    ) {}

    public get X() {
        return this.x;
    }

    public get Y() {
        return this.y;
    }
}
