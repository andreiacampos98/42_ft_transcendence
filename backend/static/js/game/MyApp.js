
import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import  Stats  from 'three/addons/libs/stats.module.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Axis } from './Axis.js';
import { GameController } from './GameController.js';
import { REFRESH_RATE } from './macros.js';


var frameID;
var timeoutID;
/**
 * This class contains the application object
 */
export class MyApp  {
    /**
     * the constructor
     */
    constructor() {
        this.scene = null;

        // camera related attributes
        this.activeCamera = null;
        this.activeCameraName = null;
        this.lastCameraName = null;
        this.cameras = [];

        // other attributes
        this.renderer = null;
        this.controls = null;
		this.gui = null;
		this.gameController = null;

		this.canvas = document.querySelector('#canvas-container');
    }
    /**
     * initializes the application
     */
    init({playerData, enemyData, socket=null, gameType}) {
                
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x101010 );
		this.scene.add(new Axis(this));

		this.gameController = new GameController({ 
			playerData: playerData, 
			enemyData: enemyData,
			socket: socket, 
			gameType: gameType, 
		});
		this.scene.add(this.gameController);

		this.light = new THREE.PointLight('#FFFFFF', 100);
		this.light.position.set(0, 0, 5);
		this.scene.add(this.light);

		this.pointLightHelper = new THREE.PointLightHelper(this.light);
		this.scene.add(this.pointLightHelper);	

		this.gui = new GUI({ autoPlace: false });
		this.gui.domElement.id = 'gui';
		document.getElementById('main-content').appendChild(this.gui.domElement);

		this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom);
		
		const lightFolder = this.gui.addFolder('Light')
        lightFolder.add(this.light, 'intensity', 0, 100).name("Intensity")
        lightFolder.add(this.light.position, 'x', -30, 30).name("X")
        lightFolder.add(this.light.position, 'y', -30, 30).name("Y")
        lightFolder.add(this.light.position, 'z', -30, 30).name("Z")
        lightFolder.open();

        this.renderer = new THREE.WebGLRenderer({antialias:true});
        this.renderer.setPixelRatio( this.canvas.clientWidth / this.canvas.clientHeight );
        this.renderer.setClearColor("#000000");
        this.renderer.setSize( this.canvas.clientWidth, this.canvas.clientHeight );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // search for other alternatives

        this.initCameras();
        this.setActiveCamera('Perspective')

        this.canvas.appendChild( this.renderer.domElement );
				
        window.addEventListener('resize', this.onResize.bind(this), false );
    }

    /**
     * initializes all the cameras
     */
    initCameras() {
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;

        const perspective1 = new THREE.PerspectiveCamera( 75, aspect, 0.1, 1000 )
        perspective1.position.set(0, 0, 35);
        this.cameras['Perspective'] = perspective1;
    }

    /**
     * sets the active camera by name
     * @param {String} cameraName 
     */
    setActiveCamera(cameraName) {   
        this.activeCameraName = cameraName
        this.activeCamera = this.cameras[this.activeCameraName]
    }

    /**
     * updates the active camera if required
     * this function is called in the render loop
     * when the active camera name changes
     * it updates the active camera and the controls
     */
    updateCameraIfRequired() {

        if (this.lastCameraName !== this.activeCameraName) {
            this.lastCameraName = this.activeCameraName;
            this.activeCamera = this.cameras[this.activeCameraName]
            document.getElementById("camera").innerHTML = this.activeCameraName
           
            this.onResize()

            if (this.controls === null) {
                this.controls = new OrbitControls( this.activeCamera, this.renderer.domElement );
                this.controls.enableZoom = true;
                this.controls.update();
            }
            else {
                this.controls.object = this.activeCamera
            }
        }
    }

    /**
     * the window resize handler
     */
    onResize() {
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.activeCamera.aspect = window.innerWidth / window.innerHeight;
            this.activeCamera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        }
    }

    /**
    * the main render function. Called in a requestAnimationFrame loop
    */
    render () {
		const updateCallback = (() => {
			this.stats.begin();
			this.updateCameraIfRequired();
			
			this.controls.update();
			this.gameController.update();
			this.renderer.render(this.scene, this.activeCamera);
			
			frameID = requestAnimationFrame( this.render.bind(this) );
			
			this.lastCameraName = this.activeCameraName;
			this.stats.end();
		}).bind(this);

		timeoutID = setTimeout(updateCallback, REFRESH_RATE);
    }
}

window.addEventListener('popstate', function(event) {
    var r = confirm("You're about to leave the game! Are you sure?!");
	
    if (r == true) {
		document.getElementById('game-engine').remove();
		this.window.cancelAnimationFrame(frameID);
    }

}, false);