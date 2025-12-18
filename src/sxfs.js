// src/sfx.js
export class Sfx {
    constructor() { this.ctx = null; this.ready = false; }

    init() {
        if (this.ready) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.ready = true;
        } catch { }
    }

    tone(freq, dur, type = "square", vol = 0.3) {
        if (!this.ctx) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.connect(g); g.connect(this.ctx.destination);
        o.frequency.value = freq; o.type = type;
        g.gain.setValueAtTime(vol, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur);
        o.start(); o.stop(this.ctx.currentTime + dur);
    }

    flap() {
        this.tone(420, 0.10, "sine", 0.22);
        setTimeout(() => this.tone(520, 0.10, "sine", 0.16), 50);
    }

    eat() {
        this.tone(600, 0.08, "square", 0.20);
        this.tone(850, 0.08, "square", 0.20);
        setTimeout(() => this.tone(1050, 0.12, "square", 0.24), 80);
    }

    crash() {
        this.tone(200, 0.30, "sawtooth", 0.40);
        setTimeout(() => this.tone(150, 0.30, "sawtooth", 0.30), 100);
        setTimeout(() => this.tone(100, 0.40, "sawtooth", 0.20), 200);
    }
}
