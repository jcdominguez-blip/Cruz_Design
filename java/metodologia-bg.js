/**
 * METODOLOGÍA — BACKGROUND ANIMADO (reactbits.dev port)
 *
 * Fondo fijo a pantalla completa detrás del contenido. Dos efectos conmutables
 * por el atributo data-bg del mount (#mtd-bg):
 *
 *   data-bg="silk"       → Silk   (speed 4.8 · scale 0.1 · noise 1.9 · rot 1.6 · #fff)
 *   data-bg="grainient"  → Grainient (#fff/#bbb/#fff · timeSpeed .3 · balance .29 · warp 2)
 *
 * Usa el THREE r128 ya cargado en la página. DPR capado (degradé suave). Respeta
 * prefers-reduced-motion (renderiza un frame estático). Si no hay WebGL/THREE,
 * no hace nada → el fondo crema sólido queda de fallback.
 */
(function () {
    'use strict';

    var mount = document.getElementById('mtd-bg');
    if (!mount || mount.dataset.bgInit === '1') return;
    var THREE = window.THREE;
    if (!THREE) { setTimeout(init, 60); return; }  // espera a three.min.js
    init();

  function init() {
    if (mount.dataset.bgInit === '1') return;
    THREE = window.THREE;
    if (!THREE) { setTimeout(init, 60); return; }
    mount.dataset.bgInit = '1';

    var MODE = mount.dataset.bg === 'grainient' ? 'grainient' : 'silk';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var vert = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';

    // Funciones de ruido compartidas (mismo hash que el Silk del sitio)
    var NOISE = [
        'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }',
        'float vnoise(vec2 p){',
        '  vec2 i = floor(p), f = fract(p);',
        '  float a = hash(i), b = hash(i+vec2(1.,0.)), c = hash(i+vec2(0.,1.)), d = hash(i+vec2(1.,1.));',
        '  vec2 u = f*f*(3.-2.*f);',
        '  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);',
        '}',
        'float fbm(vec2 p){ float v=0., a=0.5; for(int i=0;i<5;i++){ v+=a*vnoise(p); p*=2.02; a*=0.5;} return v; }'
    ].join('\n');

    // ── SILK (port reactbits, single-color) ──
    var SILK_FRAG = [
        'varying vec2 vUv;',
        'uniform float uTime, uSpeed, uScale, uRotation, uNoiseIntensity;',
        'uniform vec3 uColor;',
        'float snoise(vec2 c){ float G=2.71828182845904523536; vec2 r=(G*sin(G*c)); return fract(r.x*r.y*(1.0+c.x)); }',
        'vec2 rot(vec2 uv,float a){ float c=cos(a),s=sin(a); return mat2(c,-s,s,c)*uv; }',
        'void main(){',
        '  float rnd = snoise(gl_FragCoord.xy);',
        '  vec2 uv = rot(vUv * uScale, uRotation);',
        '  vec2 tex = uv * uScale;',
        '  float tOffset = uSpeed * uTime;',
        '  tex.y += 0.03 * sin(8.0*tex.x - tOffset);',
        '  float pattern = 0.6 + 0.4*sin(5.0*(tex.x+tex.y+cos(3.0*tex.x+5.0*tex.y)+0.02*tOffset)+sin(20.0*(tex.x+tex.y-0.1*tOffset)));',
        '  vec3 col = uColor * pattern - rnd/15.0 * uNoiseIntensity;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
    ].join('\n');

    // ── GRAINIENT (aproximación: gradiente warpeado + grano) ──
    var GRAINIENT_FRAG = [
        'varying vec2 vUv;',
        'uniform float uTime, uTimeSpeed, uColorBalance, uWarpStrength;',
        'uniform vec2 uResolution;',
        'uniform vec3 uColor1, uColor2, uColor3;',
        NOISE,
        'void main(){',
        '  float t = uTime * uTimeSpeed;',
        '  vec2 uv = vUv;',
        '  vec2 w = vec2(fbm(uv*2.0 + t*0.6), fbm(uv*2.0 - t*0.6 + 7.3));',
        '  vec2 p = uv + (w - 0.5) * uWarpStrength * 0.22;',
        '  float g = fbm(p*1.6 + t*0.25);',
        '  g = clamp(g + (uColorBalance - 0.5), 0.0, 1.0);',
        '  vec3 col = mix(uColor1, uColor2, smoothstep(0.0, 0.55, g));',
        '  col = mix(col, uColor3, smoothstep(0.5, 1.0, g));',
        '  float grain = vnoise(gl_FragCoord.xy * 0.9 + t*80.0);',
        '  col += (grain - 0.5) * 0.05;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
    ].join('\n');

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    mount.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    var uniforms, frag;
    if (MODE === 'grainient') {
        frag = GRAINIENT_FRAG;
        uniforms = {
            uTime: { value: 0 },
            uTimeSpeed: { value: 0.3 },
            uColorBalance: { value: 0.29 },
            uWarpStrength: { value: 2.0 },
            uResolution: { value: new THREE.Vector2(1, 1) },
            uColor1: { value: new THREE.Color(0xffffff) },
            uColor2: { value: new THREE.Color(0xbbbbbb) },
            uColor3: { value: new THREE.Color(0xffffff) }
        };
    } else {
        frag = SILK_FRAG;
        uniforms = {
            uTime: { value: 0 },
            uSpeed: { value: 4.8 },
            uScale: { value: 0.1 },
            uRotation: { value: 1.6 },
            uNoiseIntensity: { value: 1.9 },
            uColor: { value: new THREE.Color(0xffffff) }
        };
    }

    var mat = new THREE.ShaderMaterial({ uniforms: uniforms, vertexShader: vert, fragmentShader: frag });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    function resize() {
        var w = window.innerWidth, h = window.innerHeight;
        renderer.setSize(w, h);
        if (uniforms.uResolution) {
            uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height);
        }
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    var clock = new THREE.Clock();

    if (reduce) {
        // Estático: un solo frame, sin animación.
        uniforms.uTime.value = 2.0;
        renderer.render(scene, camera);
        return;
    }

    (function loop() {
        requestAnimationFrame(loop);
        var dt = clock.getDelta();
        // Pausa si la pestaña está oculta (ahorra GPU)
        if (document.hidden) return;
        uniforms.uTime.value += dt;
        renderer.render(scene, camera);
    })();
  }
})();
