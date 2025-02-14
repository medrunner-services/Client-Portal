<script setup lang="ts">
import { onMounted, watchEffect } from "vue";

import AxisAlignedBoundingBox from "@/components/Login/AxisAlignedBoundingBox";
import Star from "@/components/Login/Star";
import { AdjustShadeRgb, randomStar } from "@/components/Login/stars/StarClass";
import Vector2 from "@/components/Login/Vector2";
import { useLogicStore } from "@/stores/logicStore";

const logicStore = useLogicStore();

const STAR_MIN_Z = 0.2;
const OVERFLOW_THRESHOLD = 50;
let canvas: HTMLCanvasElement | null;
let context: CanvasRenderingContext2D | null;
let scale = 1,
    width = 0,
    height = 0;
const stars: Star[] = [];
const cameraVelocity = {
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
};

watchEffect(() => {
    if (logicStore.isLoginAnimationAllowed) {
        step();
    }
});

onMounted(() => {
    canvas = document.querySelector("canvas")!;
    context = canvas.getContext("2d")!;

    resize();
    step();
    window.onresize = resize;
});

function expectedStarCount() {
    return (window.innerWidth * window.innerHeight) / 40000;
}

function windowBox(): AxisAlignedBoundingBox {
    return new AxisAlignedBoundingBox(new Vector2(0, 0), new Vector2(width, height));
}

function newStar(x: number, y: number): Star {
    const z = STAR_MIN_Z + Math.random() * (1 - STAR_MIN_Z);
    return new Star(x, y, z, randomStar());
}

function makeStarInBounds(bounds?: AxisAlignedBoundingBox): Star {
    const box = bounds ?? windowBox();
    const xDiff = box.Max.X - box.Min.X;
    const yDiff = box.Max.Y - box.Min.Y;
    const x = Math.random() * xDiff + box.Min.X;
    const y = Math.random() * yDiff + box.Min.Y;
    return newStar(x, y);
}

function resize() {
    scale = window.devicePixelRatio || 1;

    const newWidth = window.innerWidth * scale;
    const xMin = Math.min(width, newWidth);
    const xMax = Math.max(width, newWidth);
    const xGrew = newWidth > width;
    width = newWidth;
    const newHeight = window.innerHeight * scale;
    const yMin = Math.min(height, newHeight);
    const yMax = Math.max(height, newHeight);
    const yGrew = newHeight > height;
    height = newHeight;
    if (canvas) {
        canvas.width = width;
        canvas.height = height;
    }

    const existingStars = stars.length;
    const newStars = expectedStarCount();

    const boxes: AxisAlignedBoundingBox[] = [];

    if (xGrew && yGrew) {
        // worst case, 3 boxes
        boxes.push(new AxisAlignedBoundingBox(new Vector2(xMin, 0), new Vector2(xMax, yMin)));
        boxes.push(new AxisAlignedBoundingBox(new Vector2(0, yMin), new Vector2(xMin, yMax)));
        boxes.push(new AxisAlignedBoundingBox(new Vector2(xMin, yMin), new Vector2(xMax, yMax)));
    } else if (xGrew) {
        boxes.push(new AxisAlignedBoundingBox(new Vector2(xMin, 0), new Vector2(xMax, height)));
    } else if (yGrew) {
        boxes.push(new AxisAlignedBoundingBox(new Vector2(0, yMin), new Vector2(width, yMax)));
    }

    const newStarCount = newStars - existingStars;

    const totalArea = boxes.map((b) => b.Area).reduce((a, b) => a + b, 0);

    for (const box of boxes) {
        const starRatio = box.Area / totalArea;
        let starsInBox = newStarCount * starRatio;

        // if starsInBox = 0.3, there should only be a 30% chance of generating a star
        if (starsInBox < 1) {
            const r = Math.random();
            if (r < starsInBox) {
                starsInBox = 1;
            } else {
                starsInBox = 0;
            }
        }

        for (let i = 0; i < starsInBox; i++) {
            // need to draw a box
            const newStar = makeStarInBounds(box);
            stars.push(newStar);
        }
    }
}

function step() {
    if (context) context.clearRect(0, 0, width, height);
    update();
    if (logicStore.isLoginAnimationAllowed) {
        requestAnimationFrame(step);
    }
}

function update() {
    cameraVelocity.tx *= 0.96;
    cameraVelocity.ty *= 0.96;
    cameraVelocity.x += (cameraVelocity.tx - cameraVelocity.x) * 0.8;
    cameraVelocity.y += (cameraVelocity.ty - cameraVelocity.y) * 0.8;
    let starsToRemove = stars.length - expectedStarCount();
    const removeIndices: number[] = [];
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.X += cameraVelocity.x * star.Z;
        star.Y += cameraVelocity.y * star.Z;
        star.X += (star.X - width / 2) * (logicStore.loginAnimationSpeed / 10000) * star.Z;
        star.Y += (star.Y - height / 2) * (logicStore.loginAnimationSpeed / 10000) * star.Z;
        star.Z *= 1 + logicStore.loginAnimationSpeed / 10000;

        // recycle when out of bounds
        if (
            star.X < -OVERFLOW_THRESHOLD ||
            star.X > width + OVERFLOW_THRESHOLD ||
            star.Y < -OVERFLOW_THRESHOLD ||
            star.Y > height + OVERFLOW_THRESHOLD
        ) {
            if (starsToRemove-- >= 1) {
                removeIndices.push(i);
            } else {
                const newStar = makeStarInBounds();
                newStar.Z = STAR_MIN_Z;
                stars[i] = newStar;
            }
        } else {
            renderStar(star);
        }
    }

    // remove excess
    removeIndices.reverse().forEach((i: number) => {
        stars.splice(i, 1);
    });
}

function renderStar(star: Star) {
    if (!context) return;
    const renderSize = star.Properties.radius;

    const radius = renderSize * logicStore.loginAnimationStarSize * star.Z * scale;
    // make more luminous stars glow more
    // at worst, ln(luminosity) is -3, so add 3 to compensate
    const glowSize = radius + logicStore.loginAnimationGlowSize * (Math.log(star.Properties.luminosity) + 3);
    if (glowSize < 2) {
        // ensure a smooth fade-in
        context.globalAlpha = glowSize / 2;
    } else {
        context.globalAlpha = 1;
    }
    const gradient = context.createRadialGradient(star.X, star.Y, radius / 10, star.X, star.Y, radius);

    // brighten the star as it gets closer to us
    const colorAdjustment = Math.min(1, Math.max(0, Math.log(star.Z)));
    gradient.addColorStop(0, AdjustShadeRgb(colorAdjustment, star.Properties.color));
    gradient.addColorStop(1, star.Properties.edgeColor);
    if (glowSize > 2) {
        context.shadowBlur = glowSize;
        context.shadowColor = star.Properties.edgeColor;
    } else {
        // if it's too small, don't glow at all (save resources)
        context.shadowBlur = 0;
    }
    context.beginPath();
    context.arc(star.X, star.Y, radius, 0, 2 * Math.PI);
    context.fillStyle = gradient;
    context.fill();
}
</script>

<template>
    <canvas></canvas>
</template>

<style scoped>
canvas {
    background-color: #000000;
    background-image:
        radial-gradient(circle at top right, rgba(121, 68, 154, 0.13), transparent),
        radial-gradient(circle at 20% 80%, rgba(41, 196, 255, 0.13), transparent);
    position: fixed;
    width: 100%;
    height: 100%;
}
</style>
