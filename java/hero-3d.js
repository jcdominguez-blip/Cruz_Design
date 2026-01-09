import * as THREE from 'three';

const container = document.getElementById('hero-3d-background');
if (container) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 150, 700);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Geometría de precisión técnica
    const geometry = new THREE.PlaneGeometry(3000, 2000, 75, 75);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.08 
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2.2;
    scene.add(mesh);

    const originalZ = geometry.attributes.position.array.slice();
    let mouseX = 0, mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 1.5;
        mouseY = (e.clientY - window.innerHeight / 2) * 1.5;
    });

    function animate() {
        requestAnimationFrame(animate);
        const pos = geometry.attributes.position.array;
        const time = Date.now() * 0.0015;

        for (let i = 0; i < pos.length; i += 3) {
            const x = pos[i];
            const y = pos[i+1];
            const dist = Math.sqrt((x - mouseX)**2 + (y + mouseY)**2);
            const wave = Math.sin(dist * 0.01 - time) * 40 * Math.max(0, 1 - dist/1000);
            pos[i+2] = originalZ[i+2] + wave;
        }

        geometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}