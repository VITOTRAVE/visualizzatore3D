// Importazione delle librerie necessarie (Three.js e controlli)
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/loaders/GLTFLoader.js';

// Creazione della scena
const scene = new THREE.Scene();

// Creazione della camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// Creazione del renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xeeeeee);
document.getElementById('container').appendChild(renderer.domElement);

// Controlli orbitali
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Aggiunta della griglia
const gridHelper = new THREE.GridHelper(100, 20, 0x666666, 0x444444);
scene.add(gridHelper);

// Aggiunta delle luci
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// Scritta "Atom Lab CAD 3D"
const canvas = document.createElement("canvas");
canvas.width = 400;
canvas.height = 100;
const ctx = canvas.getContext("2d");
ctx.font = "bold 30px Arial";
ctx.fillStyle = "red";
ctx.strokeStyle = "white";
ctx.lineWidth = 5;
ctx.strokeText("Atom Lab CAD 3D", 20, 50);
ctx.fillText("Atom Lab CAD 3D", 20, 50);
const texture = new THREE.CanvasTexture(canvas);
const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
const sprite = new THREE.Sprite(spriteMaterial);
sprite.scale.set(10, 3, 1);
sprite.position.set(0, 8, 0);
scene.add(sprite);

// Cubo traslatore
const helperCube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
);
helperCube.position.set(5, 5, 0);
scene.add(helperCube);

function updateHelperCube() {
    helperCube.quaternion.copy(camera.quaternion);
}

// Funzione per il caricamento del modello 3D
function loadModel(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const contents = event.target.result;
        const fileName = file.name.toLowerCase();

        // Rimuove oggetti precedenti dalla scena
        scene.children = scene.children.filter(obj => !(obj.isMesh || obj.type === "Group"));

        if (fileName.endsWith('.glb') || fileName.endsWith('.gltf')) {
            const loader = new GLTFLoader();
            loader.parse(contents, '', function (gltf) {
                scene.add(gltf.scene);
            });
        } else if (fileName.endsWith('.stl')) {
            const loader = new STLLoader();
            const geometry = loader.parse(contents);
            geometry.computeVertexNormals();
            const material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
        } else if (fileName.endsWith('.obj')) {
            const loader = new OBJLoader();
            const text = new TextDecoder().decode(contents);
            const object = loader.parse(text);
            scene.add(object);
        } else {
            alert('Formato non supportato');
        }
    };
    reader.readAsArrayBuffer(file);
}

// Listener per il caricamento del file
document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        loadModel(file);
    }
});

// Animazione e rendering
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    updateHelperCube();
    renderer.render(scene, camera);
}
animate();

// Aggiornamento della finestra quando cambia la dimensione dello schermo
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Calcolo del preventivo
document.getElementById('submitButton').addEventListener('click', function () {
    const material = document.getElementById('material').value;
    const length = parseFloat(document.getElementById('length').value);
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const quantity = parseInt(document.getElementById('quantity').value);

    if (isNaN(length) || isNaN(width) || isNaN(height) || isNaN(quantity) || quantity <= 0) {
        alert("Inserisci valori validi per il calcolo.");
        return;
    }

    let volume = (length * width * height) / 1000; // Convertito in cm³
    const pricePerCm3 = {
        PLA: 0.10,
        ABS: 0.12,
        PETG: 0.15,
        Nylon: 0.20,
        Carbonio: 0.35,
        PEEK: 0.50,
        Metallo: 1.00
    };

    const estimatedPrice = (volume * pricePerCm3[material] * quantity).toFixed(2);
    alert(`ATTENZIONE: Il preventivo è solo approssimativo e dovrà essere verificato dai tecnici.\n\nPrezzo stimato: €${estimatedPrice}`);
});
