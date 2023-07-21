import type StarProperties from "@/components/Login/stars/StarProperties";

class StarClass {
    constructor(
        private readonly color: string,
        private readonly minRadius: number,
        private readonly maxRadius: number,
        private readonly minLuminosity: number,
        private readonly maxLuminosity: number,
    ) {}

    public generate(): StarProperties {
        const color = this.color;
        const radius = Math.random() * (this.maxRadius - this.minRadius) + this.minRadius;
        const luminosity = Math.random() * (this.maxLuminosity - this.minLuminosity) + this.minLuminosity;

        return {
            color,
            edgeColor: AdjustShadeRgb(-0.4, color),
            radius,
            luminosity,
        };
    }
}

// yup https://stackoverflow.com/a/13542669
// I did my best to make it readable
export function AdjustShadeRgb(amount: number, inStr: string): string {
    const [r, g, b, a] = inStr.split(",");
    const amountIsNegative = amount < 0;
    const base = amountIsNegative ? 0 : amount * 255 ** 2;
    const scalar = 1 - Math.abs(amount);
    return (
        "rgb" +
        (a ? "a(" : "(") +
        Math.round((scalar * parseInt(r[3] == "a" ? r.slice(5) : r.slice(4)) ** 2 + base) ** 0.5) +
        "," +
        Math.round((scalar * parseInt(g) ** 2 + base) ** 0.5) +
        "," +
        Math.round((scalar * parseInt(b) ** 2 + base) ** 0.5) +
        (a ? "," + a : ")")
    );
}

// data from https://en.wikipedia.org/wiki/Stellar_classification
const typeOStar = new StarClass("rgb(146,181,255)", 6.6, 10, 30000, 50000); // 0.000003%
const typeBStar = new StarClass("rgb(162,192,255)", 1.8, 6.6, 25, 30000); // 0.12%
const typeAStar = new StarClass("rgb(213,224,255)", 1.4, 1.8, 5, 25); // 0.61%
const typeFStar = new StarClass("rgb(249,245,255)", 1.15, 1.4, 1.5, 5); // 3%
const typeGStar = new StarClass("rgb(255,237,227)", 0.96, 1.15, 0.6, 1.5); // 7.6%
const typeKStar = new StarClass("rgb(255,218,181)", 0.7, 0.96, 0.08, 0.6); // 12%
const typeMStar = new StarClass("rgb(255,181,108)", 0.5, 0.7, 0.05, 0.08); // 76%

function randomStarClass(): StarClass {
    const r = Math.random();
    if (r < 0.76) {
        return typeMStar;
    }

    if (r < 0.88) {
        return typeKStar;
    }

    if (r < 0.956) {
        return typeGStar;
    }

    if (r < 0.986) {
        return typeFStar;
    }

    // kind of random from here on up
    if (r < 0.995) {
        return typeAStar;
    }

    if (r < 0.9985) {
        return typeBStar;
    }

    return typeOStar;
}

export function randomStar(): StarProperties {
    const starClass = randomStarClass();

    return starClass.generate();
}
