import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

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

const pmremGenerator = new THREE.PMREMGenerator(renderer);
const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
pmremGenerator.dispose();

const scene = new THREE.Scene();
scene.environment = envTexture;
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);

const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
keyLight.position.set(5, 4, 5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
fillLight.position.set(-4, -2, 3);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
rimLight.position.set(0, 2, -5);
scene.add(rimLight);

const waypoints = [
	{ pos: [0, 0.5, 4.5], look: [0, 0, 0] },

	{ pos: [3.2, 0.3, 2.8], look: [0, 0, 0] },

	{ pos: [-2.8, 3, 2.2], look: [0, -0.3, 0] },

	{ pos: [0.5, -2, 3.8], look: [0, 0.5, 0] },

	{ pos: [4.5, 0.2, 0], look: [0, 0, 0] },

	{ pos: [-0.5, 1.2, -4], look: [0, 0, 0] },

	{ pos: [0.3, 0.8, -5.5], look: [0, 0, 0] },
];

const wpPos = waypoints.map((w) => new THREE.Vector3(...w.pos));
const wpLook = waypoints.map((w) => new THREE.Vector3(...w.look));

function heroLookX() {
	return window.innerWidth >= 768 ? -1.2 : 0;
}

wpLook[0].x = heroLookX();

let targetPos = wpPos[0].clone();
let targetLook = wpLook[0].clone();
let currentLook = wpLook[0].clone();

camera.position.copy(wpPos[0]);
camera.lookAt(wpLook[0]);

let pivot = null;
let modelMaxDim = null;

function coinTargetSize() {
	return window.innerWidth < 768 ? 1.5 : 2.5;
}

function updateResponsiveWaypoints() {
	wpLook[0].x = heroLookX();
	if (currentWaypoint === 0) targetLook.x = wpLook[0].x;
}

const loader = new GLTFLoader();
loader.load("assets/models/monero.glb", (gltf) => {
	const coin = gltf.scene;

	const box = new THREE.Box3().setFromObject(coin);
	const center = box.getCenter(new THREE.Vector3());
	const size = box.getSize(new THREE.Vector3());

	coin.position.sub(center);

	coin.rotation.z = -15 * (Math.PI / 180);

	pivot = new THREE.Group();
	pivot.add(coin);

	modelMaxDim = Math.max(size.x, size.y, size.z);
	pivot.scale.setScalar(coinTargetSize() / modelMaxDim);

	scene.add(pivot);
});

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

const BASE_ROT = 0.003;
const ROT_DECAY = 0.99;
const FIRST_IMPULSE = 2 * Math.PI * (1 - ROT_DECAY);
const OTHER_IMPULSE = Math.PI * (1 - ROT_DECAY);
let rotExtra = 0;

main.addEventListener("scroll", () => {
	const idx = getActiveSection();
	if (idx !== currentWaypoint) {
		const prev = currentWaypoint;
		currentWaypoint = idx;
		targetPos.copy(wpPos[idx]);
		targetLook.copy(wpLook[idx]);

		if (prev === 0 && idx === 1) {
			rotExtra += FIRST_IMPULSE;
		} else {
			rotExtra += OTHER_IMPULSE;
		}
	}
});

const LERP_SPEED = 0.018;

function animate() {
	requestAnimationFrame(animate);

	if (pivot) {
		pivot.rotation.y += BASE_ROT + rotExtra;
		rotExtra *= ROT_DECAY;
	}

	camera.position.lerp(targetPos, LERP_SPEED);
	currentLook.lerp(targetLook, LERP_SPEED);
	camera.lookAt(currentLook);

	renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);

	if (pivot && modelMaxDim) {
		pivot.scale.setScalar(coinTargetSize() / modelMaxDim);
	}

	updateResponsiveWaypoints();
});
