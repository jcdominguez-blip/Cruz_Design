/* ==========================================================================
   SILK BACKGROUND — Fondo animado (port del "Silk" de reactbits.dev, MIT).
   --------------------------------------------------------------------------
   Quad fullscreen con un fragment shader que genera un patrón de seda en
   movimiento. Sin React: usa el THREE r128 ya cargado.
   Parámetros: speed 0.6 · scale 0.5 · noiseIntensity 3.6 · rotation 0.8
     · Zonas DARK  → color #404040 sobre fondo oscuro.
     · Zonas LIGHT → base blanca (#FFFDF3) + amarillo institucional (#f2c335)
       muy tenue.
   Modo "themed" (mount #silk-content): un único canvas colorea por zona según
   qué secciones del contenido son claras (detección por luminancia real del
   fondo, robusto ante data-theme inconsistentes como el footer).
   Expone window.cruzCreateSilk(mount) para otras capas (loaders).
   ========================================================================== */
(function () {
    'use strict';

    const MAX_REGIONS = 16;

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
        }
    `;

    const fragmentShader = `
        varying vec2 vUv;
        uniform float uTime;
        uniform float uSpeed;
        uniform float uScale;
        uniform float uRotation;
        uniform float uNoiseIntensity;
        uniform vec2  uResolution;
        uniform vec3  uDarkColor;
        uniform vec3  uLightBase;
        uniform vec3  uLightAccent;
        uniform int   uThemed;
        uniform int   uForceLight;
        uniform int   uLightCount;
        uniform vec2  uLightRegions[${MAX_REGIONS}];

        const float e = 2.71828182845904523536;

        float noise(vec2 texCoord) {
            float G = e;
            vec2  r = (G * sin(G * texCoord));
            return fract(r.x * r.y * (1.0 + texCoord.x));
        }
        vec2 rotateUvs(vec2 uv, float angle) {
            float c = cos(angle);
            float s = sin(angle);
            mat2  rot = mat2(c, -s, s, c);
            return rot * uv;
        }

        void main() {
            float rnd = noise(gl_FragCoord.xy);
            vec2  uv  = rotateUvs(vUv * uScale, uRotation);
            vec2  tex = uv * uScale;
            float tOffset = uSpeed * uTime;

            tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

            float pattern = 0.6 +
                0.4 * sin(5.0 * (tex.x + tex.y +
                                 cos(3.0 * tex.x + 5.0 * tex.y) +
                                 0.02 * tOffset) +
                          sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

            // Zona oscura
            vec3 darkCol = uDarkColor * pattern - rnd / 15.0 * uNoiseIntensity;
            // Zona clara: base blanca con un hilo de amarillo muy tenue
            vec3 lightCol = mix(uLightBase, uLightAccent, (1.0 - pattern) * 0.35);
            lightCol -= rnd / 15.0 * uNoiseIntensity * 0.08;

            // uForceLight: usa siempre la rama clara (loaders temáticos).
            float mask = (uForceLight == 1) ? 1.0 : 0.0;
            if (uThemed == 1) {
                float sy = 1.0 - (gl_FragCoord.y / uResolution.y); // 0 arriba .. 1 abajo
                for (int i = 0; i < ${MAX_REGIONS}; i++) {
                    if (i >= uLightCount) break;
                    vec2 rg = uLightRegions[i];
                    if (sy >= rg.x && sy <= rg.y) { mask = 1.0; }
                }
            }

            vec3 col = mix(darkCol, lightCol, mask);
            gl_FragColor = vec4(col, 1.0);
        }
    `;

    function luminance(cssColor) {
        const m = cssColor.match(/rgba?\(([^)]+)\)/);
        if (!m) return 0;
        const p = m[1].split(',').map(parseFloat);
        return (0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]) / 255;
    }

    /**
     * createSilk(mount, opts)
     * opts (opcional, para loaders temáticos):
     *   force: 'light'   → usa siempre la rama clara del shader
     *   lightBase        → color base de la rama clara (ej. '#FFFDF3' o '#f2c335')
     *   lightAccent      → color del hilo de acento
     *   darkColor        → color de la rama oscura
     *   maxDpr           → tope de devicePixelRatio (default 2). Útil en mounts
     *                      grandes: el Silk es un degradé suave y a DPR 1 se ve igual.
     */
    function createSilk(mount, opts) {
        opts = opts || {};
        if (!mount || mount.dataset.silkInit === '1') return;
        // Perf mobile: el Silk temático del contenido no se monta en pantallas
        // chicas (evita un contexto WebGL extra). Las secciones quedan sólidas.
        if (mount.id === 'silk-content' && window.matchMedia('(max-width: 700px)').matches) return;
        const THREE = window.THREE;
        if (!THREE) { setTimeout(() => createSilk(mount), 60); return; }
        mount.dataset.silkInit = '1';

        const themed = mount.id === 'silk-content';

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxDpr || 2));
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const regions = [];
        for (let i = 0; i < MAX_REGIONS; i++) regions.push(new THREE.Vector2(2, 2));

        const uniforms = {
            uTime: { value: 0 },
            uSpeed: { value: 0.6 },
            uScale: { value: 0.5 },
            uRotation: { value: 0.8 },
            uNoiseIntensity: { value: 3.6 },
            uResolution: { value: new THREE.Vector2(1, 1) },
            uDarkColor: { value: new THREE.Color(opts.darkColor || '#404040') },
            uLightBase: { value: new THREE.Color(opts.lightBase || '#FFFDF3') },
            uLightAccent: { value: new THREE.Color(opts.lightAccent || '#f2c335') },
            uThemed: { value: themed ? 1 : 0 },
            uForceLight: { value: opts.force === 'light' ? 1 : 0 },
            uLightCount: { value: 0 },
            uLightRegions: { value: regions },
        };

        const mat = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
        scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

        function resize() {
            const r = mount.getBoundingClientRect();
            const w = r.width || window.innerWidth;
            const h = r.height || window.innerHeight;
            renderer.setSize(w, h);
            uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height);
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });

        // Modo temático: actualizar las regiones claras (secciones con fondo claro)
        // Perf: la clasificación claro/oscuro de cada sección NO cambia con el
        // scroll, pero getComputedStyle fuerza un recálculo de estilos. Antes se
        // llamaba por sección en cada frame de scroll (reflow por cuadro, parte de
        // la trabada en MacBook). Ahora se cachea sólo las secciones claras una vez.
        let lightSecs = null;
        function collectLightSecs() {
            const all = document.querySelectorAll('.site-content-wrapper > section, .site-content-wrapper > footer');
            lightSecs = Array.prototype.filter.call(all, sec =>
                luminance(getComputedStyle(sec).backgroundColor) >= 0.5);
        }
        let regionRaf = null;
        function updateRegions() {
            regionRaf = null;
            if (!lightSecs) collectLightSecs();
            const vh = window.innerHeight || 1;
            let count = 0;
            for (let i = 0; i < lightSecs.length && count < MAX_REGIONS; i++) {
                const rect = lightSecs[i].getBoundingClientRect();
                if (rect.bottom < 0 || rect.top > vh) continue; // fuera de vista
                const top = Math.max(0, Math.min(1, rect.top / vh));
                const bot = Math.max(0, Math.min(1, rect.bottom / vh));
                regions[count].set(top, bot);
                count++;
            }
            uniforms.uLightCount.value = count;
        }
        // El layout/tema puede cambiar en resize o al cargar imágenes → recachear.
        window.addEventListener('resize', () => { lightSecs = null; }, { passive: true });
        window.addEventListener('load', () => { lightSecs = null; });
        if (themed) {
            const onScroll = () => { if (!regionRaf) regionRaf = requestAnimationFrame(updateRegions); };
            window.addEventListener('scroll', onScroll, { passive: true });
            window.addEventListener('resize', onScroll, { passive: true });
            window.addEventListener('load', updateRegions);
            updateRegions();
        }

        // ── Gate de visibilidad (perf) ──
        // Cada Silk es un contexto WebGL con su propio rAF. En pantallas retina
        // (MacBook, DPR 2) tener 5 canvas renderizando SIEMPRE a pantalla completa
        // colapsa el frame rate y traba el scroll (la rueda se encola con Lenis).
        // Solución: solo renderizamos cuando el mount aporta algo en pantalla.
        //   · themed (#silk-content): sticky y cubre todo → siempre activo.
        //   · gateHero (#silk-bg, fixed): activo solo mientras el hero está a la
        //     vista; más abajo queda tapado por el contenido → puro gasto.
        //   · resto (secciones): IntersectionObserver sobre el propio mount.
        // Cuando está oculto NO acumulamos uTime, así al volver el patrón no salta.
        let visible = true;
        if (opts.gateHero) {
            // El hero se pinea sobre #spacer (520vh). El fondo fijo debe seguir
            // animando TODA esa zona; recién se pausa cuando el spacer pasó por
            // completo y el contenido tapa el hero. Usar el spacer se auto-ajusta
            // al alto real (depende de innerHeight) sin hardcodear el 520vh.
            const spacer = document.getElementById('spacer');
            const gate = () => {
                if (!spacer) { visible = true; return; }
                visible = spacer.getBoundingClientRect().bottom > 0;
            };
            window.addEventListener('scroll', gate, { passive: true });
            window.addEventListener('resize', gate, { passive: true });
            gate();
        } else if (!themed && 'IntersectionObserver' in window) {
            visible = false;
            new IntersectionObserver((entries) => {
                visible = entries[0].isIntersecting;
            }, { rootMargin: '200px 0px' }).observe(mount);
        }

        const clock = new THREE.Clock();
        (function loop() {
            requestAnimationFrame(loop);
            const dt = clock.getDelta();
            if (!visible) return;               // oculto: no renderiza ni avanza el tiempo
            uniforms.uTime.value += dt;
            renderer.render(scene, camera);
        })();
    }

    window.cruzCreateSilk = createSilk;

    // Silks a pantalla completa: DPR capado a 1.5. Son degradés suaves; a DPR 2
    // en retina no se ganan detalle pero cuadruplican el trabajo de fragment
    // shader (causa principal de la trabada de scroll en MacBook).
    //   · #silk-bg (fixed, fondo del hero) → además gateHero: se pausa al salir.
    //   · #silk-content (sticky global) → siempre activo, pero DPR capado.
    //   · #silk-loader → efímero (intro), sin cambios.
    const silkBg = document.getElementById('silk-bg');
    if (silkBg) createSilk(silkBg, { maxDpr: 1.5, gateHero: true });
    const silkLoader = document.getElementById('silk-loader');
    if (silkLoader) createSilk(silkLoader);
    const silkContent = document.getElementById('silk-content');
    if (silkContent) createSilk(silkContent, { maxDpr: 1.5 });

    // Fondos de sección oscuros con el MISMO Silk que el hero (why-us, contact).
    // Desktop only (perf), igual criterio que #silk-content; en móvil quedan sólidos.
    if (!window.matchMedia('(max-width: 700px)').matches) {
        document.querySelectorAll('[data-dark-silk]').forEach(m => createSilk(m, { maxDpr: 1 }));
    }

    // #silk-content se descarta en pantallas ≤700px por performance, pero sin
    // reintento quedaba SIN fondo para siempre si la página cargaba con la
    // ventana angosta y después se agrandaba (y las secciones al 85% dejaban
    // ver lo que hubiera detrás). Reintentamos al crecer el viewport.
    let retryTimer = null;
    window.addEventListener('resize', () => {
        if (retryTimer) return;
        retryTimer = setTimeout(() => {
            retryTimer = null;
            const sc = document.getElementById('silk-content');
            if (sc && sc.dataset.silkInit !== '1' &&
                !window.matchMedia('(max-width: 700px)').matches) {
                createSilk(sc, { maxDpr: 1.5 });
            }
        }, 200);
    }, { passive: true });
})();
