// src/game.js
import {
    DOM_IDS, INPUT, DISPLAY,
    COLORS, DRAW, UI_TIMING, MATH, SPAWN, PARTICLES,
    DEATH_MESSAGES, OBSTACLES, CFG
} from "./constants.js";

import { Sfx } from "./sfx.js";

export class Game {
    constructor() {
        this.cv = document.getElementById(DOM_IDS.canvas);
        this.cx = this.cv.getContext("2d");

        this.sfx = new Sfx();

        this.startScreen = document.getElementById(DOM_IDS.startScreen);
        this.gameOver = document.getElementById(DOM_IDS.gameOver);
        this.scoreEl = document.getElementById(DOM_IDS.score);
        this.finalScoreEl = document.getElementById(DOM_IDS.finalScore);
        this.crashMsgEl = document.getElementById(DOM_IDS.crashMsg);

        this.wrap = document.getElementById(DOM_IDS.wrap);

        window.addEventListener("resize", () => this.resize());
        this.bind();
        this.reset();
        this.resize();
    }

    bind() {
        const flapHandler = (e) => {
            e.preventDefault();
            if (this.running && !this.ended) this.flap();
        };

        this.cv.addEventListener("touchstart", flapHandler, { passive: false });
        this.cv.addEventListener("mousedown", flapHandler);
        document.addEventListener("keydown", (e) => { if (e.code === INPUT.spaceCode) flapHandler(e); });

        document.getElementById(DOM_IDS.startBtn).addEventListener("click", () => this.start());
        document.getElementById(DOM_IDS.retryBtn).addEventListener("click", () => this.start());
        document.getElementById(DOM_IDS.menuBtn).addEventListener("click", () => this.menu());

        document.addEventListener("contextmenu", e => e.preventDefault());
        document.addEventListener("keydown", e => {
            if ((e.ctrlKey || e.metaKey) && INPUT.forbiddenKeys.includes(e.key.toLowerCase())) e.preventDefault();
            if (e.key === INPUT.forbiddenFunctionKey) e.preventDefault();
        });
    }

    resize() {
        const r = this.wrap.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.cx.setTransform(1, 0, 0, 1, 0, 0);
        this.cv.width = Math.floor(r.width * dpr);
        this.cv.height = Math.floor(r.height * dpr);
        this.cx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.w = r.width;
        this.h = r.height;
    }

    reset() {
        this.player = { x: this.w * 0.2, y: this.h / 2, v: 0, rot: 0 };
        this.obstacles = [];
        this.tuxes = [];
        this.particles = [];
        this.score = 0;
        this.frame = 0;
        this.running = false;
        this.ended = false;
        this.lastObstacleIndex = null;
    }

    start() {
        this.sfx.init();
        this.reset();
        this.startScreen.style.display = DISPLAY.none;
        this.gameOver.style.display = DISPLAY.none;
        this.running = true;
        this.loop();
    }

    menu() {
        this.gameOver.style.display = DISPLAY.none;
        this.startScreen.style.display = DISPLAY.flex;
        this.reset();
    }

    flap() {
        this.player.v = CFG.flapVel;
        this.sfx.flap();

        for (let i = 0; i < PARTICLES.flapCount; i++) {
            this.particles.push({
                x: this.player.x - PARTICLES.flapXOffset,
                y: this.player.y,
                vx: -Math.random() * PARTICLES.flapVxRange - PARTICLES.flapVxMin,
                vy: (Math.random() - 0.5) * PARTICLES.flapVyRange,
                life: PARTICLES.flapLife,
                color: COLORS.yellow
            });
        }
    }

    spawnObstacle() {
        let idx;
        do { idx = Math.floor(Math.random() * OBSTACLES.length); }
        while (idx === this.lastObstacleIndex && OBSTACLES.length > 1);

        this.lastObstacleIndex = idx;
        const type = OBSTACLES[idx];

        const gapY = Math.random() * (this.h - CFG.gap - SPAWN.gapMinMargin) + SPAWN.gapYOffsetMin;
        this.obstacles.push({ x: this.w, gapY, w: SPAWN.obstacleW, type });
    }

    spawnTux() {
        this.tuxes.push({
            x: this.w,
            y: Math.random() * (this.h - SPAWN.tuxYMargin) + SPAWN.tuxYOffset,
            size: SPAWN.tuxSize,
            rot: 0,
            collected: false
        });
    }

