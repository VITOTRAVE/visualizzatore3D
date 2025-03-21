// === Inizializzazione scena ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xeeeeee);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === Controlli orbitali ===
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = true;
controls.maxPolarAngle = Math.PI;
camera.position.set(0, 5, 10);

// === Luci ===
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5).normalize();
scene.add(dirLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// === Griglia a terra ===
const gridHelper = new THREE.GridHelper(100, 20, 0x666666, 0x444444);
scene.add(gridHelper);

// === Scritta "Atom Lab CAD 3D" fissa in alto a sinistra ===
const canvasText = document.createElement("canvas");
canvasText.width = 512;
canvasText.height = 128;
const ctx = canvasText.getContext("2d");
ctx.font = "bold 40px Arial";
ctx.fillStyle = "red";
ctx.strokeStyle = "white";
ctx.lineWidth = 6;
ctx.strokeText("Atom Lab CAD 3D", 20, 70);
ctx.fillText("Atom Lab CAD 3D", 20, 70);
const texture = new THREE.CanvasTexture(canvasText);
const materialText = new THREE.SpriteMaterial({ map: texture });
const textSprite = new THREE.Sprite(materialText);
textSprite.scale.set(10, 2.5, 1);
scene.add(textSprite);

// === Cubo traslatore in basso a destra ===
const miniScene = new THREE.Scene();
const miniCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
miniCamera.position.set(2, 2, 2);
miniCamera.lookAt(0, 0, 0);
const miniRenderer = new THREE.WebGLRenderer({ alpha: true });
miniRenderer.setSize(150, 150);
miniRenderer.domElement.style.position = 'fixed';
miniRenderer.domElement.style.bottom = '10px';
miniRenderer.domElement.style.right = '10px';
miniRenderer.domElement.style.zIndex = '1000';
document.body.appendChild(miniRenderer.domElement);
const miniControls = new THREE.OrbitControls(miniCamera, miniRenderer.domElement);
miniControls.enablePan = false;
miniControls.enableZoom = false;
const helperCube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 'gray', wireframe: false })
);
miniScene.add(helperCube);
miniScene.add(new THREE.AmbientLight(0xffffff, 0.5));
const miniLight = new THREE.DirectionalLight(0xffffff, 1);
miniLight.position.set(3, 3, 3);
miniScene.add(miniLight);

// === UI dinamica ===
const uiPanel = document.createElement('div');
uiPanel.style.position = 'fixed';
uiPanel.style.top = '10px';
uiPanel.style.right = '10px';
uiPanel.style.background = 'rgba(255,255,255,0.95)';
uiPanel.style.padding = '10px';
uiPanel.style.zIndex = '999';
uiPanel.style.borderRadius = '8px';
uiPanel.style.maxWidth = '300px';
uiPanel.style.fontFamily = 'Arial';
uiPanel.innerHTML = `
  <input type="file" id="fileInput" accept=".stl,.obj" /><br/><br/>
  <label>Materiale:</label>
  <select id="materialSelect">
    <option>PLA</option>
    <option>ABS</option>
    <option>PA12 Carbon</option>
    <option>Alluminio</option>
    <option>Acciaio</option>
  </select><br/>
  <label>Finitura:</label>
  <select id="finishSelect">
    <option>Standard</option>
    <option>Lucidata</option>
    <option>Sabbiata</option>
  </select><br/>
  <label>Scala (%):</label>
  <input type="number" id="scaleInput" value="100"/><br/>
  <label>Quantità:</label>
  <input type="number" id="qtyInput" value="1"/><br/>
  <div id="output" style="margin-top:10px; font-size:14px;"></div>
  <hr/>
  <input type="text" id="nameInput" placeholder="Nome" /><br/>
  <input type="email" id="emailInput" placeholder="Email" /><br/>
  <input type="tel" id="phoneInput" placeholder="Telefono" /><br/>
  <textarea id="noteInput" placeholder="Note" rows="2"></textarea><br/>
  <button onclick="sendOrder()">Invia richiesta</button>
`;
document.body.appendChild(uiPanel);

// === Variabili ===
let currentMesh = null;
const PRICE_CM3 = 0.72;

// === Caricamento modelli ===
document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        if (currentMesh) scene.remove(currentMesh);

        const contents = e.target.result;
        const name = file.name.toLowerCase();

        if (name.endsWith('.stl')) {
            const loader = new THREE.STLLoader();
            const geometry = loader.parse(contents);
            const material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
            currentMesh = new THREE.Mesh(geometry, material);
            scene.add(currentMesh);
            computeVolume(geometry);
        } else if (name.endsWith('.obj')) {
            const loader = new THREE.OBJLoader();
            const text = new TextDecoder().decode(contents);
            const object = loader.parse(text);
            currentMesh = object;
            scene.add(object);
            const geometry = object.children[0]?.geometry;
            if (geometry) computeVolume(geometry);
        } else {
            alert('Formato non supportato');
        }
    };
    reader.readAsArrayBuffer(file);
});

// === Volume ===
function computeVolume(geometry) {
    let pos = geometry.attributes.position.array;
    let volume = 0;
    for (let i = 0; i < pos.length; i += 9) {
        const ax = pos[i], ay = pos[i+1], az = pos[i+2];
        const bx = pos[i+3], by = pos[i+4], bz = pos[i+5];
        const cx = pos[i+6], cy = pos[i+7], cz = pos[i+8];
        volume += signedVolumeOfTriangle(ax, ay, az, bx, by, bz, cx, cy, cz);
    }
    volume = Math.abs(volume) / 1000; // mm³ to cm³
    const scale = parseFloat(document.getElementById("scaleInput").value) / 100;
    const qty = parseInt(document.getElementById("qtyInput").value);
    const scaledVol = volume * Math.pow(scale, 3);
    const price = scaledVol * PRICE_CM3;
    document.getElementById("output").innerHTML =
        `Volume: ${scaledVol.toFixed(2)} cm³<br/>` +
        `Prezzo unitario: €${price.toFixed(2)}<br/>` +
        `Totale: €${(price * qty).toFixed(2)}`;
}

function signedVolumeOfTriangle(ax, ay, az, bx, by, bz, cx, cy, cz) {
    return (1.0 / 6.0) * (
        ax * (by * cz - bz * cy) -
        ay * (bx * cz - bz * cx) +
        az * (bx * cy - by * cx)
    );
}

// === Invio dati ===
function sendOrder() {
    const data = {
        nome: document.getElementById('nameInput').value,
        email: document.getElementById('emailInput').value,
        telefono: document.getElementById('phoneInput').value,
        note: document.getElementById('noteInput').value,
        materiale: document.getElementById('materialSelect').value,
        finitura: document.getElementById('finishSelect').value,
        scala: document.getElementById('scaleInput').value,
        quantità: document.getElementById('qtyInput').value,
        output: document.getElementById('output').innerText
    };

    console.log("Dati inviati:", data);
    alert("Richiesta inviata! Riceverai una risposta entro 24 ore.");
    // Qui puoi collegare a un backend o a un servizio come Zapier
}

// === Animazione ===
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    miniControls.update();
    miniRenderer.render(miniScene, miniCamera);

    // Scritta fissa nella vista
    const vector = new THREE.Vector3(-4, 4, 0);
    textSprite.position.copy(vector.applyMatrix4(camera.matrixWorld));
    textSprite.quaternion.copy(camera.quaternion);
}
animate();

// === Resize ===
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});