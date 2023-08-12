import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import FragmentShader from './frag.glsl';
import VertexShader from './vert.glsl';

let renderer, scene, camera, clock, uniforms, material, mesh, geometry;

function init() {
    renderer = new THREE.WebGLRenderer({
        antialias : true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0, 0, 0));

    // Add renderer
    const container = document.getElementById('glContainer');
    container.appendChild(renderer.domElement);

    // Initialize the scene
    scene = new THREE.Scene();

    // Initialize the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.z = 30;

    // Initialize the camera controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;

    // Initialize the clock
    clock = new THREE.Clock(true);

    // Define the shader uniforms
    uniforms = {
        u_time : {
            type: 'f',
            value: 0.0
        },
        u_frame : {
            type: 'f',
            value: 0.0
        },
        u_resolution : {
            type: 'v2',
            value: new THREE.Vector2(window.innerWidth, window.innerHeight)
                    .multiplyScalar(window.devicePixelRatio)
        },
        u_camera: {
        },
        u_mouse: {
            type: "v2",
            value: new THREE.Vector2(0.7 * window.innerWidth, window.innerHeight)
                    .multiplyScalar(window.devicePixelRatio)
        },
    };

    // Create the shader material
    material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: VertexShader,
        fragmentShader: FragmentShader,
        side: THREE.DoubleSide,
        transparent: true,
        extensions: {
            derivatives : true
        },
    });

    // Create the mesh and add it to the scene
    addMeshToScene();

    // Add the event listeners
    window.addEventListener("resize", onWindowResize, false);
    renderer.domElement.addEventListener("mousemove", onMouseMove, false);
    renderer.domElement.addEventListener("touchstart", onTouchMove, false);
    renderer.domElement.addEventListener("touchmove", onTouchMove, false);
}

function addMeshToScene() {
    // Remove any previous mesh from the scene
    if (mesh) {
        scene.remove(mesh);
    }

    geometry = new THREE.TorusKnotGeometry(6.5, 2.3, 256, 32);
    // Create the mesh and add it to the scene
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    uniforms.u_time.value = clock.getElapsedTime();
    uniforms.u_frame.value += 1.0;
    renderer.render(scene, camera);
}

function onWindowResize(event) {
    // Update the renderer
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Update the camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update the resolution uniform
    uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight).multiplyScalar(window.devicePixelRatio);
}

function onMouseMove(event) {
    // Update the mouse uniform
    uniforms.u_mouse.value.set(event.pageX, window.innerHeight - event.pageY).multiplyScalar(
            window.devicePixelRatio);
}

function onTouchMove(event) {
    // Update the mouse uniform
    uniforms.u_mouse.value.set(event.touches[0].pageX, window.innerHeight - event.touches[0].pageY).multiplyScalar(
            window.devicePixelRatio);
}

window.onload = function() {
	init();
    animate();
};


