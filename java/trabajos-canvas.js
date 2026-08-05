/**
 * CRUZ ESTUDIO ® — GALERÍA INMERSIVA DE TRABAJOS (canvas arrastrable + zoom).
 *
 * Adaptada de la referencia "Fashion Gallery" (GSAP Draggable + Flip + CustomEase)
 * a NUESTRO design system, componentes y proyectos. Sin sonido ni preloader propios.
 * Al clickear una card: crece y se ubica a la DERECHA; a la izquierda aparece el
 * panel con nº · cintillo (cliente) · título (H2) · bajada · ficha técnica · "ver caso".
 *
 * Controlador expuesto en window.CruzCanvas (mount / activate / deactivate) para el
 * switcher de vistas (java/trabajos.js). Namespaced .cg-* para no chocar con el archivo.
 */
(function () {
    'use strict';

    // Registro seguro de plugins (los premium degradan con fallback).
    var plugins = [];
    if (typeof Draggable !== 'undefined') plugins.push(Draggable);
    if (typeof Flip !== 'undefined') plugins.push(Flip);
    if (typeof InertiaPlugin !== 'undefined') plugins.push(InertiaPlugin);
    if (typeof CustomEase !== 'undefined') plugins.push(CustomEase);
    if (typeof gsap !== 'undefined' && plugins.length) gsap.registerPlugin.apply(gsap, plugins);

    // ── DATOS: 13 proyectos (portada + copy provisto + link al case) ──
    var CX_PROJECTS = [
        { num: '01', img: 'https://i.ibb.co/dmkbM0K/tac.jpg', href: './trenescargas.html',
          client: 'Trenes Argentinos Cargas',
          title: 'Sistematización visual para la mayor red logística nacional.',
          desc: 'Desarrollamos un ecosistema visual robusto y escalable que unifica la comunicación de la entidad, proyectando absoluto orden, peso institucional y eficiencia operativa.',
          ficha: ['Branding', 'Web Design', '2025'] },
        { num: '02', img: '../img/estacion-sur-img-1.jpg', href: './estacion-sur.html',
          client: 'Estación Sur Vinos',
          title: 'Elevando la experiencia retail en el sector vitivinícola.',
          desc: 'Articulamos una identidad y estrategia de contenido que aleja a la marca del clásico bodegón, posicionándola como una boutique especializada de alto valor percibido.',
          ficha: ['Branding', 'Estrategia de Contenido', '2024'] },
        { num: '03', img: 'https://i.ibb.co/8BbCKvj/1.jpg', href: './suuam.html',
          client: 'SUUAM®',
          title: 'Interfaz de confianza para transformar la asistencia vehicular.',
          desc: 'Diseñamos un entorno digital estructurado que transmite seguridad inmediata y respaldo tecnológico, optimizando la experiencia de los usuarios en situación de emergencia.',
          ficha: ['UX/UI', 'Product', '2024'] },
        { num: '04', img: 'https://i.ibb.co/svwVxV1L/pr13.jpg', href: './prisma.html',
          client: 'Prisma',
          title: 'Reducción de carga cognitiva para plataformas de gestión B2B.',
          desc: 'Estructuramos un entorno de producto enfocado en la visualización clara de datos y la fluidez operativa, facilitando la toma de decisiones gerenciales sin fricción visual.',
          ficha: ['Product Design', '2024'] },
        { num: '05', img: 'https://i.ibb.co/GfT5Pyk2/ejmUF.jpg', href: './union-ferroviaria.html',
          client: 'Unión Ferroviaria',
          title: 'Modernización institucional y conexión digital para el afiliado.',
          desc: 'Transformamos un legado de peso histórico en un ecosistema visual y digital ágil, acercando los beneficios y servicios al usuario mediante una interfaz contemporánea.',
          ficha: ['Branding', 'App', '2023'] },
        { num: '06', img: '../img/header-rovex.png', href: './rovex.html',
          client: 'ROVEX',
          title: 'Solidez gráfica industrial para el mercado de maquinaria pesada.',
          desc: 'Construimos una identidad corporativa que proyecta fuerza y continuidad operativa, posicionando a la marca como el socio técnico definitivo frente a la competencia.',
          ficha: ['Branding', 'Diseño Web', '2026'] },
        { num: '07', img: 'https://i.ibb.co/qMQcwjt/SC.jpg', href: './sc.html',
          client: 'Municipio San Cristóbal',
          title: 'Ordenamiento cívico: de la dispersión visual a la autoridad.',
          desc: 'Reestructuramos la identidad del municipio para separar la comunicación ciudadana del ruido político, mediante un sistema visual transparente y de alto rendimiento.',
          ficha: ['Government Branding', '2023'] },
        { num: '08', img: '../img/pinta-02.jpg', href: './pinta-gaucha.html',
          client: 'Pinta Gaucha',
          title: 'Diferenciación estratégica en un mercado gastronómico saturado.',
          desc: 'Diseñamos una experiencia de marca integral —desde el espacio físico hasta la interfaz digital— que proyecta carácter corporativo, superando los clichés visuales del rubro.',
          ficha: ['Branding', 'Retail Experience', 'UI-UX', '2024'] },
        { num: '09', img: 'https://i.ibb.co/tPZ8KBHk/VD15.jpg', href: './vientos-de-ruta.html',
          client: 'VDR',
          title: 'Ecosistema digital para dinamizar la captación en turismo.',
          desc: 'Desarrollamos una identidad sólida y una plataforma web optimizada para conversión, garantizando que el rigor operativo de la empresa se refleje en cada punto de contacto.',
          ficha: ['Development', 'Brand', '2022'] },
        { num: '10', img: 'https://i.ibb.co/RYZ1CJ7/sh-1.jpg', href: './sohat.html',
          client: 'So Hat',
          title: 'Sofisticación visual para el sector de accesorios premium.',
          desc: 'Construimos un sistema de marca minimalista y elegante que cede el protagonismo al producto, asegurando un posicionamiento estético de alta gama en canales digitales.',
          ficha: ['Branding', 'Fashion', '2024'] },
        { num: '11', img: 'https://i.ibb.co/1tBtbRyC/TF14.jpg', href: './typefusion.html',
          client: 'Typefusion®',
          title: 'Interfaz de precisión técnica para herramientas creativas.',
          desc: 'Diseñamos una arquitectura de producto intuitiva y de alto rendimiento, optimizando el flujo de trabajo de los usuarios sin comprometer la limpieza visual del entorno.',
          ficha: ['Product Design', '2022'] },
        { num: '12', img: 'https://i.ibb.co/2YChXbhZ/tp2.jpg', href: './runakay.html',
          client: 'Runakay',
          title: 'Articulación visual de valores esenciales y corporativos.',
          desc: 'Desarrollamos una identidad sólida y atemporal que traduce los principios fundamentales de la marca en un lenguaje gráfico estructurado para liderar en su sector.',
          ficha: ['Brand Design', '2023'] },
        { num: '13', img: 'https://i.ibb.co/XxgN2CDM/AUR1.png', href: './aurea.html',
          client: 'Aurea®',
          title: 'Rigor geométrico y posicionamiento estratégico superior.',
          desc: 'Implementamos un sistema visual basado en la proporción y el equilibrio técnico, sentando las bases para proyectar autoridad, confianza y un estándar de calidad corporativa.',
          ficha: ['Branding', 'Strategy', '2024'] }
    ];

    function CruzCanvasGallery() {
        this.viewport = document.getElementById('cg-viewport');
        this.canvasWrapper = document.getElementById('cg-canvas');
        this.gridContainer = document.getElementById('cg-grid');
        this.splitContainer = document.getElementById('cg-split');
        this.infoPanel = document.getElementById('cg-info');
        this.closeButton = document.getElementById('cg-close');
        this.controls = document.getElementById('cg-controls');

        this.customEase = (typeof CustomEase !== 'undefined')
            ? CustomEase.create('cxSmooth', '.87,0,.13,1') : 'power2.inOut';
        this.centerEase = (typeof CustomEase !== 'undefined')
            ? CustomEase.create('cxCenter', '.25,.46,.45,.94') : 'power2.out';

        this.config = { itemSize: 320, rows: 6, cols: 8, currentZoom: 0.6, currentGap: 32 };
        this.zoomState = { isActive: false, selectedItem: null, flipAnimation: null, scalingOverlay: null };
        this.gridItems = [];
        this.gridDimensions = {};
        this.lastValidPosition = { x: 0, y: 0 };
        this.draggable = null;
        this.viewportObserver = null;
        this.descriptionLines = null;
        this.mounted = false;
        this.boundMouseLeave = this.handleMouseLeave.bind(this);
        this.initSound();
    }

    // ── Sonido inmersivo: "Gesture Move 04" al arrastrar · "Zoom" al abrir card ──
    CruzCanvasGallery.prototype.initSound = function () {
        var base = '../audio/';
        this.sound = {
            enabled: true,
            files: {
                drag: new Audio(base + 'Gesture%20Move%2004.wav'),
                zoom: new Audio(base + 'Zoom.wav')
            }
        };
        var f = this.sound.files;
        f.drag.preload = 'auto'; f.drag.volume = 0.35;
        f.zoom.preload = 'auto'; f.zoom.volume = 0.5;
    };
    CruzCanvasGallery.prototype.playSound = function (name) {
        if (!this.sound || !this.sound.enabled) return;
        var a = this.sound.files[name];
        if (!a) return;
        try { a.currentTime = 0; a.play().catch(function () {}); } catch (e) { /* noop */ }
    };
    CruzCanvasGallery.prototype.updateSoundLabel = function () {
        var btn = document.getElementById('cg-sound');
        if (!btn) return;
        btn.classList.toggle('is-on', this.sound.enabled);
        var lbl = btn.querySelector('.cg-sound-label');
        if (lbl) lbl.textContent = this.sound.enabled ? 'SÍ' : 'NO';
    };
    CruzCanvasGallery.prototype.toggleSound = function () {
        this.sound.enabled = !this.sound.enabled;
        this.updateSoundLabel();
    };

    CruzCanvasGallery.prototype.splitTextIntoLines = function (element, text) {
        element.innerHTML = '';
        var sentences = text.split(/(?<=[.!?])\s+/);
        var lines = [];
        var temp = document.createElement('div');
        var cs = getComputedStyle(element);
        temp.style.cssText = 'position:absolute;visibility:hidden;width:' + element.offsetWidth +
            'px;font-family:' + cs.fontFamily + ';font-size:' + cs.fontSize +
            ';font-weight:' + cs.fontWeight + ';line-height:' + cs.lineHeight + ';';
        document.body.appendChild(temp);
        var currentLine = '';
        sentences.forEach(function (sentence) {
            sentence.split(' ').forEach(function (word) {
                var testLine = currentLine ? currentLine + ' ' + word : word;
                temp.textContent = testLine;
                if (temp.offsetWidth > element.offsetWidth && currentLine) {
                    lines.push(currentLine); currentLine = word;
                } else { currentLine = testLine; }
            });
        });
        if (currentLine) lines.push(currentLine);
        document.body.removeChild(temp);
        lines.forEach(function (t) {
            var span = document.createElement('span');
            span.className = 'cg-desc-line';
            span.textContent = t;
            element.appendChild(span);
        });
        return element.querySelectorAll('.cg-desc-line');
    };

    CruzCanvasGallery.prototype.calculateGapForZoom = function (z) {
        if (z >= 1.0) return 16; if (z >= 0.6) return 32; return 64;
    };
    // Dimensiona el grid para que al ZOOM OUT (min zoom) llene toda la pantalla
    // (con margen), sin importar que los proyectos se repitan.
    CruzCanvasGallery.prototype.computeGridSize = function () {
        var minZoom = 0.3, gap = 64, cell = this.config.itemSize + gap;
        var vw = window.innerWidth || 1440, vh = window.innerHeight || 900;
        this.config.cols = Math.max(10, Math.ceil((vw / minZoom + gap) / cell) + 2);
        this.config.rows = Math.max(7, Math.ceil((vh / minZoom + gap) / cell) + 2);
    };

    // Hint que sigue al cursor: "arrastrá para explorar" (mismo recurso que el hero).
    // Aparece al mover el mouse sobre el canvas y se desvanece tras el primer drag.
    CruzCanvasGallery.prototype.setupHint = function () {
        if (!this.viewport) return;
        var self = this;
        var hint = document.createElement('div');
        hint.className = 'cg-hint';
        hint.setAttribute('aria-hidden', 'true');
        hint.innerHTML = '<span class="cg-hint-inner">arrastrá para explorar <em>↔</em></span>';
        document.body.appendChild(hint);
        this.hint = hint;
        this.hintDismissed = false;
        var hx = window.innerWidth / 2, hy = window.innerHeight / 2, tx = hx, ty = hy, over = false;
        (function loop() {
            self._hintRAF = requestAnimationFrame(loop);
            hx += (tx - hx) * 0.16; hy += (ty - hy) * 0.16;
            hint.style.transform = 'translate(' + hx + 'px,' + hy + 'px)';
        })();
        this.viewport.addEventListener('mousemove', function (e) {
            tx = e.clientX; ty = e.clientY;
            if (!self.hintDismissed && over && !self.zoomState.isActive &&
                document.body.classList.contains('cg-active')) hint.classList.add('is-in');
        }, { passive: true });
        this.viewport.addEventListener('mouseenter', function () { over = true; });
        this.viewport.addEventListener('mouseleave', function () { over = false; hint.classList.remove('is-in'); });
    };
    CruzCanvasGallery.prototype.dismissHint = function () {
        this.hintDismissed = true;
        if (this.hint) this.hint.classList.remove('is-in');
    };
    CruzCanvasGallery.prototype.hideHint = function () {
        if (this.hint) this.hint.classList.remove('is-in');
    };
    CruzCanvasGallery.prototype.calculateGridDimensions = function (gap) {
        gap = (gap == null) ? this.config.currentGap : gap;
        var w = this.config.cols * (this.config.itemSize + gap) - gap;
        var h = this.config.rows * (this.config.itemSize + gap) - gap;
        this.gridDimensions = {
            width: w, height: h,
            scaledWidth: w * this.config.currentZoom, scaledHeight: h * this.config.currentZoom, gap: gap
        };
        return this.gridDimensions;
    };

    CruzCanvasGallery.prototype.generateGridItems = function () {
        this.config.currentGap = this.calculateGapForZoom(this.config.currentZoom);
        this.calculateGridDimensions();
        this.canvasWrapper.style.width = this.gridDimensions.width + 'px';
        this.canvasWrapper.style.height = this.gridDimensions.height + 'px';
        this.gridContainer.innerHTML = '';
        this.gridItems = [];
        var self = this;
        var pIndex = 0;
        for (var row = 0; row < this.config.rows; row++) {
            for (var col = 0; col < this.config.cols; col++) {
                var project = CX_PROJECTS[pIndex % CX_PROJECTS.length];
                pIndex++;
                var item = document.createElement('div');
                item.className = 'cg-item';
                var x = col * (this.config.itemSize + this.config.currentGap);
                var y = row * (this.config.itemSize + this.config.currentGap);
                item.style.left = x + 'px';
                item.style.top = y + 'px';
                item.style.opacity = '0';
                var img = document.createElement('img');
                img.src = project.img;
                img.alt = project.client;
                img.loading = 'lazy';
                img.decoding = 'async';
                item.appendChild(img);
                var itemData = {
                    element: item, img: img, row: row, col: col,
                    baseX: x, baseY: y, project: project, index: this.gridItems.length
                };
                (function (data) {
                    item.addEventListener('click', function () {
                        if (!self.zoomState.isActive) self.enterZoomMode(data);
                    });
                })(itemData);
                this.gridContainer.appendChild(item);
                this.gridItems.push(itemData);
            }
        }
    };

    CruzCanvasGallery.prototype.setupViewportObserver = function () {
        if (this.viewportObserver) this.viewportObserver.disconnect();
        var self = this;
        this.viewportObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (self.zoomState.selectedItem && entry.target === self.zoomState.selectedItem.element) return;
                gsap.to(entry.target, { opacity: entry.isIntersecting ? 1 : 0.12, duration: 0.6, ease: 'power2.out' });
            });
        }, { root: null, threshold: 0.15, rootMargin: '10%' });
        this.gridItems.forEach(function (it) { self.viewportObserver.observe(it.element); });
    };

    CruzCanvasGallery.prototype.updateInfoPanel = function (project) {
        var q = function (s) { return document.querySelector(s); };
        var num = q('#cg-info-num span');
        var client = q('#cg-info-client span');
        var title = q('#cg-info-title h2');
        var descEl = document.getElementById('cg-info-desc');
        var ficha = document.getElementById('cg-info-ficha');
        var link = document.getElementById('cg-info-link');
        if (num) num.textContent = project.num;
        if (client) client.textContent = '[ CLIENTE: ' + project.client.toUpperCase() + ' ]';
        if (title) title.textContent = project.title;
        if (ficha) ficha.textContent = project.ficha.join('  ·  ');
        if (link) link.setAttribute('href', project.href);
        if (descEl) this.descriptionLines = this.splitTextIntoLines(descEl, project.desc);
    };

    CruzCanvasGallery.prototype.createScalingOverlay = function (sourceImg) {
        var overlay = document.createElement('div');
        overlay.className = 'cg-scaling-overlay';
        var img = document.createElement('img');
        img.src = sourceImg.src; img.alt = sourceImg.alt;
        overlay.appendChild(img);
        document.body.appendChild(overlay);
        var r = sourceImg.getBoundingClientRect();
        gsap.set(overlay, { left: r.left, top: r.top, width: r.width, height: r.height, opacity: 1 });
        return overlay;
    };

    CruzCanvasGallery.prototype.enterZoomMode = function (data) {
        if (this.zoomState.isActive) return;
        var self = this;
        this.zoomState.isActive = true;
        this.zoomState.selectedItem = data;
        this.hideHint();
        this.playSound('zoom');
        if (this.draggable) this.draggable.disable();
        document.body.classList.add('cg-zoom-mode');
        var zoomTarget = document.getElementById('cg-zoom-target');
        this.splitContainer.classList.add('active');
        gsap.to(this.splitContainer, { opacity: 1, duration: 1.0, ease: this.customEase });
        this.zoomState.scalingOverlay = this.createScalingOverlay(data.img);
        gsap.set(data.img, { opacity: 0 });

        // Contenido del panel: se puebla YA (robusto, no depende del onComplete).
        this.updateInfoPanel(data.project);
        this.infoPanel.classList.add('active');
        gsap.set(this.infoPanel, { opacity: 0 });
        gsap.set('#cg-info-num span', { y: 20, opacity: 0 });
        gsap.set('#cg-info-client span', { y: 20, opacity: 0 });
        gsap.set('#cg-info-title h2', { y: 60, opacity: 0 });
        gsap.set(this.descriptionLines, { y: 40, opacity: 0 });
        gsap.set('#cg-info-ficha', { y: 20, opacity: 0 });
        gsap.set('#cg-info-link', { y: 20, opacity: 0 });

        this.zoomState.flipAnimation = Flip.fit(this.zoomState.scalingOverlay, zoomTarget, {
            duration: 1.1, ease: this.customEase, absolute: true,
            onComplete: function () {
                // El reveal escalonado del texto (aparece cuando la imagen aterriza).
                gsap.to(self.infoPanel, { opacity: 1, duration: 0.3, ease: 'power2.out' });
                gsap.to('#cg-info-num span', { y: 0, opacity: 1, duration: 0.7, ease: self.customEase, delay: 0.05 });
                gsap.to('#cg-info-client span', { y: 0, opacity: 1, duration: 0.7, ease: self.customEase, delay: 0.12 });
                gsap.to('#cg-info-title h2', { y: 0, opacity: 1, duration: 0.8, ease: self.customEase, delay: 0.18 });
                gsap.to(self.descriptionLines, { y: 0, opacity: 1, duration: 0.8, ease: self.customEase, delay: 0.26, stagger: 0.08 });
                gsap.to('#cg-info-ficha', { y: 0, opacity: 1, duration: 0.7, ease: self.customEase, delay: 0.42 });
                gsap.to('#cg-info-link', { y: 0, opacity: 1, duration: 0.7, ease: self.customEase, delay: 0.5 });
            }
        });

        this.controls.classList.add('cg-split-mode');
        gsap.fromTo(this.closeButton, { x: -40, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.8 });
        this.closeButton.classList.add('active');
        document.getElementById('cg-split-left').addEventListener('click', this._splitClick = function (e) { self.handleSplitAreaClick(e); });
        this._zoomKeys = function (e) { if (e.key === 'Escape') self.exitZoomMode(); };
        document.addEventListener('keydown', this._zoomKeys);
    };

    CruzCanvasGallery.prototype.handleSplitAreaClick = function (e) {
        if (e.target === e.currentTarget) this.exitZoomMode();
    };

    CruzCanvasGallery.prototype.exitZoomMode = function () {
        if (!this.zoomState.isActive || !this.zoomState.selectedItem || !this.zoomState.scalingOverlay) return;
        var self = this;
        this.playSound('zoom');   // suena al volver a explorar (flecha / Esc / click fuera)
        if (this._zoomKeys) document.removeEventListener('keydown', this._zoomKeys);
        var sl = document.getElementById('cg-split-left');
        if (sl && this._splitClick) sl.removeEventListener('click', this._splitClick);
        var selectedElement = this.zoomState.selectedItem.element;
        var selectedImg = this.zoomState.selectedItem.img;
        if (this.zoomState.flipAnimation) this.zoomState.flipAnimation.kill();

        gsap.to(this.infoPanel, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        gsap.to(['#cg-info-num span', '#cg-info-client span', '#cg-info-title h2', '#cg-info-ficha', '#cg-info-link'],
            { y: -20, opacity: 0, duration: 0.35, ease: 'power2.out' });
        if (this.descriptionLines) gsap.to(this.descriptionLines, { y: -30, opacity: 0, duration: 0.35, ease: 'power2.out',
            onComplete: function () { self.infoPanel.classList.remove('active'); } });

        gsap.to(this.closeButton, { opacity: 0, x: -40, duration: 0.3, ease: 'power2.in' });
        this.splitContainer.classList.remove('active');
        this.controls.classList.remove('cg-split-mode');
        gsap.to(this.splitContainer, { opacity: 0, duration: 0.8, ease: 'power2.out' });

        Flip.fit(this.zoomState.scalingOverlay, selectedElement, {
            duration: 1.1, ease: this.customEase, absolute: true,
            onComplete: function () {
                gsap.set(selectedImg, { opacity: 1 });
                if (self.zoomState.scalingOverlay) {
                    document.body.removeChild(self.zoomState.scalingOverlay);
                    self.zoomState.scalingOverlay = null;
                }
                document.body.classList.remove('cg-zoom-mode');
                self.closeButton.classList.remove('active');
                if (self.draggable) self.draggable.enable();
                self.zoomState.isActive = false;
                self.zoomState.selectedItem = null;
                self.zoomState.flipAnimation = null;
            }
        });
        if (this.zoomState.scalingOverlay) gsap.to(this.zoomState.scalingOverlay, { opacity: 0.35, duration: 0.8, ease: 'power2.out' });
    };

    CruzCanvasGallery.prototype.calculateBounds = function () {
        var vw = window.innerWidth, vh = window.innerHeight;
        var sw = this.gridDimensions.scaledWidth, sh = this.gridDimensions.scaledHeight;
        var mX = this.config.currentGap * this.config.currentZoom, mY = mX;
        var b = {};
        if (sw <= vw) { b.minX = b.maxX = (vw - sw) / 2; } else { b.maxX = mX; b.minX = vw - sw - mX; }
        if (sh <= vh) { b.minY = b.maxY = (vh - sh) / 2; } else { b.maxY = mY; b.minY = vh - sh - mY; }
        return b;
    };

    CruzCanvasGallery.prototype.initDraggable = function () {
        if (typeof Draggable === 'undefined') return;
        if (this.draggable) this.draggable.kill();
        this.calculateGridDimensions(this.config.currentGap);
        var bounds = this.calculateBounds();
        var self = this;
        var hasInertia = (typeof InertiaPlugin !== 'undefined');
        var cfg = {
            type: 'x,y', bounds: bounds, edgeResistance: 0.8, inertia: hasInertia,
            onDragStart: function () {
                document.body.classList.add('cg-dragging');
                self.dismissHint();
                self.playSound('drag');
                self.lastValidPosition.x = self.draggable.x; self.lastValidPosition.y = self.draggable.y;
            },
            onDrag: function () { self.lastValidPosition.x = self.draggable.x; self.lastValidPosition.y = self.draggable.y; },
            onDragEnd: function () { document.body.classList.remove('cg-dragging'); }
        };
        if (hasInertia) cfg.throwProps = {
            x: { velocity: 'auto', resistance: 300, end: function (v) { return Math.round(v); } },
            y: { velocity: 'auto', resistance: 300, end: function (v) { return Math.round(v); } }
        };
        this.draggable = Draggable.create(this.canvasWrapper, cfg)[0];
    };

    CruzCanvasGallery.prototype.handleMouseLeave = function () {
        if (document.body.classList.contains('cg-dragging')) {
            document.body.classList.remove('cg-dragging');
            gsap.to(this.canvasWrapper, { duration: 0.6, x: this.lastValidPosition.x, y: this.lastValidPosition.y, ease: 'power2.out' });
            if (this.draggable) this.draggable.endDrag();
        }
    };

    CruzCanvasGallery.prototype.calculateFitZoom = function () {
        var vw = window.innerWidth, vh = window.innerHeight - 80;
        var gap = this.calculateGapForZoom(1.0);
        var gw = this.config.cols * (this.config.itemSize + gap) - gap;
        var gh = this.config.rows * (this.config.itemSize + gap) - gap;
        var m = 40;
        var fit = Math.min((vw - m * 2) / gw, (vh - m * 2) / gh);
        return Math.max(0.1, Math.min(2.0, fit));
    };

    CruzCanvasGallery.prototype.updatePercentageIndicator = function (z) {
        var el = document.getElementById('cg-pct'); if (el) el.textContent = Math.round(z * 100) + '%';
    };

    CruzCanvasGallery.prototype._applyZoom = function (zoomLevel, buttonElement, fit) {
        if (this.zoomState.isActive) { this.exitZoomMode(); return; }
        this.playSound('zoom');   // feedback sonoro en los controles de zoom (out/normal/in/fit)
        var self = this;
        var newGap = this.calculateGapForZoom(zoomLevel);
        var oldZoom = this.config.currentZoom;
        this.config.currentZoom = zoomLevel;
        this.calculateGridDimensions(this.config.currentGap);
        var vw = window.innerWidth, vh = window.innerHeight;
        var cx = (vw - this.gridDimensions.width * oldZoom) / 2;
        var cy = (vh - this.gridDimensions.height * oldZoom) / 2;
        gsap.to(this.canvasWrapper, {
            duration: 0.6, x: cx, y: cy, ease: this.centerEase,
            onComplete: function () {
                if (newGap !== self.config.currentGap) {
                    self.gridItems.forEach(function (it) {
                        var nx = it.col * (self.config.itemSize + newGap);
                        var ny = it.row * (self.config.itemSize + newGap);
                        it.baseX = nx; it.baseY = ny;
                        gsap.to(it.element, { duration: 1.1, left: nx, top: ny, ease: self.customEase });
                    });
                    var nw = self.config.cols * (self.config.itemSize + newGap) - newGap;
                    var nh = self.config.rows * (self.config.itemSize + newGap) - newGap;
                    gsap.to(self.canvasWrapper, { duration: 1.1, width: nw, height: nh, ease: self.customEase });
                    self.config.currentGap = newGap;
                }
                self.calculateGridDimensions(newGap);
                var fw = self.gridDimensions.width * zoomLevel, fh = self.gridDimensions.height * zoomLevel;
                var fcx = (vw - fw) / 2, fcy = (vh - fh) / 2;
                gsap.to(self.canvasWrapper, {
                    duration: 1.1, scale: zoomLevel, x: fcx, y: fcy, ease: self.customEase,
                    onComplete: function () {
                        self.lastValidPosition.x = fcx; self.lastValidPosition.y = fcy;
                        self.calculateGridDimensions(newGap); self.initDraggable();
                    }
                });
            }
        });
        this.updatePercentageIndicator(zoomLevel);
        document.querySelectorAll('.cg-switch-button').forEach(function (b) { b.classList.remove('is-current'); });
        if (buttonElement) buttonElement.classList.add('is-current');
    };

    CruzCanvasGallery.prototype.setZoom = function (z, btn) { this._applyZoom(z, btn, false); };
    CruzCanvasGallery.prototype.autoFitZoom = function (btn) {
        if (this.zoomState.isActive) { this.exitZoomMode(); return; }
        this._applyZoom(this.calculateFitZoom(), btn, true);
    };

    CruzCanvasGallery.prototype.resetPosition = function () {
        if (this.zoomState.isActive) { this.exitZoomMode(); return; }
        this.calculateGridDimensions(this.config.currentGap);
        var vw = window.innerWidth, vh = window.innerHeight, self = this;
        var cx = (vw - this.gridDimensions.scaledWidth) / 2, cy = (vh - this.gridDimensions.scaledHeight) / 2;
        gsap.to(this.canvasWrapper, { duration: 1.0, x: cx, y: cy, ease: this.centerEase,
            onComplete: function () { self.lastValidPosition.x = cx; self.lastValidPosition.y = cy; self.initDraggable(); } });
    };

    CruzCanvasGallery.prototype.playIntroAnimation = function () {
        var self = this;
        var vw = window.innerWidth, vh = window.innerHeight;
        var m = new DOMMatrix(getComputedStyle(this.canvasWrapper).transform);
        var scale = m.a || this.config.currentZoom;
        var cx = (vw / 2 - m.e) / scale - this.config.itemSize / 2;
        var cy = (vh / 2 - m.f) / scale - this.config.itemSize / 2;
        this.gridItems.forEach(function (it, i) {
            gsap.set(it.element, { left: cx, top: cy, scale: 0.8, zIndex: self.gridItems.length - i, opacity: 0 });
        });
        gsap.to(this.gridItems.map(function (it) { return it.element; }), {
            duration: 0.25, left: function (i) { return self.gridItems[i].baseX; },
            top: function (i) { return self.gridItems[i].baseY; }, scale: 1, opacity: 1, ease: 'power2.out',
            stagger: { amount: 1.4, from: 'start', grid: [this.config.rows, this.config.cols] },
            onComplete: function () {
                self.gridItems.forEach(function (it) { gsap.set(it.element, { zIndex: 1 }); });
                gsap.fromTo(self.controls, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
                self.controls.classList.add('visible');
            }
        });
    };

    CruzCanvasGallery.prototype.setupEventListeners = function () {
        var self = this;
        window.addEventListener('resize', function () {
            clearTimeout(self._rz);
            self._rz = setTimeout(function () { self.resetPosition(); self.initDraggable(); }, 120);
        });
        document.addEventListener('mouseleave', this.boundMouseLeave);
        this.viewport.addEventListener('mouseleave', this.boundMouseLeave);
        this.closeButton.addEventListener('click', function () { self.exitZoomMode(); });
        // Botones de zoom (data-cg-zoom="0.3|0.6|1.0|fit")
        this.controls.querySelectorAll('.cg-switch-button').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var v = btn.getAttribute('data-cg-zoom');
                if (v === 'fit') self.autoFitZoom(btn); else self.setZoom(parseFloat(v), btn);
            });
        });
        // Toggle de sonido (SÍ / NO)
        var soundBtn = document.getElementById('cg-sound');
        if (soundBtn) soundBtn.addEventListener('click', function () { self.toggleSound(); });
        this.updateSoundLabel();
        document.addEventListener('keydown', function (e) {
            if (self.zoomState.isActive) return;
            if (e.key === '1') self.setZoom(0.3, self.controls.querySelector('[data-cg-zoom="0.3"]'));
            else if (e.key === '2') self.setZoom(0.6, self.controls.querySelector('[data-cg-zoom="0.6"]'));
            else if (e.key === '3') self.setZoom(1.0, self.controls.querySelector('[data-cg-zoom="1.0"]'));
            else if (e.key === 'f' || e.key === 'F') self.autoFitZoom(self.controls.querySelector('[data-cg-zoom="fit"]'));
        });
    };

    CruzCanvasGallery.prototype.mount = function () {
        if (this.mounted || typeof gsap === 'undefined') return;
        this.mounted = true;
        this.computeGridSize();
        this.config.currentGap = this.calculateGapForZoom(this.config.currentZoom);
        this.generateGridItems();
        this.setupHint();
        gsap.set(this.viewport, { opacity: 0 });
        gsap.set(this.canvasWrapper, { scale: this.config.currentZoom });
        this.calculateGridDimensions(this.config.currentGap);
        var vw = window.innerWidth, vh = window.innerHeight;
        var cx = (vw - this.gridDimensions.scaledWidth) / 2, cy = (vh - this.gridDimensions.scaledHeight) / 2;
        gsap.set(this.canvasWrapper, { x: cx, y: cy });
        this.lastValidPosition.x = cx; this.lastValidPosition.y = cy;
        this.updatePercentageIndicator(this.config.currentZoom);
        var self = this;
        this.setupEventListeners();
        gsap.to(this.viewport, {
            duration: 0.5, opacity: 1, ease: 'power2.inOut',
            onComplete: function () {
                self.playIntroAnimation();
                setTimeout(function () { self.initDraggable(); self.setupViewportObserver(); }, 1400);
            }
        });
    };

    // ── Controlador para el switcher (java/trabajos.js) ──
    var instance = null;
    window.CruzCanvas = {
        activate: function () {
            if (!instance) instance = new CruzCanvasGallery();
            if (!instance.viewport) return;
            document.body.classList.add('cg-active');
            if (!instance.mounted) instance.mount();
            else { if (instance.draggable) instance.draggable.enable(); }
        },
        deactivate: function () {
            document.body.classList.remove('cg-active');
            if (instance) {
                if (instance.zoomState && instance.zoomState.isActive) instance.exitZoomMode();
                if (instance.draggable) instance.draggable.disable();
                instance.hideHint();
            }
        }
    };
})();