    rectHit(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    circleRectHit(cx, cy, r, rt) {
        const clx = Math.max(rt.x, Math.min(cx, rt.x + rt.w));
        const cly = Math.max(rt.y, Math.min(cy, rt.y + rt.h));
        const dx = cx - clx, dy = cy - cly;
        return (dx * dx + dy * dy) < (r * r);
    }

    checkCollisions() {
        const hitbox = {
            x: this.player.x - CFG.playerSize / 2 + 5,
            y: this.player.y - CFG.playerSize / 2 + 5,
            w: CFG.playerSize - 10,
            h: CFG.playerSize - 10
        };

        if (this.player.y < 0 || this.player.y > this.h - CFG.playerSize / 2) return this.end();

        for (const o of this.obstacles) {
            if (this.rectHit(hitbox, { x: o.x, y: 0, w: o.w, h: o.gapY })) return this.end();
            if (this.rectHit(hitbox, { x: o.x, y: o.gapY + CFG.gap, w: o.w, h: this.h - o.gapY - CFG.gap })) return this.end();
        }

        for (const t of this.tuxes) {
            if (t.collected) continue;
            if (this.circleRectHit(t.x, t.y, t.size / 2, hitbox)) {
                t.collected = true;
                this.score += 10;
                this.sfx.eat();

                for (let i = 0; i < PARTICLES.confettiCount; i++) {
                    this.particles.push({
                        x: t.x,
                        y: t.y,
                        vx: (Math.random() - 0.5) * PARTICLES.confettiVRange,
                        vy: (Math.random() - 0.5) * PARTICLES.confettiVRange,
                        life: PARTICLES.confettiLife,
                        color: COLORS.confetti[Math.floor(Math.random() * COLORS.confetti.length)]
                    });
                }
            }
        }
    }

    end() {
        if (this.ended) return;
        this.ended = true;
        this.running = false;
        this.sfx.crash();

        this.finalScoreEl.textContent = this.score;
        this.crashMsgEl.textContent = DEATH_MESSAGES[Math.floor(Math.random() * DEATH_MESSAGES.length)];

        setTimeout(() => { this.gameOver.style.display = DISPLAY.flex; }, UI_TIMING.gameOverDelayMs);
    }

    update() {
        this.frame++;

        this.player.v += CFG.gravity;
        this.player.y += this.player.v;
        this.player.rot = Math.min(
            Math.max(this.player.v * MATH.rotVelScale, MATH.clampMinRot),
            MATH.clampMaxRot
        );

        if (this.frame % CFG.obstacleEvery === 0) this.spawnObstacle();
        if (this.frame % CFG.tuxEvery === 0) this.spawnTux();

        for (const o of this.obstacles) o.x -= CFG.scroll;
        this.obstacles = this.obstacles.filter(o => o.x > -o.w);

        for (const t of this.tuxes) {
            t.x -= CFG.scroll * 0.8;
            t.rot += 2;
        }
        this.tuxes = this.tuxes.filter(t => t.x > -t.size && !t.collected);

        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
        }
        this.particles = this.particles.filter(p => p.life > 0);

        this.checkCollisions();
        this.scoreEl.textContent = this.score;
    }

    drawBackground() {
        this.cx.fillStyle = COLORS.bgFill;
        this.cx.fillRect(0, 0, this.w, this.h);

        this.cx.strokeStyle = COLORS.gridStroke;
        this.cx.lineWidth = 1;

        for (let x = 0; x < this.w; x += DRAW.gridStep) {
            this.cx.beginPath();
            this.cx.moveTo(x, 0);
            this.cx.lineTo(x, this.h);
            this.cx.stroke();
        }
        for (let y = 0; y < this.h; y += DRAW.gridStep) {
            this.cx.beginPath();
            this.cx.moveTo(0, y);
            this.cx.lineTo(this.w, y);
            this.cx.stroke();
        }
    }

    drawParticles() {
        for (const p of this.particles) {
            this.cx.fillStyle = p.color;
            this.cx.globalAlpha = p.life / PARTICLES.alphaDiv;
            this.cx.beginPath();
            this.cx.arc(p.x, p.y, DRAW.particleRadius, 0, Math.PI * 2);
            this.cx.fill();
        }
        this.cx.globalAlpha = 1;
    }

    drawWindowsPlayer() {
        const { x, y, rot } = this.player;
        const s = CFG.playerSize;

        this.cx.save();
        this.cx.translate(x, y);
        this.cx.rotate(rot * MATH.degToRad);

        const z = s * DRAW.windowsLogoScale;
        const gap = DRAW.windowsLogoGap;

        const cs = COLORS.confetti;
        const ps = [
            [-z - gap / 2, -z - gap / 2],
            [gap / 2, -z - gap / 2],
            [-z - gap / 2, gap / 2],
            [gap / 2, gap / 2]
        ];

        for (let i = 0; i < 4; i++) {
            this.cx.fillStyle = cs[i];
            this.cx.fillRect(ps[i][0], ps[i][1], z, z);
        }

        this.cx.shadowColor = COLORS.windowsGlow;
        this.cx.shadowBlur = DRAW.windowsShadowBlur;

        this.cx.restore();
        this.cx.shadowBlur = 0;
    }

