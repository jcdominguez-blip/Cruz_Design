/**
 * HERO LAB — Etapa 4 · Canvas WebGL (Three.js) detrás de la tipografía.
 *
 * Rayo PROCEDURAL (extrude de una silueta de rayo) — placeholder hasta tener
 * models/rayo.glb. Material metálico corporativo (metalness 0.8, roughness 0.2,
 * base grafito). Luz puntual amarilla Cruz que sigue al cursor.
 *
 * Render loop: flotación en Y (sin), rotación propia en Y, y parallax 3D por
 * interpolación (lerp) según el mouse. Maneja resize. DPR capado, pausa oculto.
 */
(function () {
    'use strict';

    function init() {
        var mount = document.getElementById('hero-canvas');
        if (!mount) return;
        var THREE = window.THREE;
        if (!THREE) { setTimeout(init, 60); return; }
        if (mount.dataset.webglInit === '1') return;
        mount.dataset.webglInit = '1';

        var W = mount.clientWidth || window.innerWidth;
        var H = mount.clientHeight || window.innerHeight;

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
        camera.position.z = 6;

        var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(W, H);
        mount.appendChild(renderer.domElement);

        // ── Rayo procedural (silueta extruida) ──
        var shape = new THREE.Shape();
        shape.moveTo(0.28, 1.45);
        shape.lineTo(-0.48, 0.15);
        shape.lineTo(0.06, 0.15);
        shape.lineTo(-0.28, -1.45);
        shape.lineTo(0.48, -0.1);
        shape.lineTo(-0.06, -0.1);
        shape.lineTo(0.28, 1.45);

        var geo = new THREE.ExtrudeGeometry(shape, {
            depth: 0.5,
            bevelEnabled: true,
            bevelThickness: 0.07,
            bevelSize: 0.06,
            bevelSegments: 3
        });
        geo.center();

        var mat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,     // grafito / casi negro
            metalness: 0.8,
            roughness: 0.2
        });
        var model = new THREE.Mesh(geo, mat);
        model.scale.set(1.35, 1.35, 1.35);
        scene.add(model);

        // ── Luces ──
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        var pointLight = new THREE.PointLight(0xffffff, 3, 0); // luz neutra (sin amarillo)
        pointLight.position.set(2, 2, 4);
        scene.add(pointLight);
        // rim frío tenue para leer el borde metálico
        var rim = new THREE.DirectionalLight(0xbfd4ff, 0.35);
        rim.position.set(-4, 3, 2);
        scene.add(rim);

        // ── Mouse normalizado (-1..1) ──
        var mouse = { x: 0, y: 0 };
        window.addEventListener('mousemove', function (e) {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
        }, { passive: true });

        // ── Render loop ──
        var clock = new THREE.Clock();
        (function loop() {
            requestAnimationFrame(loop);
            if (document.hidden) return;
            var t = clock.getElapsedTime();

            model.position.y = Math.sin(t) * 0.18;              // flotación
            model.rotation.y += 0.005;                          // rotación propia

            var targetRX = mouse.y * 0.5;                       // parallax 3D (lerp)
            model.rotation.x += (targetRX - model.rotation.x) * 0.05;

            // la luz amarilla sigue al cursor
            pointLight.position.x += (mouse.x * 4 - pointLight.position.x) * 0.08;
            pointLight.position.y += (mouse.y * 4 - pointLight.position.y) * 0.08;

            renderer.render(scene, camera);
        })();

        // ── Resize ──
        function resize() {
            var w = mount.clientWidth || window.innerWidth;
            var h = mount.clientHeight || window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
        window.addEventListener('resize', resize, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
