// Creazione della scena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controlli di navigazione
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI;
camera.position.z = 5;

// Luce per illuminare il modello
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

// Funzione per caricare modelli 3D
function loadModel(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const contents = event.target.result;
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.glb') || fileName.endsWith('.gltf')) {
            const loader = new THREE.GLTFLoader();
            loader.parse(contents, '', function (gltf) {
                scene.clear();
                scene.add(gltf.scene);
            });
        } else if (fileName.endsWith('.stl')) {
            const loader = new THREE.STLLoader();
            const geometry = loader.parse(contents);
            const material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
            const mesh = new THREE.Mesh(geometry, material);
            scene.clear();
            scene.add(mesh);
        } else if (fileName.endsWith('.obj')) {
            const loader = new THREE.OBJLoader();
            const text = new TextDecoder().decode(contents);
            const object = loader.parse(text);
            scene.clear();
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

// Funzione per misurare la distanza tra due punti
let isMeasuring = false;
let points = [];

document.getElementById('measureBtn').addEventListener('click', function () {
    isMeasuring = !isMeasuring;
    points = [];
});

document.addEventListener('click', function (event) {
    if (!isMeasuring) return;

    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        points.push(intersects[0].point);
        if (points.length === 2) {
            const distance = points[0].distanceTo(points[1]);
            alert(`Distanza: ${distance.toFixed(2)} unità`);
            points = [];
        }
    }
});

// Caricare modello da GrabCAD
document.getElementById('loadGrabcad').addEventListener('click', async function() {
    const url = document.getElementById('grabcadUrl').value;
    if (!url.includes('grabcad.com')) {
        alert('Inserisci un URL valido di GrabCAD.');
        return;
    }

    try {
        const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`);
        const blob = await response.blob();
        const fileUrl = URL.createObjectURL(blob);

        if (url.endsWith('.stl') || url.endsWith('.obj')) {
            loadModelFromUrl(fileUrl);
        }
    } catch (error) {
        console.error("Errore nel download:", error);
    }
});

// Esportare modello in STL, OBJ o STEP
document.getElementById('exportModel').addEventListener('click', function() {
    const format = document.getElementById('exportFormat').value;
    alert(`Esportazione in formato ${format} non implementata ancora!`);
});

// Funzione di rendering
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
