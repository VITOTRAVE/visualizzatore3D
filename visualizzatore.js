import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';
import { OrbitControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/OBJLoader';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.146/examples/jsm/loaders/GLTFLoader.js';

// Creazione della scena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Imposta lo sfondo e la dimensione del renderer
renderer.setClearColor(0xeeeeee);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Controlli di navigazione
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = true;
controls.maxPolarAngle = Math.PI;
camera.position.set(0, 5, 10);

// Luci per illuminare la scena
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// ✅ Aggiunta della griglia di sfondo
const gridHelper = new THREE.GridHelper(100, 20, 0x666666, 0x444444);
scene.add(gridHelper);

// ✅ Aggiunta della scritta "Atom Lab CAD 3D"
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
const textMaterial = new THREE.SpriteMaterial({ map: texture });
const textSprite = new THREE.Sprite(textMaterial);
textSprite.scale.set(10, 3, 1);
textSprite.position.set(0, 8, 0);
scene.add(textSprite);

// ✅ Aggiunta del cubo traslatore
const helperCube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
);
helperCube.position.set(5, 5, 0);
scene.add(helperCube);

// Funzione per sincronizzare il cubo con la rotazione della camera
function updateHelperCube() {
    helperCube.quaternion.copy(camera.quaternion);
}

// ✅ Funzione per caricare modelli 3D
function loadModel(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const contents = event.target.result;
        const fileName = file.name.toLowerCase();

        // Rimuove solo i modelli esistenti senza eliminare le luci
        scene.children = scene.children.filter(obj => obj.type !== "Mesh" && obj.type !== "Group");

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

// Caricamento di file dal computer
document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        loadModel(file);
    }
});

// ✅ Funzione di rendering
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    updateHelperCube();
    renderer.render(scene, camera);
}
animate();

// Assicura che il visualizzatore si adatti alla finestra quando viene ridimensionata
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ✅ Funzione per il preventivo con messaggio di avviso
function handleSubmit() {
    const material = document.getElementById('material').value;
    const length = parseFloat(document.getElementById('length').value);
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const quantity = parseInt(document.getElementById('quantity').value);

    let volume = (length * width * height) / 1000; // cm3

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

    console.log('Materiale:', material);
    console.log('Quantità:', quantity);
    console.log('Volume stimato (cm3):', volume);
    console.log('Prezzo stimato (€):', estimatedPrice);
}

document.getElementById('submitButton').addEventListener('click', handleSubmit);
