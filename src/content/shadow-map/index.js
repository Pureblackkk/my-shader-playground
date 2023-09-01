import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import FragmentShader from './frag.glsl';
import VertexShader from './vert.glsl';

let renderer, scene, camera, uniforms, material;

function init() {
    console.log('qq');
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
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    camera.position.y = 30;

    // Initialize the camera controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;

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
        u_light: {
            type: 'v3',
            value: new THREE.Vector3(10, 10, 10),
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
    });

    addMeshToScene();

    // Add axes helper
    const axesHelper = new THREE.AxesHelper( 50 );
    scene.add( axesHelper );

    // Add the event listeners
    window.addEventListener("resize", onWindowResize, false);
    renderer.domElement.addEventListener("mousemove", onMouseMove, false);
    renderer.domElement.addEventListener("touchstart", onTouchMove, false);
    renderer.domElement.addEventListener("touchmove", onTouchMove, false);
}

function addMeshToScene() {
    // Create object
    const objGeometry = new THREE.TorusKnotGeometry(6.5, 2.3, 256, 32);
    const objMesh = new THREE.Mesh(objGeometry, material);
    
    // Create plane
    const plane = new THREE.PlaneGeometry(500, 500);
    const planeMesh = new THREE.Mesh(plane, material);
    
    scene.add(objMesh);
    scene.add(planeMesh);

    planeMesh.position.y = -20;
    planeMesh.rotateX(-90);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    renderer.render(scene, camera);
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

function onWindowResize(event) {
    // Update the renderer
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Update the camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update the resolution uniform
    uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight).multiplyScalar(window.devicePixelRatio);
}

window.onload = function() {
	init();
    animate();
};
