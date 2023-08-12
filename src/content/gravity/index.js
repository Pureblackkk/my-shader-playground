import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import FragmentShader from './frag.glsl';
import VertexShader from './vert.glsl';
import PositionShader from './position.glsl';
import VelocityShader from './velocity.glsl';
import { GPUComputationRenderer } from '../../libs/GPUComputationRenderer.js';
import ParticalImg from '../../imgs/particle.png';

let renderer, scene, camera, positionVariable, uniforms, simulator;

/**
 * Sets the simulation initial conditions
 */
function setInitialConditions(positionTexture, velocityTexture) {
    // Get the position and velocity arrays
    const position = positionTexture.image.data;
    const velocity = velocityTexture.image.data;

    // Fill the position and velocity arrays
    const nParticles = position.length / 4;

    for (let i = 0; i < nParticles; i++) {
        // Get a random point inside a sphere
        const distance = 10 * Math.pow(Math.random(), 1 / 3);
        const cos = 2 * Math.random() - 1;
	    const sin = Math.sqrt(1 - cos * cos);
	    const ang = 2 * Math.PI * Math.random();

        // Calculate the point x,y,z coordinates
        const particleIndex = 4 * i;
        position[particleIndex] = distance * sin * Math.cos(ang);
        position[particleIndex + 1] = distance * sin * Math.sin(ang);
        position[particleIndex + 2] = distance * cos;
        position[particleIndex + 3] = 1;

        // Start with zero initial velocity
        velocity[particleIndex] = 0;
        velocity[particleIndex + 1] = 0;
        velocity[particleIndex + 2] = 0;
        velocity[particleIndex + 3] = 1;
    }
}

/**
 * Return the requested simulation variable
 */
function getSimulationVariable(variableName, gpuSimulator) {
    for (let i = 0; i < gpuSimulator.variables.length; i++) {
        if (gpuSimulator.variables[i].name === variableName) {
            return gpuSimulator.variables[i];
        }
    }

    return null;
}

/**
 * Initializes and returns the GPU simulator
 */
function getSimulator(simSizeX, simSizeY, renderer) {
    // Create a new GPU simulator instance
    const gpuSimulator = new GPUComputationRenderer(simSizeX, simSizeY, renderer);

    // Create the position and the velocity textures
    const positionTexture = gpuSimulator.createTexture();
    const velocityTexture = gpuSimulator.createTexture();

    // Fill the texture data arrays with the simulation initial conditions
    setInitialConditions(positionTexture, velocityTexture);

    // Add the position and velocity variables to the simulator
    const positionVariable = gpuSimulator.addVariable('u_positionTexture', PositionShader, positionTexture);
    const velocityVariable = gpuSimulator.addVariable('u_velocityTexture', VelocityShader, velocityTexture);

    // Specify the variable dependencies
    gpuSimulator.setVariableDependencies(positionVariable, [ positionVariable, velocityVariable ]);
    gpuSimulator.setVariableDependencies(velocityVariable, [ positionVariable, velocityVariable ]);

    // Add the position uniforms
    const positionUniforms = positionVariable.material.uniforms;
    positionUniforms.u_dt = {
        type : "f",
        value : 1.0,
    };

    // Add the velocity uniforms
    var velocityUniforms = velocityVariable.material.uniforms;
    velocityUniforms.u_dt = {
        type : "f",
        value : positionUniforms.u_dt.value,
    };

    // Initialize the GPU simulator
    var error = gpuSimulator.init();

    if (error !== null) {
        console.error('error', error);
    }

    return gpuSimulator;
}

/**
 * Updates the renderer size and the camera aspect ratio when the window is resized
 */
function onWindowResize(event) {
    // Update the renderer
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Update the camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

/**
 * Init function
 */
function init() {
    // Initial three renderer
    renderer = new THREE.WebGLRenderer({antialias : true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(new THREE.Color(0, 0, 0));


    // Add renderer
    const container = document.getElementById('glContainer');
    container.appendChild(renderer.domElement);

    // Intial scene
    scene = new THREE.Scene();

    // Initialize the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.z = 10;

    // Initialize the camera controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;

    // Initialize the simulator
    const isDesktop = Math.min(window.innerWidth, window.innerHeight) > 450;
    const simSizeX = isDesktop ? 64 : 32;
    const simSizeY = isDesktop ? 64 : 32;
    simulator = getSimulator(simSizeX, simSizeY, renderer);
    positionVariable = getSimulationVariable("u_positionTexture", simulator);

    // Create particles geometry
    const geometry = new THREE.Points(geometry, material);

    // Add the particle attributes to the geometry
    const nParticles = simSizeX * simSizeY;
    const indices = new Float32Array(nParticles);
    const positions = new Float32Array(3 * nParticles);

    geometry.setAttribute("a_index", new THREE.BufferAttribute(indices, 1));
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    for (let i = 0; i < nParticles; i++) {
        indices[i] = i;
    }

    // Define the particle shader uniforms
    uniforms = {
        u_width : {
            type : 'f',
            value : simSizeX,
        },
        u_height : {
            type : 'f',
            value : simSizeY,
        },
        u_particleSize : {
            type : 'f',
            value : 50 * window.devicePixelRatio,
        },
        u_positionTexture : {
            type : 't',
            value : null,
        },
        u_texture : {
            type : 't',
            value : new THREE.TextureLoader().load(ParticalImg),
        },
    };
    
    // Create the particles shader material
    const material = new THREE.ShaderMaterial({
        uniforms : uniforms,
        vertexShader : VertexShader,
        fragmentShader : FragmentShader,
        depthTest : false,
        lights : false,
        transparent : true,
        blending : THREE.AdditiveBlending,
    });

    // Create the particles and add them to the scene
    const particles = new THREE.Mesh(geometry, material);
    scene.add(particles);

    // Add the event listeners
    window.addEventListener("resize", onWindowResize, false); 
}

/**
 * render the frame
 */
function render() {
    // Run several iterations per frame
    for (var i = 0; i < 1; i++) {
        simulator.compute();
    }

    // Update the uniforms
    uniforms.u_positionTexture.value = simulator.getCurrentRenderTarget(positionVariable).texture;

    // Render the particles on the screen
    renderer.render(scene, camera);
}

/**
 * Animates the frame
 */
function animate() {
    // requestAnimationFrame(animate);
    render();
}

init();
animate();