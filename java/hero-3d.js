/**
 * SISTEMA CRUZ ESTUDIO ® - Waves Engine High-Fidelity
 * Movimiento: Natural, Ultra-Lento y Multidireccional
 */

class Grad { constructor(x, y, z) { this.x = x; this.y = y; this.z = z; } dot2(x, y) { return this.x * x + this.y * y; } }
class Noise {
    constructor(seed = Math.random()) {
        this.p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
        this.perm = new Array(512); this.gradP = new Array(512);
        this.grad3 = [new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)];
        if (seed > 0 && seed < 1) seed *= 65536; seed = Math.floor(seed);
        for (let i = 0; i < 256; i++) { let v = this.p[i] ^ (seed & 255); this.perm[i] = this.perm[i + 256] = v; this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12]; }
    }
    perlin2(x, y) {
        let X = Math.floor(x), Y = Math.floor(y); x -= X; y -= Y; X &= 255; Y &= 255;
        const n00 = this.gradP[X + this.perm[Y]].dot2(x, y), n01 = this.gradP[X + this.perm[Y+1]].dot2(x, y-1);
        const n10 = this.gradP[X+1 + this.perm[Y]].dot2(x-1, y), n11 = this.gradP[X+1 + this.perm[Y+1]].dot2(x-1, y-1);
        const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10), lerp = (a, b, t) => (1 - t) * a + t * b;
        return lerp(lerp(n00, n10, fade(x)), lerp(n01, n11, fade(x)), fade(y));
    }
}

const container = document.getElementById('hero-3d-background');
if (container) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const noise = new Noise();

    const config = {
        lineColor: "rgba(255, 253, 243, 0.15)", 
        backgroundColor: "#1D1E1C",
        waveSpeed: 0.0003, // VELOCIDAD REDUCIDA (Casi imperceptible pero constante)
        waveAmp: 48,
        xGap: 18, 
        yGap: 18,
        friction: 0.88,    
        tension: 0.006,    // Tensión baja para naturalidad orgánica
        ovalFactor: 3.5,   // Punta ovalada pronunciada
    };

    let width, height, grid = [], columns, rows;
    let mouse = { x: -2000, y: -2000, sx: 0, sy: 0 };

    function init() {
        width = canvas.width = container.offsetWidth;
        height = canvas.height = container.offsetHeight;
        columns = Math.ceil(width / config.xGap) + 1;
        rows = Math.ceil(height / config.yGap) + 1;
        grid = [];
        for (let i = 0; i < columns; i++) {
            grid[i] = [];
            for (let j = 0; j < rows; j++) {
                grid[i][j] = { x: i * config.xGap, y: j * config.yGap, vx: 0, vy: 0, curX: 0, curY: 0 };
            }
        }
    }

    function animate(time) {
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = config.lineColor;
        ctx.lineWidth = 0.6;

        mouse.sx += (mouse.x - mouse.sx) * 0.06;
        mouse.sy += (mouse.y - mouse.sy) * 0.06;

        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                const p = grid[i][j];
                // FRECUENCIA DE RUIDO MUY BAJA (Frecuencia 0.035) para naturalidad suprema
                const noiseVal = noise.perlin2(i * 0.035, j * 0.035 + time * config.waveSpeed) * 12;
                
                const targetX = p.x + Math.cos(noiseVal) * config.waveAmp;
                const targetY = p.y + Math.sin(noiseVal) * config.waveAmp;

                const dx = p.x - mouse.sx, dy = p.y - mouse.sy;
                const dist = Math.hypot(dx / config.ovalFactor, dy); // Interacción Ovalada
                if (dist < 300) {
                    const f = (1 - dist / 300) * 0.45;
                    p.vx += dx * f * 0.02; p.vy += dy * f * 0.02;
                }

                p.vx += (targetX - p.curX) * config.tension;
                p.vy += (targetY - p.curY) * config.tension;
                p.vx *= config.friction; p.vy *= config.friction;
                
                p.curX = (p.curX || targetX) + p.vx;
                p.curY = (p.curY || targetY) + p.vy;
            }
        }

        // Dibujo de la Rejilla Técnica (Grid Dual)
        for (let i = 0; i < columns; i++) {
            ctx.beginPath();
            for (let j = 0; j < rows; j++) {
                const p = grid[i][j];
                if (j === 0) ctx.moveTo(p.curX, p.curY);
                else ctx.lineTo(p.curX, p.curY);
            }
            ctx.stroke();
        }
        for (let j = 0; j < rows; j++) {
            ctx.beginPath();
            for (let i = 0; i < columns; i++) {
                const p = grid[i][j];
                if (i === 0) ctx.moveTo(p.curX, p.curY);
                else ctx.lineTo(p.curX, p.curY);
            }
            ctx.stroke();
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });

    window.addEventListener('resize', init);
    init(); requestAnimationFrame(animate);
}