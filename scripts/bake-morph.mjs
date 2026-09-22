/**
 * Horneador de "morph targets" para el hero (hero-3d.js).
 *
 * Muestrea cada GLB sobre la MISMA grilla de la esfera (SphereGeometry(2,76,76))
 * y guarda las posiciones destino como un binario Float32 (N*3) en models/*.morph.bin.
 * El runtime solo baja ese .bin → cero raycasts / cero GLTFLoader en el navegador.
 *
 * Uso (desde la raíz del proyecto):
 *   npm i three@0.128.0            # una vez, en una carpeta temporal o aquí
 *   node scripts/bake-morph.mjs
 *
 * Si cambiás un GLB o su orientación (tilt/yaw) o escala (fit), reejecutá esto y
 * volvé a subir el .bin correspondiente. Los parámetros deben coincidir con los
 * usados al integrar (ver MODELS en java/hero-3d.js).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Debe coincidir con el runtime (SEG=76). El ruido solo afecta el radio, no la
// dirección, por eso dir[] es determinista.
const SEG = 76;
const sg = new THREE.SphereGeometry(2, SEG, SEG);
const p = sg.attributes.position;
const N = p.count;
const dir = [];
for (let i = 0; i < N; i++) {
  const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
  const l = Math.hypot(x, y, z) || 1;
  dir.push(new THREE.Vector3(x / l, y / l, z / l));
}

function bake(glb, tilt, yaw, fit, out) {
  const data = fs.readFileSync(path.join(ROOT, glb));
  const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  return new Promise((resolve, reject) => {
    new GLTFLoader().parse(ab, '', (gltf) => {
      const cont = new THREE.Object3D();
      cont.add(gltf.scene);
      cont.rotation.set(tilt, yaw, 0);
      cont.updateMatrixWorld(true);
      const meshes = [];
      gltf.scene.traverse(o => { if (o.isMesh && o.geometry) meshes.push(o); });
      const box = new THREE.Box3().setFromObject(cont);
      const size = new THREE.Vector3(), center = new THREE.Vector3();
      box.getSize(size); box.getCenter(center);
      const k = fit / (Math.max(size.x, size.y, size.z) || 1);
      cont.scale.setScalar(k);
      cont.position.set(-center.x * k, -center.y * k, -center.z * k);
      cont.updateMatrixWorld(true);
      const ray = new THREE.Raycaster();
      const O = new THREE.Vector3(0, 0, 0);
      const arr = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        ray.set(O, dir[i]);
        const hits = ray.intersectObjects(meshes, true);
        const r = hits.length ? hits[hits.length - 1].distance : 2;
        arr[i*3] = dir[i].x * r; arr[i*3+1] = dir[i].y * r; arr[i*3+2] = dir[i].z * r;
      }
      fs.writeFileSync(path.join(ROOT, out), Buffer.from(arr.buffer));
      console.log('OK', out, '·', (fs.statSync(path.join(ROOT, out)).size/1024|0) + 'KB');
      resolve();
    }, reject);
  });
}

// Mismos parámetros que MODELS en hero-3d.js:
await bake('models/gregos-face.glb', 0.18, 3 * Math.PI / 2, 4.0, 'models/face.morph.bin');
await bake('models/brain.glb',        0,   0,               3.9, 'models/brain.morph.bin');
console.log('Listo. Subí los .bin actualizados al host.');
