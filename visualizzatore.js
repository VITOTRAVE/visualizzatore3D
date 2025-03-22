// visualizzatore.js (versione aggiornata con cubo, griglia e bilingua)

let scene, camera, renderer, controls;
let currentObject = null;
const lang = document.documentElement.lang || 'it';

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
    document.getElementById('viewer').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    const gridHelper = new THREE.GridHelper(200, 50);
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function centerObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    object.position.sub(center);
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
                case 'obj':
                    const objLoader = new THREE.OBJLoader();
                    currentObject = objLoader.parse(new TextDecoder().decode(contents));
                    break;
                case 'gltf':
                case 'glb':
                    const gltfLoader = new THREE.GLTFLoader();
                    gltfLoader.parse(contents, '', (gltf) => {
                        currentObject = gltf.scene;
                        centerObject(currentObject);
                        scene.add(currentObject);
                    });
                    return;
                case 'fbx':
                    const fbxLoader = new THREE.FBXLoader();
                    currentObject = fbxLoader.parse(contents);
                    break;
                case '3mf':
                    const mfLoader = new THREE.ThreeMFLoader();
                    currentObject = mfLoader.parse(contents);
                    break;
                case 'svg':
                    const svgLoader = new THREE.SVGLoader();
                    currentObject = svgLoader.parse(new TextDecoder().decode(contents));
                    break;
                case 'ply':
                    const plyLoader = new THREE.PLYLoader();
                    const plyGeometry = plyLoader.parse(contents);
                    const plyMaterial = new THREE.MeshNormalMaterial();
                    currentObject = new THREE.Mesh(plyGeometry, plyMaterial);
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

    if (["obj", "svg"].includes(file.name.split('.').pop().toLowerCase())) {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        loadModel(file);
    }
});

setLabels();
init();