    drawTuxCollectible(x, y, size, rotDeg) {
        const s = size;
        this.cx.save();
        this.cx.translate(x, y);
        this.cx.rotate(rotDeg * MATH.degToRad);

        this.cx.fillStyle = COLORS.tuxBody;
        this.cx.beginPath();
        this.cx.ellipse(0, 0, s * DRAW.tuxBodyX, s * DRAW.tuxBodyY, 0, 0, Math.PI * 2);
        this.cx.fill();

        this.cx.fillStyle = COLORS.tuxFace;
        this.cx.beginPath();
        this.cx.ellipse(0, s * DRAW.tuxFaceYOffset, s * DRAW.tuxFaceX, s * DRAW.tuxFaceY, 0, 0, Math.PI * 2);
        this.cx.fill();

        this.cx.fillStyle = COLORS.white;
        this.cx.beginPath();
        this.cx.ellipse(-s * DRAW.tuxEyeOffsetX, -s * DRAW.tuxEyeOffsetY, s * DRAW.tuxEyeX, s * DRAW.tuxEyeY, 0, 0, Math.PI * 2);
        this.cx.ellipse(s * DRAW.tuxEyeOffsetX, -s * DRAW.tuxEyeOffsetY, s * DRAW.tuxEyeX, s * DRAW.tuxEyeY, 0, 0, Math.PI * 2);
        this.cx.fill();

        this.cx.fillStyle = COLORS.tuxBody;
        this.cx.beginPath();
        this.cx.arc(-s * DRAW.tuxPupilOffsetLeftX, -s * DRAW.tuxEyeOffsetY, s * DRAW.tuxPupilRadius, 0, Math.PI * 2);
        this.cx.arc(s * DRAW.tuxPupilOffsetRightX, -s * DRAW.tuxEyeOffsetY, s * DRAW.tuxPupilRadius, 0, Math.PI * 2);
        this.cx.fill();

        this.cx.fillStyle = COLORS.tuxBeak;
        this.cx.beginPath();
        this.cx.moveTo(0, -s * DRAW.tuxBeakTopY);
        this.cx.lineTo(s * DRAW.tuxBeakSideX, -s * DRAW.tuxBeakSideY);
        this.cx.lineTo(0, s * DRAW.tuxBeakBottomY);
        this.cx.lineTo(-s * DRAW.tuxBeakSideX, -s * DRAW.tuxBeakSideY);
        this.cx.closePath();
        this.cx.fill();

        this.cx.restore();
    }

    drawObstacle(o) {
        const { x, gapY, w, type } = o;
        this.drawPipe(x, 0, w, gapY, type, false);
        this.drawPipe(x, gapY + CFG.gap, w, this.h - gapY - CFG.gap, type, true);
    }

    lighten(hex, pct) {
        const n = parseInt(hex.replace("#", ""), 16);
        const a = Math.round(2.55 * pct);
        const R = (n >> 16) + a;
        const G = ((n >> 8) & 0xFF) + a;
        const B = (n & 0xFF) + a;
        const clamp = v => (v < 0 ? 0 : (v > 255 ? 255 : v));
        return "#" + (0x1000000 + clamp(R) * 0x10000 + clamp(G) * 0x100 + clamp(B)).toString(16).slice(1);
    }

    drawPipe(x, y, w, h, type, isBottom) {
        const gr = this.cx.createLinearGradient(x, y, x + w, y);
        gr.addColorStop(0, type.color);
        gr.addColorStop(0.5, this.lighten(type.color, 30));
        gr.addColorStop(1, type.color);

        this.cx.fillStyle = gr;
        this.cx.fillRect(x, y, w, h);

        const capH = 25;
        const capW = w + 10;
        const capY = isBottom ? y : y + h - capH;

        this.cx.fillStyle = type.color;
        this.cx.fillRect(x - 5, capY, capW, capH);

        this.cx.strokeStyle = COLORS.pipeStroke;
        this.cx.lineWidth = 2;
        this.cx.strokeRect(x, y, w, h);
        this.cx.strokeRect(x - 5, capY, capW, capH);

        this.cx.fillStyle = COLORS.white;
        this.cx.textAlign = "center";
        this.cx.font = "bold 10px Arial";
        this.cx.fillText(type.name, x + w / 2, capY + 16);

        this.cx.font = "16px Arial";
        const iconY = isBottom ? y + 40 : y + h - 40;
        this.cx.fillText(type.icon, x + w / 2, iconY);

        this.cx.font = "8px Arial";
        this.cx.fillStyle = COLORS.pipeTag;
        const tagY = isBottom ? y + 55 : y + h - 25;
        this.cx.fillText(type.tag, x + w / 2, tagY);
    }

    draw() {
        this.drawBackground();
        this.drawParticles();

        for (const t of this.tuxes) {
            this.drawTuxCollectible(t.x, t.y, t.size, t.rot);
        }
        for (const o of this.obstacles) {
            this.drawObstacle(o);
        }

        this.drawWindowsPlayer();
    }

    loop() {
        if (!this.running) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}
