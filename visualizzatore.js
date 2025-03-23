// visualizzatore.js (con cubo traslatore fisso e sincronizzato con la camera)

let scene, camera, renderer, controls;
let cubeScene, cubeCamera, cubeRenderer;
let currentObject = null;
const urlParams = new URLSearchParams(window.location.search);
const lang = urlParams.get('lang') || 'it';

const texts = {
    it: {
        uploadLabel: "Carica il tuo modello 3D:",
        materialLabel: "Materiale:",
        finishLabel: "Finitura:",
        scaleLabel: "Scala:",
        quantityLabel: "Quantità:",
        emailLabel: "Email:",
        estimateLabel: "Richiedi preventivo",
        note: "Il preventivo è indicativo e verrà confermato dai nostri tecnici."
    },
    en: {
        uploadLabel: "Upload your 3D model:",
        materialLabel: "Material:",
        finishLabel: "Finish:",
        scaleLabel: "Scale:",
        quantityLabel: "Quantity:",
        emailLabel: "Email:",
        estimateLabel: "Request Quote",
        note: "The estimate is indicative and will be confirmed by our technicians."
    }
};

function setLabels() {
    document.getElementById("label-upload").textContent = texts[lang].uploadLabel;
    document.getElementById("label-material").textContent = texts[lang].materialLabel;
    document.getElementById("label-finish").textContent = texts[lang].finishLabel;
    document.getElementById("label-scale").textContent = texts[lang].scaleLabel;
    document.getElementById("label-quantity").textContent = texts[lang].quantityLabel;
    document.getElementById("label-email").textContent = texts[lang].emailLabel;
    document.getElementById("btn-estimate").textContent = texts[lang].estimateLabel;
    document.getElementById("note").textContent = texts[lang].note;
}

document.getElementById("language-select").addEventListener("change", function () {
    location.href = location.pathname + '?lang=' + this.value;
});

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 100);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const viewer = document.getElementById('viewer');
    if (viewer) viewer.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    const gridHelper = new THREE.GridHelper(200, 50);
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper);

    // Mini-cube scene in alto a destra
    cubeScene = new THREE.Scene();
    cubeCamera = new THREE.PerspectiveCamera(50, 1, 1, 1000);
    cubeCamera.up = camera.up; // stessa orientazione della camera principale
    cubeCamera.position.z = 5;

    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    const cubeMat = [
        new THREE.MeshBasicMaterial({ color: 0xff0000 }), // right
        new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // left
        new THREE.MeshBasicMaterial({ color: 0x0000ff }), // top
        new THREE.MeshBasicMaterial({ color: 0xffff00 }), // bottom
        new THREE.MeshBasicMaterial({ color: 0x00ffff }), // front
        new THREE.MeshBasicMaterial({ color: 0xff00ff })  // back
    ];
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    cubeScene.add(cubeMesh);

    cubeRenderer = new THREE.WebGLRenderer({ alpha: true });
    cubeRenderer.setSize(100, 100);
    cubeRenderer.domElement.style.position = "absolute";
    cubeRenderer.domElement.style.top = "10px";
    cubeRenderer.domElement.style.right = "10px";
    cubeRenderer.domElement.style.zIndex = "20";
    document.body.appendChild(cubeRenderer.domElement);

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);

    cubeCamera.quaternion.copy(camera.quaternion); // sincronia camera principale
    cubeRenderer.render(cubeScene, cubeCamera);
}

function centerObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    object.position.sub(center);

    const size = box.getSize(new THREE.Vector3());
    document.getElementById("dimX").value = size.x.toFixed(2);
    document.getElementById("dimY").value = size.y.toFixed(2);
    document.getElementById("dimZ").value = size.z.toFixed(2);
}

function loadModel(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const contents = event.target.result;
        const extension = file.name.split('.').pop().toLowerCase();

        if (currentObject) {
            scene.remove(currentObject);
        }

        try {
            switch (extension) {
                case 'stl':
                    const stlLoader = new THREE.STLLoader();
                    const geometry = stlLoader.parse(contents);
                    const material = new THREE.MeshNormalMaterial();
                    currentObject = new THREE.Mesh(geometry, material);
                    break;
                default:
                    alert('Formato non supportato');
                    return;
            }
            centerObject(currentObject);
            scene.add(currentObject);
        } catch (error) {
            alert('Errore nel caricamento del file: ' + error.message);
        }
    };

    reader.readAsArrayBuffer(file);
}

document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        loadModel(file);
    }
});

setLabels();
window.addEventListener('DOMContentLoaded', init);
