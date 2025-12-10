import type Vector2 from "@/components/Login/Vector2";

export default class AxisAlignedBoundingBox {
	public constructor(
		private readonly min: Vector2,
		private readonly max: Vector2,
	) {}

	public get Min() {
		return this.min;
	}

	public get Max() {
		return this.max;
	}

	public get Area() {
		return (this.Max.X - this.Min.X) * (this.Max.Y - this.Min.Y);
	}
}
