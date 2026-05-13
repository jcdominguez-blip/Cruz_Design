/**
 * ============================================================
 *  CRUZ ESTUDIO ® — Services V4 (3-col Wireframe Grid)
 *
 *  Cada columna del grid renderiza una geometría 3D distinta:
 *    [0] IcosahedronGeometry  (esférica subdividida)
 *    [1] CylinderGeometry     (tubo abierto)
 *    [2] TorusKnotGeometry    (nudo retorcido)
 *
 *  Wave morph continuo: cada vértice se desplaza a lo largo de su
 *  normal radial usando una función de ruido 3D (suma de senos).
 *  Rotación continua en X y Y. Lerp suave de la velocidad y la
 *  amplitud cuando el usuario hace hover sobre la columna.
 *
 *  Hover (GSAP) sobre .sv4-col:
 *    - color del wireframe → amarillo corporativo
 *    - escala +12%
 *    - rotación 3-4× más rápida
 *    - amplitud del wave casi 2×
 *
 *  Carga: <script src="./java/capas.js" defer></script>
 *  Requiere: THREE r128 + gsap 3.x (ya cargados en index.html).
 * ============================================================
 */

(function () {
    'use strict';

    const LOG_PREFIX = '[Capas]';
    const log  = (...args) => console.log(LOG_PREFIX, ...args);
    const warn = (...args) => console.warn(LOG_PREFIX, ...args);

    /**
     * Scroll reveal dedicado para las 3 cards de Services V4.
     * - Usa GSAP si está disponible para una curva premium (expo.out + stagger).
     * - Fallback con CSS si no hay GSAP (toggle de clase .is-revealed).
     * - IntersectionObserver con threshold 0.12 → dispara cuando ~12% del grid
     *   entra al viewport.
     * - Failsafe a 3.5s: si por cualquier razón no se disparó (loader largo,
     *   GSAP tarda, etc.), forzamos el revelado.
     */
    function initSv4Reveal(cols, section, hasGSAP) {
        if (!cols.length) return;
        const grid = section.querySelector('[data-sv4-grid]') || section.querySelector('.sv4-grid');
        const target = grid || section;

        // Registrar ScrollTrigger si está disponible
        const hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
        if (hasST) {
            try { gsap.registerPlugin(window.ScrollTrigger); } catch (_) {}
        }

        const markRevealed = () => cols.forEach(c => {
            c.classList.add('is-revealed');
            c.style.willChange = 'auto';
        });

        // ── Camino preferido: GSAP + ScrollTrigger ──
        // ScrollTrigger maneja TODOS los edge cases (sección ya past viewport,
        // scroll restoration, anchor jumps, resize) → no podemos romperlo.
        if (hasST) {
            try {
                gsap.fromTo(cols,
                    { opacity: 0, y: 60, scale: 0.96, force3D: true },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1.15,
                        ease: 'expo.out',
                        stagger: 0.16,
                        scrollTrigger: {
                            trigger: target,
                            start: 'top 88%',            // dispara cuando el grid llega al 88% del viewport
                            toggleActions: 'play none none none',
                            once: true,
                            onEnter: markRevealed,
                            onEnterBack: markRevealed
                        },
                        onComplete() {
                            cols.forEach(c => { c.style.willChange = 'auto'; });
                        }
                    }
                );

                // Failsafe extra: a los 4s, si ScrollTrigger no se calculó por algún
                // problema (refresh durante loader, etc.), forzamos refresh + reveal.
                setTimeout(() => {
                    try { window.ScrollTrigger.refresh(); } catch (_) {}
                    // Si después del refresh sigue oculto, revelamos a mano:
                    const stillHidden = Array.from(cols).some(
                        c => parseFloat(getComputedStyle(c).opacity) < 0.5
                    );
                    if (stillHidden) {
                        gsap.to(cols, {
                            opacity: 1, y: 0, scale: 1,
                            duration: 1, ease: 'expo.out', stagger: 0.12,
                            onComplete: markRevealed
                        });
                    }
                }, 4000);

                return;
            } catch (e) {
                warn('ScrollTrigger falló, usando fallback IO:', e);
            }
        }

        // ── Fallback 1: GSAP sin ScrollTrigger ──
        if (hasGSAP) {
            gsap.set(cols, { opacity: 0, y: 60, scale: 0.96, force3D: true });

            let revealed = false;
            const revealAll = () => {
                if (revealed) return;
                revealed = true;
                markRevealed();
                gsap.to(cols, {
                    opacity: 1, y: 0, scale: 1,
                    duration: 1.15, ease: 'expo.out',
                    stagger: 0.16, overwrite: 'auto'
                });
            };

            if ('IntersectionObserver' in window) {
                const io = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            revealAll();
                            io.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
                io.observe(target);
            } else {
                revealAll();
            }

            setTimeout(() => { if (!revealed) revealAll(); }, 3500);
            return;
        }

        // ── Fallback 2: sin GSAP, solo CSS via clase .is-revealed ──
        const apply = () => {
            cols.forEach((c, i) => {
                c.style.transition =
                    'opacity 1.1s cubic-bezier(0.25, 1, 0.5, 1) ' + (i * 0.16) + 's, ' +
                    'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1) ' + (i * 0.16) + 's';
                setTimeout(() => c.classList.add('is-revealed'), 30);
            });
        };
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver(entries => {
                entries.forEach(e => { if (e.isIntersecting) { apply(); io.unobserve(e.target); } });
            }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
            io.observe(target);
        } else {
            apply();
        }
        setTimeout(apply, 3500);
    }

    function init() {
        const section = document.getElementById('services');
        const cols    = document.querySelectorAll('.sv4-col');

        if (!section || !cols.length) {
            warn('No se encontró #services o .sv4-col');
            return;
        }
        if (typeof THREE === 'undefined') {
            warn('Three.js no está cargado todavía. Reintento en 100ms…');
            setTimeout(init, 100);
            return;
        }

        const hasGSAP = typeof gsap !== 'undefined';

        // ====================================================
        //   SCROLL REVEAL DEDICADO — controlado por GSAP
        //   Independiente del sistema global de scroll-reveal
        //   (evita el bug donde .reveal-fallback dejaba filter
        //    blur colgado). Failsafe propio a 3.5s.
        // ====================================================
        initSv4Reveal(cols, section, hasGSAP);

        // ── Colores corporativos ─────────────────────────────
        const COL_DEFAULT = new THREE.Color(0xfffdf3); // crema
        const COL_ACTIVE  = new THREE.Color(0xf2c335); // amarillo

        // ── Factory de geometrías por índice ────────────────
        function createGeometry(idx) {
            if (idx === 0) {
                // Esfera subdividida (4 niveles → buena densidad para morph fino)
                return new THREE.IcosahedronGeometry(1.25, 4);
            }
            if (idx === 1) {
                // Cilindro abierto (sin tapas) — tubo
                return new THREE.CylinderGeometry(0.85, 0.85, 2.4, 36, 28, true);
            }
            // TorusKnot — retorcido
            return new THREE.TorusKnotGeometry(0.85, 0.30, 120, 18);
        }

        // ── Función de "noise" 3D barata: 3 senos compuestos ─
        // No es Perlin real, pero es continua, suave y orgánica.
        function noise3D(x, y, z, t) {
            return (
                Math.sin(x * 1.7 + t * 0.95) *
                Math.cos(y * 1.5 + t * 0.80) *
                Math.sin(z * 1.3 + t * 0.65)
            );
        }

        // ── Estado por escena ────────────────────────────────
        const scenes = [];

        cols.forEach((col, idx) => {
            const canvas = col.querySelector('.sv4-canvas');
            if (!canvas) return;
            const container = canvas.parentElement; // .sv4-canvas-wrap

            // Renderer
            const renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: true,
                powerPreference: 'high-performance'
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

            const scene = new THREE.Scene();

            // Cámara apretada — el shape ocupa todo el canvas del column
            const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
            camera.position.set(0, 0, 4.4);
            camera.lookAt(0, 0, 0);

            // Geometría + material
            const geometry = createGeometry(idx);
            const material = new THREE.MeshBasicMaterial({
                color: COL_DEFAULT.clone(),
                wireframe: true,
                transparent: true,
                opacity: 0.55,
                depthWrite: false
            });

            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);

            // Backup de positions (para morph relativo, sin acumular)
            const positions = geometry.attributes.position;
            const original  = new Float32Array(positions.array);
            const vertCount = positions.count;

            // Estado animable + lerp targets
            const state = {
                idx,
                renderer,
                scene,
                camera,
                mesh,
                material,
                positions,
                original,
                vertCount,
                container,

                // Parámetros base
                rotSpeedX: 0.0026,
                rotSpeedY: 0.0042,
                ampBase:   0.085,

                // Lerp targets para hover (rotación + amplitud)
                rotMul:        1.0,
                rotMulTarget:  1.0,
                ampMul:        1.0,
                ampMulTarget:  1.0,

                // Phase distinta por columna para que no oscilen en sync
                phase: idx * 1.9
            };
            scenes.push(state);

            // Resize robusto del canvas
            function resize() {
                const w = container.clientWidth  || canvas.clientWidth  || 320;
                const h = container.clientHeight || canvas.clientHeight || 280;
                if (w === 0 || h === 0) return;
                renderer.setSize(w, h, false);
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
            }
            resize();
            // Render inicial garantizado
            requestAnimationFrame(() => { resize(); renderer.render(scene, camera); });

            if ('ResizeObserver' in window) {
                new ResizeObserver(() => resize()).observe(container);
            }
            window.addEventListener('resize', () => resize(), { passive: true });

            // ── Hover handlers sobre la columna entera ──
            col.addEventListener('mouseenter', () => {
                state.rotMulTarget = 3.5;   // rota mucho más rápido
                state.ampMulTarget = 1.85;  // wave casi 2×

                if (hasGSAP) {
                    gsap.to(material.color, {
                        r: COL_ACTIVE.r, g: COL_ACTIVE.g, b: COL_ACTIVE.b,
                        duration: 0.5,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                    gsap.to(material, {
                        opacity: 0.95,
                        duration: 0.5,
                        overwrite: 'auto'
                    });
                    gsap.to(mesh.scale, {
                        x: 1.12, y: 1.12, z: 1.12,
                        duration: 0.75,
                        ease: 'power3.out',
                        overwrite: 'auto'
                    });
                } else {
                    material.color.copy(COL_ACTIVE);
                    material.opacity = 0.95;
                    mesh.scale.set(1.12, 1.12, 1.12);
                }
            });

            col.addEventListener('mouseleave', () => {
                state.rotMulTarget = 1.0;
                state.ampMulTarget = 1.0;

                if (hasGSAP) {
                    gsap.to(material.color, {
                        r: COL_DEFAULT.r, g: COL_DEFAULT.g, b: COL_DEFAULT.b,
                        duration: 0.6,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                    gsap.to(material, {
                        opacity: 0.55,
                        duration: 0.6,
                        overwrite: 'auto'
                    });
                    gsap.to(mesh.scale, {
                        x: 1.0, y: 1.0, z: 1.0,
                        duration: 0.85,
                        ease: 'power3.out',
                        overwrite: 'auto'
                    });
                } else {
                    material.color.copy(COL_DEFAULT);
                    material.opacity = 0.55;
                    mesh.scale.set(1, 1, 1);
                }
            });
        });

        // ── Loop maestro: tick único para las 3 escenas ──
        let rafId = null;
        let running = false;

        function tick(time) {
            const t = time * 0.001;

            for (let s = 0; s < scenes.length; s++) {
                const S = scenes[s];

                // Lerp suave de multipliers (no rotación discreta)
                S.rotMul += (S.rotMulTarget - S.rotMul) * 0.06;
                S.ampMul += (S.ampMulTarget - S.ampMul) * 0.07;

                // Rotación continua en ambos ejes
                S.mesh.rotation.x += S.rotSpeedX * S.rotMul;
                S.mesh.rotation.y += S.rotSpeedY * S.rotMul;

                // Morph: desplazamos cada vértice a lo largo de su normal radial
                const amp = S.ampBase * S.ampMul;
                const ph  = S.phase;
                const arr = S.positions.array;
                const orig = S.original;

                for (let i = 0; i < S.vertCount; i++) {
                    const ix = i * 3;
                    const ox = orig[ix];
                    const oy = orig[ix + 1];
                    const oz = orig[ix + 2];

                    const len = Math.sqrt(ox * ox + oy * oy + oz * oz) || 0.0001;
                    const nx = ox / len;
                    const ny = oy / len;
                    const nz = oz / len;

                    const n = noise3D(ox * 1.05, oy * 1.05, oz * 1.05, t + ph) * amp;

                    arr[ix]     = ox + nx * n;
                    arr[ix + 1] = oy + ny * n;
                    arr[ix + 2] = oz + nz * n;
                }
                S.positions.needsUpdate = true;

                S.renderer.render(S.scene, S.camera);
            }

            rafId = requestAnimationFrame(tick);
        }

        function start() {
            if (running) return;
            running = true;
            rafId = requestAnimationFrame(tick);
        }
        function stop() {
            running = false;
            if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        }

        // Arranque inmediato + pausa cuando la sección sale del viewport
        start();

        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach(entry => entry.isIntersecting ? start() : stop());
            }, { threshold: 0 });
            io.observe(section);
        }

        log('Inicializado con', scenes.length, 'escenas (Icosa / Cyl / Knot).');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
