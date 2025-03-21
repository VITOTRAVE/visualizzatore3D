
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xeeeeee);
document.getElementById('container').appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
camera.position.set(0, 5, 10);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Grid
const gridHelper = new THREE.GridHelper(100, 20, 0x666666, 0x444444);
scene.add(gridHelper);

// Fixed Text "Atom Lab CAD 3D"
const canvas = document.createElement("canvas");
canvas.width = 512;
canvas.height = 128;
const ctx = canvas.getContext("2d");
ctx.font = "bold 40px Arial";
ctx.fillStyle = "red";
ctx.strokeStyle = "white";
ctx.lineWidth = 6;
ctx.strokeText("Atom Lab CAD 3D", 20, 70);
ctx.fillText("Atom Lab CAD 3D", 20, 70);

const texture = new THREE.CanvasTexture(canvas);
const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
const textSprite = new THREE.Sprite(spriteMaterial);
textSprite.scale.set(20, 5, 1);
scene.add(textSprite);

// ViewCube (fixed in screen corner)
const cubeScene = new THREE.Scene();
const cubeCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
const cubeRenderer = new THREE.WebGLRenderer({ alpha: true });
cubeRenderer.setSize(150, 150);
cubeRenderer.domElement.style.position = 'absolute';
cubeRenderer.domElement.style.bottom = '10px';
cubeRenderer.domElement.style.right = '10px';
cubeRenderer.domElement.style.zIndex = '100';
document.body.appendChild(cubeRenderer.domElement);

const viewCube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshNormalMaterial({ wireframe: false })
);
cubeScene.add(viewCube);
cubeCamera.position.set(3, 3, 3);
cubeCamera.lookAt(0, 0, 0);

// Load 3D model
function loadModel(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const contents = event.target.result;
        const fileName = file.name.toLowerCase();

        scene.children = scene.children.filter(obj =>
            !(obj.isMesh || obj.type === "Group")
        );
        scene.add(gridHelper);
        scene.add(textSprite);

        if (fileName.endsWith('.stl')) {
            const loader = new STLLoader();
            const geometry = loader.parse(contents);
            const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
        } else if (fileName.endsWith('.obj')) {
            const loader = new OBJLoader();
            const text = new TextDecoder().decode(contents);
            const object = loader.parse(text);
            scene.add(object);
        } else if (fileName.endsWith('.glb') || fileName.endsWith('.gltf')) {
            const loader = new GLTFLoader();
            loader.parse(contents, '', function (gltf) {
                scene.add(gltf.scene);
            });
        } else {
            alert('Formato non supportato');
        }
    };
    reader.readAsArrayBuffer(file);
}

document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        loadModel(file);
    }
});

// Rendering loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    cubeRenderer.render(cubeScene, cubeCamera);
}
animate();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Submit quote
document.getElementById('submitButton').addEventListener('click', function () {
    const material = document.getElementById('material').value;
    const length = parseFloat(document.getElementById('length').value);
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const quantity = parseInt(document.getElementById('quantity').value);

    let volume = (length * width * height) / 1000;
    const pricePerCm3 = {
        PLA: 0.10, ABS: 0.12, PETG: 0.15, Nylon: 0.20, Carbonio: 0.35, PEEK: 0.50, Metallo: 1.00
    };
    const estimatedPrice = (volume * pricePerCm3[material] * quantity).toFixed(2);

    alert(`ATTENZIONE: Il preventivo è solo approssimativo e dovrà essere verificato dai tecnici.\n\nPrezzo stimato: €${estimatedPrice}`);
});
