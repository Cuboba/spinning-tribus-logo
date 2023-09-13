import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as lil from 'lil-gui'
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';

/**
 * Base
 */
// Debug
const gui = new lil.GUI({closed: 'true'})
gui.show( gui._hidden );

// axes helper
const axesHelper = new THREE.AxesHelper(2)

// show debug on key press
window.addEventListener('keydown', (event) => 
    {
    if (event.isComposing) 
    {
      return
    }
    gui.show();  
    scene.add(axesHelper);
    }
  )

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()



/**
 * loaders
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null

/**
 * Model
 */


const tribusLogo = new THREE.Group();

gltfLoader.load(
    '/models/tribusLogo1.glb',
    (gltf) =>
    {
        tribusLogo.add(gltf.scene)        
    }
)

scene.add(tribusLogo)



let startingRotation = {x: 0, y:0, z:Math.PI * 0.5};

let logoRotation = {x:startingRotation.x, y:startingRotation.y, z:startingRotation.z};

let rotationSpeed = {x:0.005, y:0.005, z:0.005};

gui.add(rotationSpeed, 'x').min(- 0.1).max(0.1).step(0.001).name('Rotation Speed X');
gui.add(rotationSpeed, 'y').min(- 0.1).max(0.1).step(0.001).name('Rotation Speed Y');
gui.add(rotationSpeed, 'z').min(- 0.1).max(0.1).step(0.001).name('Rotation Speed Z');


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2)
scene.add(ambientLight)

gui.add(ambientLight, 'intensity').min(0).max(8).step(0.1).name('Ambient Light Intensity');

const directionalLight = new THREE.DirectionalLight(0xffffff, 0)
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

gui.add(directionalLight, 'intensity').min(0).max(8).step(0.1).name('Directional Light Intensity');

const rectangleLight = new THREE.RectAreaLight(0xffffff, 3, 3, 1);
rectangleLight.position.set(0,0,3);
rectangleLight.rotation.x = 0;
rectangleLight.rotation.y = 0;
rectangleLight.rotation.z = 0;
scene.add(rectangleLight);

// helper
const rectLightHelper = new RectAreaLightHelper( rectangleLight );
// rectangleLight.add( rectLightHelper );

gui.add(rectangleLight, 'intensity').min(0).max(20).step(0.1).name('Rectangle Light Intensity');
gui.add(rectangleLight.position, 'x').min(-10).max(10).step(0.1).name('Rectangle Light PosX');
gui.add(rectangleLight.position, 'y').min(-10).max(10).step(0.1).name('Rectangle Light PosY');
gui.add(rectangleLight.position, 'z').min(-10).max(10).step(0.1).name('Rectangle Light PosZ');
gui.add(rectangleLight.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.1).name('Rectangle Light RotX');
gui.add(rectangleLight.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.1).name('Rectangle Light RotY');
gui.add(rectangleLight.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.1).name('Rectangle Light RotZ');

// fog
const fog = new THREE.Fog(0x0000ff, 1, 4);
scene.fog = fog;

gui.add(fog, 'near').min(0).max(8).step(0.1).name('Fog Near');
gui.add(fog, 'far').min(0).max(8).step(0.1).name('Fog Far');

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 2.2, 0)
scene.add(camera)

gui.add(camera.position, 'y').min(0).max(5).step(0.01).name('Camera Position Y');

// Controls

const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 1, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x0000ff,0)

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0


const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    if(mixer)
    {
        mixer.update(deltaTime)
    }

    // update objects 

    logoRotation.x += rotationSpeed.x;
    logoRotation.y += rotationSpeed.y;
    logoRotation.z += rotationSpeed.z;
    
    tribusLogo.rotation.x = logoRotation.x
    tribusLogo.rotation.y = logoRotation.y
    tribusLogo.rotation.z = logoRotation.z


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

}

tick()