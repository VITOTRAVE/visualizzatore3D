// visualizzatore.js (con invio file STL in allegato)

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
        nameLabel: "Nome e Cognome:",
        phoneLabel: "Telefono:",
        emailLabel: "Email:",
        estimateLabel: "Invia la tua richiesta",
        note: "Il preventivo è indicativo e verrà confermato dai nostri tecnici."
    },
    en: {
        uploadLabel: "Upload your 3D model:",
        materialLabel: "Material:",
        finishLabel: "Finish:",
        scaleLabel: "Scale:",
        quantityLabel: "Quantity:",
        nameLabel: "Full Name:",
        phoneLabel: "Phone:",
        emailLabel: "Email:",
        estimateLabel: "Submit your request",
        note: "The estimate is indicative and will be confirmed by our technicians."
    }
};

function setLabels() {
    document.getElementById("label-upload").textContent = texts[lang].uploadLabel;
    document.getElementById("label-material").textContent = texts[lang].materialLabel;
    document.getElementById("label-finish").textContent = texts[lang].finishLabel;
    document.getElementById("label-scale").textContent = texts[lang].scaleLabel;
    document.getElementById("label-quantity").textContent = texts[lang].quantityLabel;
    document.getElementById("label-name").textContent = texts[lang].nameLabel;
    document.getElementById("label-phone").textContent = texts[lang].phoneLabel;
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

    // Mini-cube scene
    cubeScene = new THREE.Scene();
    cubeCamera = new THREE.PerspectiveCamera(50, 1, 1, 1000);
    cubeCamera.up = camera.up;
    cubeCamera.position.z = 5;

    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    const cubeMat = [
        new THREE.MeshBasicMaterial({ color: 0xff0000 }),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
        new THREE.MeshBasicMaterial({ color: 0x0000ff }),
        new THREE.MeshBasicMaterial({ color: 0xffff00 }),
        new THREE.MeshBasicMaterial({ color: 0x00ffff }),
        new THREE.MeshBasicMaterial({ color: 0xff00ff })
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
    cubeCamera.quaternion.copy(camera.quaternion);
    cubeRenderer.render(cubeScene, cubeCamera);
}

function centerObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    object.position.sub(center);

    const size = box.getSize(new THREE.Vector3());
    const unit = document.getElementById("unitSelect").value;
    let factor = 1;
    if (unit === "cm") factor = 0.1;
    if (unit === "inch") factor = 0.03937;

    document.getElementById("dimX").value = (size.x * factor).toFixed(2);
    document.getElementById("dimY").value = (size.y * factor).toFixed(2);
    document.getElementById("dimZ").value = (size.z * factor).toFixed(2);
}

function loadModel(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const contents = event.target.result;
        const extension = file.name.split('.').pop().toLowerCase();

        if (currentObject) scene.remove(currentObject);

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

document.getElementById('orderForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('fileInput');
    if (!fileInput.files.length) {
        alert("Devi caricare un file per inviare l'ordine!");
        return;
    }

    const form = document.getElementById('orderForm');
    const formData = new FormData(form);
    formData.append("file", fileInput.files[0]);

    fetch("https://script.google.com/macros/s/AKfycbwpM62AiOWS1PamdGR-K9edfQDv7MuUh3JdaHyfsqZPNYUqGu_RpoGnQBR8BR9NjxV4gg/exec", {
        method: "POST",
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        document.getElementById('confirmation').style.display = 'block';
        console.log("Successo:", data);
    })
    .catch(error => {
        alert("Errore nell'invio dell'ordine");
        console.error("Errore:", error);
    });
});

setLabels();
window.addEventListener('DOMContentLoaded', init);
