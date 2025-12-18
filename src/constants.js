// src/constants.js
export const DOM_IDS = Object.freeze({
    canvas: "c",
    wrap: "gameWrap",
    startScreen: "startScreen",
    gameOver: "gameOver",
    score: "score",
    finalScore: "finalScore",
    crashMsg: "crashMsg",
    startBtn: "startBtn",
    retryBtn: "retryBtn",
    menuBtn: "menuBtn",
});

export const INPUT = Object.freeze({
    spaceCode: "Space",
    forbiddenKeys: Object.freeze(["u", "s", "i", "j"]),
    forbiddenFunctionKey: "F12",
});

export const DISPLAY = Object.freeze({
    flex: "flex",
    none: "none",
});

export const COLORS = Object.freeze({
    yellow: "#fc0",
    white: "#ffffff",
    tuxBody: "#1a1a1a",
    tuxFace: "#f5f5f5",
    tuxBeak: "#f4a423",
    windowsGlow: "#00a4ef",

    bgFill: "#11504B",
    gridStroke: "rgba(255,255,255,0.25)",

    pipeStroke: "rgba(255,255,255,0.3)",
    pipeTag: "rgba(255,255,255,0.7)",

    confetti: Object.freeze(["#00a1f1", "#7fba00", "#f25022", "#ffb900"]),
});

export const DRAW = Object.freeze({
    gridStep: 30,
    particleRadius: 3,

    windowsLogoScale: 0.4,
    windowsLogoGap: 2,
    windowsShadowBlur: 10,

    tuxBodyX: 0.42,
    tuxBodyY: 0.52,
    tuxFaceX: 0.30,
    tuxFaceY: 0.40,
    tuxFaceYOffset: 0.05,
    tuxEyeX: 0.12,
    tuxEyeY: 0.14,
    tuxEyeOffsetX: 0.12,
    tuxEyeOffsetY: 0.25,
    tuxPupilOffsetLeftX: 0.08,
    tuxPupilOffsetRightX: 0.16,
    tuxPupilRadius: 0.06,
    tuxBeakTopY: 0.12,
    tuxBeakSideX: 0.15,
    tuxBeakSideY: 0.05,
    tuxBeakBottomY: 0.05,
});

export const UI_TIMING = Object.freeze({
    gameOverDelayMs: 500,
});

export const MATH = Object.freeze({
    degToRad: Math.PI / 180,
    clampMinRot: -30,
    clampMaxRot: 45,
    rotVelScale: 3,
});

export const SPAWN = Object.freeze({
    obstacleW: 60,
    gapMinMargin: 200,
    gapYOffsetMin: 100,
    tuxSize: 30,
    tuxYMargin: 100,
    tuxYOffset: 50,
});

export const PARTICLES = Object.freeze({
    flapCount: 3,
    flapLife: 20,
    flapXOffset: 10,
    flapVxMin: 1,
    flapVxRange: 2,
    flapVyRange: 2,

    confettiCount: 10,
    confettiLife: 30,
    confettiVRange: 6,

    alphaDiv: 30,
});

export const DEATH_MESSAGES = Object.freeze([
    "Kernel panic. Not syncing. Your penguin has left the chat.",
    "Copilot suggests: 'Have you tried recompiling the kernel?'",
    "Recall captured 47 screenshots, but X11 dropped half of them.",
    "Telemetry collected: nothing. Absolutely nothing. Also you still crashed.",
    "A reboot is required. The init system is arguing about how.",
    "Your default editor was vim. You couldn't figure out how to quit.",
    "Installing updates: pacman, apt, dnf, snap, flatpak… choose wisely.",
    "This system requires sudo. You were not in the sudoers file."
]);

export const OBSTACLES = Object.freeze([
    { name: "Systemd", color: "#9b59b6", icon: "⚙️", tag: "PID 1" },
    { name: "Wayland", color: "#e74c3c", icon: "🖥️", tag: "It’s Different" },
    { name: "Drivers", color: "#3498db", icon: "🧩", tag: "Out of Tree" },
    { name: "Permissions", color: "#e67e22", icon: "🔒", tag: "Access Denied" },
    { name: "Kernel", color: "#2ecc71", icon: "🐧", tag: "Panic!" },
    { name: "Package Manager", color: "#00a1f1", icon: "📦", tag: "Dependency Hell" },
    { name: "GRUB", color: "#f39c12", icon: "📜", tag: "Which OS?" },
    { name: "Arch Wiki", color: "#ff6b9d", icon: "📖", tag: "RTFM" }
]);

export const CFG = Object.freeze({
    gravity: 0.4,
    flapVel: -8,
    scroll: 3,
    gap: 180,
    obstacleEvery: 150,
    tuxEvery: 100,
    playerSize: 40
});
