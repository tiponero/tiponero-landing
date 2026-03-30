import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// ── Renderer ──
const canvas = document.getElementById("three-canvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ── Environment map for PBR / metallic reflections ──
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
pmremGenerator.dispose();

// ── Scene & Camera ──
const scene = new THREE.Scene();
scene.environment = envTexture;
const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);

// ── Lighting ──
// Low ambient so the model isn't washed out
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambient);

// Warm white key light — top-right
const keyLight = new THREE.PointLight(0xffffff, 1.2, 50);
keyLight.position.set(5, 4, 5);
scene.add(keyLight);

// Monero orange fill light — lower-left
const fillLight = new THREE.PointLight(0xff6600, 0.6, 50);
fillLight.position.set(-4, -2, 3);
scene.add(fillLight);

// Subtle rim light from behind
const rimLight = new THREE.PointLight(0xff6600, 0.3, 50);
rimLight.position.set(0, 1, -5);
scene.add(rimLight);

// ── Camera waypoints (one per snap section) ──
const waypoints = [
  // 0 — Hero: front face, slightly above and right
  { pos: [0, 0.5, 4.5], look: [0, 0, 0] },
  // 1 — Problem: 3/4 right, eye level
  { pos: [3.2, 0.3, 2.8], look: [0, 0, 0] },
  // 2 — How It Works: high left, looking down
  { pos: [-2.8, 3, 2.2], look: [0, -0.3, 0] },
  // 3 — Features: low front, looking up at coin
  { pos: [0.5, -2, 3.8], look: [0, 0.5, 0] },
  // 4 — Ethos: side profile (edge-on)
  { pos: [4.5, 0.2, 0], look: [0, 0, 0] },
  // 5 — Trust: back of coin, slightly above
  { pos: [-0.5, 1.2, -4], look: [0, 0, 0] },
  // 6 — CTA: pulled back from trust, slightly wider
  { pos: [0.3, 0.8, -5.5], look: [0, 0, 0] },
];

// Convert to Vector3s
const wpPos = waypoints.map((w) => new THREE.Vector3(...w.pos));
const wpLook = waypoints.map((w) => new THREE.Vector3(...w.look));

// Current interpolation targets
let targetPos = wpPos[0].clone();
let targetLook = wpLook[0].clone();
let currentLook = wpLook[0].clone();

camera.position.copy(wpPos[0]);
camera.lookAt(wpLook[0]);

// ── Load GLB model ──
let pivot = null;
let modelMaxDim = null;

function coinTargetSize() {
  return window.innerWidth < 768 ? 1.5 : 2.5;
}

const loader = new GLTFLoader();
loader.load("assets/models/monero.glb", (gltf) => {
  const coin = gltf.scene;

  // Compute bounding box to find center and size
  const box = new THREE.Box3().setFromObject(coin);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  // Offset the coin so its visual center sits at the pivot's origin
  coin.position.sub(center);

  // Create a pivot group at world origin
  pivot = new THREE.Group();
  pivot.add(coin);

  // Normalize scale — responsive to viewport width
  modelMaxDim = Math.max(size.x, size.y, size.z);
  pivot.scale.setScalar(coinTargetSize() / modelMaxDim);

  scene.add(pivot);
});

// ── Scroll tracking ──
const main = document.querySelector("main");

function getActiveSection() {
  const sections = main.querySelectorAll(".snap-section");
  const scrollTop = main.scrollTop;
  const viewHeight = main.clientHeight;
  let active = 0;
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].offsetTop <= scrollTop + viewHeight / 2) {
      active = i;
    }
  }
  return Math.min(active, waypoints.length - 1);
}

let currentWaypoint = 0;

// ── Rotation impulse system ──
const BASE_ROT = 0.003;
const ROT_DECAY = 0.99;
const FIRST_IMPULSE = 2 * Math.PI * (1 - ROT_DECAY); // 1 full spin (~0.063)
const OTHER_IMPULSE = Math.PI * (1 - ROT_DECAY);     // ~0.5 spin  (~0.031)
let rotExtra = 0;

main.addEventListener("scroll", () => {
  const idx = getActiveSection();
  if (idx !== currentWaypoint) {
    const prev = currentWaypoint;
    currentWaypoint = idx;
    targetPos.copy(wpPos[idx]);
    targetLook.copy(wpLook[idx]);

    // Fire rotation impulse (always positive — same direction as base spin)
    if (prev === 0 && idx === 1) {
      rotExtra += FIRST_IMPULSE;
    } else {
      rotExtra += OTHER_IMPULSE;
    }
  }
});

// ── Animation loop ──
const LERP_SPEED = 0.018; // slow cinematic ~3s convergence

function animate() {
  requestAnimationFrame(animate);

  // Auto-rotate + decaying impulse (always same direction)
  if (pivot) {
    pivot.rotation.y += BASE_ROT + rotExtra;
    rotExtra *= ROT_DECAY;
  }

  // Lerp camera position and lookAt target
  camera.position.lerp(targetPos, LERP_SPEED);
  currentLook.lerp(targetLook, LERP_SPEED);
  camera.lookAt(currentLook);

  renderer.render(scene, camera);
}

animate();

// ── Resize handler ──
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Recompute coin scale for responsive sizing
  if (pivot && modelMaxDim) {
    pivot.scale.setScalar(coinTargetSize() / modelMaxDim);
  }
});
