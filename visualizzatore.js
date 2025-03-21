import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';
import { OrbitControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/OBJLoader';
import { GLTFLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader';
import { CSS2DRenderer } from 'https://cdn.skypack.dev/three/examples/jsm/renderers/CSS2DRenderer';

let scene, camera, renderer, controls;
let currentModel;

init();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(100, 100, 100);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('container').appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  const light1 = new THREE.DirectionalLight(0xffffff, 1);
  light1.position.set(1, 1, 1).normalize();
  scene.add(light1);

  const light2 = new THREE.AmbientLight(0x888888);
  scene.add(light2);

  animate();

  document.getElementById('fileInput').addEventListener('change', handleFile);
  document.getElementById('submitButton').addEventListener('click', handleSubmit);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (currentModel) scene.remove(currentModel);

    if (ext === 'stl') {
      const loader = new STLLoader();
      const geometry = loader.parse(e.target.result);
      const material = new THREE.MeshStandardMaterial({ color: 0x0077be });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.geometry.computeBoundingBox();
      currentModel = mesh;
      scene.add(mesh);
    } else if (ext === 'obj') {
      const loader = new OBJLoader();
      const object = loader.parse(e.target.result);
      currentModel = object;
      scene.add(object);
    } else if (ext === 'glb' || ext === 'gltf') {
      const loader = new GLTFLoader();
      loader.parse(e.target.result, '', function (gltf) {
        currentModel = gltf.scene;
        scene.add(currentModel);
      });
    }
  };

  if (file.name.endsWith('.stl')) {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file);
  }
}

function handleSubmit() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const notes = document.getElementById('notes').value;
  const material = document.getElementById('material').value;
  const finish = document.getElementById('finish').value;
  const scale = parseFloat(document.getElementById('scale').value);
  const quantity = parseInt(document.getElementById('quantity').value);
  const length = parseFloat(document.getElementById('length').value);
  const width = parseFloat(document.getElementById('width').value);
  const height = parseFloat(document.getElementById('height').value);

  let volume = 0;
  if (length && width && height) {
    volume = (length * width * height) / 1000; // cm3
  }

  const pricePerCm3 = 0.10;
  const estimatedPrice = (volume * pricePerCm3 * quantity).toFixed(2);

  console.log('--- Preventivo Richiesto ---');
  console.log('Nome:', name);
  console.log('Email:', email);
  console.log('Note:', notes);
  console.log('Materiale:', material);
  console.log('Finitura:', finish);
  console.log('Scala:', scale);
  console.log('Quantità:', quantity);
  console.log('Volume stimato (cm3):', volume);
  console.log('Prezzo stimato (€):', estimatedPrice);
}